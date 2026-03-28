import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Product } from '../models/Product';

const router = Router();

// GET /api/users/profile
router.get('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.postalCode = req.body.postalCode !== undefined ? req.body.postalCode : user.postalCode;
    user.country = req.body.country !== undefined ? req.body.country : user.country;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      postalCode: updatedUser.postalCode,
      country: updatedUser.country,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// ─── Wishlist ────────────────────────────────────────────────────────────────

// GET /api/users/wishlist — get current user's wishlist (populated)
router.get('/wishlist', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/users/wishlist/:productId — add product to wishlist
router.post('/wishlist/:productId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $addToSet: { wishlist: req.params.productId } },
      { new: true }
    ).populate('wishlist');

    res.json({ message: 'Added to wishlist', wishlist: user?.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/users/wishlist/:productId — remove product from wishlist
router.delete('/wishlist/:productId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    ).populate('wishlist');

    res.json({ message: 'Removed from wishlist', wishlist: user?.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
