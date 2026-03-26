import { Router, Request, Response } from 'express';
import { WebpayPlus } from 'transbank-sdk';
import { Order } from '../models/Order';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Transbank test credentials (public, official from Transbank developers)
// For production, set env vars: TRANSBANK_COMMERCE_CODE + TRANSBANK_API_KEY
const isProduction = process.env.NODE_ENV === 'production' && process.env.TRANSBANK_COMMERCE_CODE;

// POST /api/transbank/create — Initiate WebPay Plus transaction
router.post('/create', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, orderId, totalAmount } = req.body;
    if (!totalAmount) return res.status(400).json({ message: 'No amount provided' });

    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';
    const returnUrl = `${origin}/checkout/transbank-result`;
    const buyOrder = `ORDER-${orderId || Date.now()}`.slice(0, 26);
    const sessionId = `SES-${req.user!.id}-${Date.now()}`.slice(0, 61);
    const amount = Math.round(totalAmount); // WebPay requires integer (CLP)

    let token: string, url: string;

    if (isProduction) {
      // Production: use real credentials from env
      const tx = new WebpayPlus.Transaction(
        new (require('transbank-sdk').Options)(
          new (require('transbank-sdk').WebpayPlus.MallTransaction)(),
          (require('transbank-sdk').Environment).Production
        )
      );
      const resp = await tx.create(buyOrder, sessionId, amount, returnUrl);
      token = resp.token;
      url = resp.url;
    } else {
      // Integration (test) mode — Transbank public test credentials
      const tx = new WebpayPlus.Transaction();
      const resp = await tx.create(buyOrder, sessionId, amount, returnUrl);
      token = resp.token;
      url = resp.url;
    }

    // Store the transbank token in the order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { stripeSessionId: `tbk_${token}`, paymentMethod: 'webpay' });
    }

    res.json({ token, url });
  } catch (err: unknown) {
    console.error('Transbank create error:', err);
    res.status(500).json({ message: 'WebPay error', error: String(err) });
  }
});

// POST /api/transbank/confirm — Called by frontend after redirect back from WebPay
router.post('/confirm', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { token_ws } = req.body;
    if (!token_ws) return res.status(400).json({ message: 'No token_ws' });

    const tx = new WebpayPlus.Transaction();
    const response = await tx.commit(token_ws);

    if (response.response_code === 0) {
      // Payment approved — find order by token and mark as processing
      await Order.findOneAndUpdate(
        { stripeSessionId: `tbk_${token_ws}` },
        { status: 'processing', paidAt: new Date() }
      );
      res.json({ success: true, response });
    } else {
      res.json({ success: false, response_code: response.response_code });
    }
  } catch (err) {
    console.error('Transbank confirm error:', err);
    res.status(500).json({ message: 'Confirmation error', error: String(err) });
  }
});

export default router;
