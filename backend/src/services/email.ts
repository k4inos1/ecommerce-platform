import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
  },
});

interface OrderEmailData {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  shippingAddress?: { street?: string; city?: string; country?: string };
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email skipped — EMAIL_USER/EMAIL_PASS not configured');
    return;
  }

  const itemRows = data.items.map(i =>
    `<tr><td style="padding:8px 12px;color:#cbd5e1">${i.name} ×${i.quantity}</td><td style="padding:8px 12px;text-align:right;color:#fff;font-family:monospace">$${(i.price * i.quantity).toFixed(2)}</td></tr>`
  ).join('');

  const html = `
  <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="background:#0a0a14;font-family:Inter,sans-serif;margin:0;padding:20px">
    <div style="max-width:520px;margin:0 auto;background:#0f0f1a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">⚡</div>
        <h1 style="color:#fff;margin:0;font-size:22px">¡Orden Confirmada!</h1>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">Gracias por tu compra, ${data.customerName}</p>
      </div>
      <div style="padding:28px">
        <p style="color:#6b7280;font-size:12px;font-family:monospace;margin:0 0 20px">
          ID de orden: <span style="color:#818cf8">#${String(data.orderId).slice(-8).toUpperCase()}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:10px;overflow:hidden;margin-bottom:20px">
          <thead><tr style="background:rgba(255,255,255,0.05)">
            <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase">Producto</th>
            <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase">Total</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="border-top:1px solid rgba(255,255,255,0.07)">
            <td style="padding:12px;color:#fff;font-weight:bold">Total</td>
            <td style="padding:12px;text-align:right;color:#818cf8;font-weight:bold;font-family:monospace;font-size:16px">$${data.totalAmount.toFixed(2)}</td>
          </tr></tfoot>
        </table>
        ${data.shippingAddress ? `<div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:14px;margin-bottom:20px">
          <p style="color:#6b7280;font-size:11px;text-transform:uppercase;margin:0 0 6px">Dirección de envío</p>
          <p style="color:#cbd5e1;font-size:14px;margin:0">${data.shippingAddress.street || ''}, ${data.shippingAddress.city || ''}, ${data.shippingAddress.country || ''}</p>
        </div>` : ''}
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0">
          Recibirás una actualización cuando tu pedido sea enviado.
        </p>
      </div>
      <div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05)">
        <p style="color:#374151;font-size:11px;margin:0">TechStore · Pagos seguros con Stripe SSL</p>
      </div>
    </div>
  </body></html>`;

  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to: data.to,
    subject: `✅ Orden confirmada #${String(data.orderId).slice(-8).toUpperCase()} — TechStore`,
    html,
  });

  console.log(`📧 Confirmation email sent to ${data.to}`);
}
