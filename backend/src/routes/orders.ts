import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { sendOrderConfirmation } from '../services/email';
import { User } from '../models/User';

const router = Router();

// POST /api/orders - Create order (authenticated users)
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No order items' });

    const calculatedTotal = totalAmount || items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0
    );

    const order = await Order.create({
      user: req.user!.id,
      items,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
    });

    // Send confirmation email async (don't block response)
    try {
      const user = await User.findById(req.user!.id).select('email name');
      if (user?.email) {
        sendOrderConfirmation({
          to: user.email,
          customerName: user.name || shippingAddress?.name || 'Cliente',
          orderId: String(order._id),
          items,
          totalAmount: calculatedTotal,
          shippingAddress,
        }).catch(e => console.warn('Email failed:', e.message));
      }
    } catch { /* silent */ }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
});

// GET /api/orders/my - Current user's orders
router.get('/my', protect, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/orders/:id - Order detail
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only owner or admin can see the order
    if (String(order.user) !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/orders/:id/status - Admin: update order status
router.patch('/:id/status', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Trigger email if status is "shipped"
    if (status === 'shipped' && order.user && (order.user as any).email) {
      const u = order.user as any;
      import('../services/email').then(m => {
        m.sendOrderShippedEmail(u.email, u.name || 'Cliente', String(order._id))
          .catch(e => console.warn('Shipping email failed:', e.message));
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/orders - Admin: all orders
router.get('/', protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
