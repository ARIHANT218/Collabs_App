const express = require('express');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', async (req, res, next) => {
	try {
		const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
		res.json({ items });
	} catch (e) { next(e); }
});

router.post('/:id/read', async (req, res, next) => {
	try {
		const n = await Notification.findOne({ _id: req.params.id, user: req.user.id });
		if (!n) return res.status(404).json({ ok: false });
		n.readAt = new Date();
		await n.save();
		res.json({ item: n });
	} catch (e) { next(e); }
});

module.exports = router;
