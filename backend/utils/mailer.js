// utils/mailer.js
let transporter;
let nodemailerModulePromise;

const loadNodemailer = async () => {
  if (!nodemailerModulePromise) {
    nodemailerModulePromise = import("nodemailer")
      .then((m) => m.default || m)
      .catch((err) => {
        console.error("Failed to load nodemailer:", err);
        throw err;
      });
  }
  return nodemailerModulePromise;
};

const createTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    console.warn("Mailer skipped: SMTP_HOST or SMTP_PORT is not defined.");
    return null;
  }

  const port = Number(SMTP_PORT) || 587;
  const secure =
    typeof SMTP_SECURE === "string"
      ? SMTP_SECURE.toLowerCase() === "true"
      : port === 465;

  const nodemailer = await loadNodemailer();
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  return transporter;
};

const resolveFromAddress = () => {
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  if (!fromAddress) {
    console.warn("Mailer skipped: SMTP_FROM_EMAIL or SMTP_USER must be provided.");
    return null;
  }
  const brand =
    process.env.INVOICE_BRAND_NAME ||
    process.env.SMTP_FROM_NAME ||
    "Smart Farm System";
  return `${brand} <${fromAddress}>`;
};

const resolveBrandName = () =>
  process.env.INVOICE_BRAND_NAME || "Smart Farm System";

export const sendOrderEmail = async (order, pdfBuffer) => {
  if (!order) {
    console.warn("Mailer skipped: order payload is missing.");
    return;
  }
  const to = order?.customer?.email;
  if (!to) {
    console.warn("Mailer skipped: order.customer.email is not available.");
    return;
  }

  const transporterInstance = await createTransporter();
  if (!transporterInstance) return;

  const from = resolveFromAddress();
  if (!from) return;

  const brandName = resolveBrandName();
  const orderNumber = order.orderNumber || order.stripeSessionId || order._id || "";
  const customerName = order?.customer?.name || "Customer";

  const subject = `Your ${brandName} order ${orderNumber ? `#${orderNumber}` : ""} invoice`.trim();
  const plainTextBody = [
    `Hi ${customerName},`,
    "",
    "Thank you for your purchase! Attached is the invoice for your recent order.",
    orderNumber ? `Order reference: ${orderNumber}` : null,
    "",
    "Best regards,",
    brandName,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <p>Hi ${customerName},</p>
    <p>Thank you for your purchase! Attached is the invoice for your recent order${
      orderNumber ? ` <strong>#${orderNumber}</strong>` : ""
    }.</p>
    ${orderNumber ? `<p>Order reference: <strong>${orderNumber}</strong></p>` : ""}
    <p>Best regards,<br/>${brandName}</p>
  `;

  const hasAttachment =
    Buffer.isBuffer(pdfBuffer) || pdfBuffer instanceof Uint8Array;

  const attachments = hasAttachment
    ? [{ filename: `invoice-${orderNumber || "receipt"}.pdf`, content: pdfBuffer }]
    : [];

  await transporterInstance.sendMail({
    from,
    to,
    subject,
    text: plainTextBody,
    html: htmlBody,
    attachments,
  });
};
