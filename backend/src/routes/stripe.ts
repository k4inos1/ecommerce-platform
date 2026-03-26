import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// POST /api/stripe/checkout-session
// Creates a Stripe Checkout Session and returns the URL to redirect to
router.post('/checkout-session', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, orderId } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items' });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image?.startsWith('http') ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId || ''}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      customer_email: undefined, // set via session metadata
      metadata: {
        userId: req.user?.id || '',
        orderId: orderId || '',
      },
      shipping_address_collection: {
        allowed_countries: ['CL', 'AR', 'CO', 'MX', 'PE', 'ES', 'US'],
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: 'Stripe error', error: String(err) });
  }
});

// POST /api/stripe/webhook — Stripe sends events here
// Must have raw body (configured in index.ts with express.raw)
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    event = secret
      ? stripe.webhooks.constructEvent(req.body, sig, secret)
      : JSON.parse(req.body.toString());
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'processing',
        stripeSessionId: session.id,
        paidAt: new Date(),
      });
      console.log(`✅ Order ${orderId} marked as paid via Stripe`);
    }
  }

  res.json({ received: true });
});

export default router;
