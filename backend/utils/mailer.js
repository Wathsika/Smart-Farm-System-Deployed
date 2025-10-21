// utils/mailer.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const resolveFromAddress = () => {
  const fromEmail =
    process.env.SMTP_FROM_EMAIL || "greenleaffarm.invoice@gmail.com";
  const brand = process.env.SMTP_FROM_NAME || "GreenLeaf Farm";
  return `${brand} <${fromEmail}>`;
};

const resolveBrandName = () => process.env.SMTP_FROM_NAME || "GreenLeaf Farm";

export const sendOrderEmail = async (order, pdfBuffer) => {
  if (!order?.customer?.email) {
    console.warn("Mailer skipped: order.customer.email missing.");
    return;
  }

  const to = order.customer.email;
  const from = resolveFromAddress();
  const brandName = resolveBrandName();
  const orderNumber =
    order.orderNumber || order.stripeSessionId || order._id || "";

  const subject = `Your ${brandName} order ${
    orderNumber ? `#${orderNumber}` : ""
  } invoice`;

  const html = `
    <p>Hi ${order?.customer?.name || "Customer"},</p>
    <p>Thank you for your purchase! Attached is the invoice for your recent order ${
      orderNumber ? `<strong>#${orderNumber}</strong>` : ""
    }.</p>
    <p>Best regards,<br/>${brandName}</p>
  `;

  const attachments =
    Buffer.isBuffer(pdfBuffer) || pdfBuffer instanceof Uint8Array
      ? [
          {
            filename: `invoice-${orderNumber || "receipt"}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [];

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      attachments,
    });
    console.log("✅ Email sent successfully via Resend");
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};
