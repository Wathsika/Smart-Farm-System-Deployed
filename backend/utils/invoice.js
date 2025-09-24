// utils/invoice.js
let pdfKitModulePromise;

const loadPdfKit = async () => {
  if (!pdfKitModulePromise) {
    pdfKitModulePromise = import("pdfkit")
      .then((m) => m.default || m)
      .catch((err) => {
        console.error("Failed to load pdfkit:", err);
        throw err;
      });
  }
  return pdfKitModulePromise;
};

const toPlainObject = (order) => {
  if (!order) return null;
  if (typeof order.toObject === "function") {
    return order.toObject({ depopulate: true, virtuals: true });
  }
  return order;
};

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;

const brandDetails = () => {
  const name = process.env.INVOICE_BRAND_NAME || "GreenLeaf Farm";
  const address =
    process.env.INVOICE_BRAND_ADDRESS ||
    "10/F, Ginimellagaha, Baddegama, Sri Lanka";
  const email =
    process.env.INVOICE_BRAND_EMAIL || process.env.SMTP_FROM_EMAIL || "";
  const phone = process.env.INVOICE_BRAND_PHONE || "";
  const contactLine = [email, phone].filter(Boolean).join(" | ");
  return { name, address, contactLine };
};

const resolveInvoiceMeta = (order) => {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date();
  const invoiceId =
    order?.orderNumber ||
    order?.stripeSessionId?.slice(-10)?.toUpperCase() ||
    String(order?._id || "").slice(-8).toUpperCase();
  return { createdAt, invoiceId };
};

const TABLE_LEFT = 50;
const TABLE_RIGHT = 550;
const TABLE_WIDTH = TABLE_RIGHT - TABLE_LEFT;
const TABLE_COLUMN_WIDTHS = [260, 80, 80, 80];
const TABLE_COLUMN_ALIGNMENTS = ["left", "center", "right", "right"];

const drawTableRow = (doc, y, columns) => {
let currentX = TABLE_LEFT;
  columns.forEach((text, index) => {
    const width = TABLE_COLUMN_WIDTHS[index] || 100;
    doc.text(String(text ?? "—"), currentX, y, {
      width,
      align: TABLE_COLUMN_ALIGNMENTS[index] || "left",
    });
    currentX += width;
  });
};

export const generateInvoicePdf = async (rawOrder) => {
  const order = toPlainObject(rawOrder);
  if (!order) throw new Error("Order data is required to generate invoice.");

  const PDFDocument = await loadPdfKit();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on("data", (d) => buffers.push(d));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const brand = brandDetails();
    const { createdAt, invoiceId } = resolveInvoiceMeta(order);
    const customer = order.customer || {};
    const shipping = order.shippingAddress || {};
    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
    const discountAmount = Number(order?.discount?.amount || 0);
    const subTotal = Number(order?.totalPrice || 0) + discountAmount;

    // Header
    const headerTop = doc.page.margins.top;
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#1f7a1f").text(brand.name, 50, headerTop);
    doc.font("Helvetica").fontSize(10).fillColor("#000000");
    if (brand.address) doc.text(brand.address, 50, doc.y + 2);
    if (brand.contactLine) doc.text(brand.contactLine, 50, doc.y + 2);

    doc.font("Helvetica-Bold").fontSize(16).fillColor("#4b5563")
      .text("Invoice", 350, headerTop, { align: "right", width: 200 });
    doc.font("Helvetica").fontSize(10).fillColor("#000000")
      .text(`Invoice #: ${invoiceId || "—"}`, 350, headerTop + 24, { align: "right", width: 200 })
      .text(`Date: ${createdAt.toLocaleDateString()}`, 350, headerTop + 38, { align: "right", width: 200 });

    doc.moveDown();
    doc.y = Math.max(doc.y, headerTop + 90);

    // Bill To + Order details
    const sectionTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(12).text("Bill To:", 50, sectionTop);
    doc.font("Helvetica").fontSize(10)
      .text(customer.name || "—", 50, sectionTop + 18)
      .text(shipping.addressLine1 || "—", 50, sectionTop + 32)
      .text([shipping.city, shipping.postalCode].filter(Boolean).join(", ") || "—", 50, sectionTop + 46)
      .text(customer.email || "—", 50, sectionTop + 60);

    doc.font("Helvetica-Bold").fontSize(12).text("Order Details:", 350, sectionTop);
    doc.font("Helvetica").fontSize(10)
      .text(`Order Status: ${order.status || "—"}`, 350, sectionTop + 18, { width: 200 })
      .text(`Payment Method: ${order.paymentMethod || "Stripe (Card)"}`, 350, sectionTop + 32, { width: 200 });

    doc.y = sectionTop + 80;

    // Table header
    const tableTop = doc.y + 10;
   doc
      .strokeColor("#16a34a")
      .lineWidth(1)
      .moveTo(TABLE_LEFT, tableTop - 6)
      .lineTo(TABLE_RIGHT, tableTop - 6)
      .stroke();
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
    drawTableRow(doc, tableTop, ["Item Description", "Quantity", "Unit Price", "Total"]);
    doc
      .strokeColor("#d1d5db")
      .lineWidth(0.5)
      .moveTo(TABLE_LEFT, tableTop + 14)
      .lineTo(TABLE_RIGHT, tableTop + 14)
      .stroke();

    // Rows
    doc.font("Helvetica").fontSize(10).fillColor("#000000");
    let rowY = tableTop + 22;
    if (items.length === 0) {
      doc.text("No items found", TABLE_LEFT, rowY, { width: TABLE_WIDTH, align: "center" });
      rowY += 18;
    } else {
      items.forEach((item, i) => {
        const qty = Number(item?.qty || 0);
        const price = Number(item?.price || 0);
        drawTableRow(doc, rowY, [
          item?.name || `Item ${i + 1}`,
          qty.toString(),
          formatCurrency(price),
          formatCurrency(price * qty),
        ]);
        rowY += 18;
       doc
          .strokeColor("#f3f4f6")
          .moveTo(TABLE_LEFT, rowY - 4)
          .lineTo(TABLE_RIGHT, rowY - 4)
          .stroke();
      });
    }

    doc.y = rowY + 10;

    // Totals
    const totalsXLabel = 350;
    const totalsXValue = 450;
    let totalsY = doc.y;

    doc.font("Helvetica-Bold").fontSize(10).text("Subtotal", totalsXLabel, totalsY, { width: 100, align: "right" });
    doc.font("Helvetica").text(formatCurrency(subTotal), totalsXValue, totalsY, { width: 100, align: "right" });
    totalsY += 16;

    if (discountAmount > 0) {
      doc.font("Helvetica-Bold").text("Discount", totalsXLabel, totalsY, { width: 100, align: "right" });
      doc.font("Helvetica").fillColor("#b91c1c")
        .text(`- ${formatCurrency(discountAmount)}`, totalsXValue, totalsY, { width: 100, align: "right" });
      doc.fillColor("#000000");
      totalsY += 16;
    }

    doc.font("Helvetica-Bold").fontSize(12).text("Total", totalsXLabel, totalsY, { width: 100, align: "right" });
    doc.text(formatCurrency(order?.totalPrice || 0), totalsXValue, totalsY, { width: 100, align: "right" });
    totalsY += 24;

    doc.y = totalsY + 10;
    doc.strokeColor("#d1d5db").moveTo(TABLE_LEFT, doc.y).lineTo(TABLE_RIGHT, doc.y).stroke();
    doc.y += 20;

    // Footer
   doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280");
    const footerY = doc.y;
    doc.text("Thank you for your business!", TABLE_LEFT, footerY, {
      width: TABLE_WIDTH,
      align: "center",
    });
    doc.text("If you have any questions about this invoice, please contact us.", TABLE_LEFT, doc.y + 4, {
      width: TABLE_WIDTH,
      align: "center",
    });

    doc.end();
  });
};
