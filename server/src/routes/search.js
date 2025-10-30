const express = require('express');
const Document = require('../models/Document');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', async (req, res, next) => {
	try {
		const { q, workspaceId } = req.query;
		const filter = {};
		if (workspaceId) filter.workspace = workspaceId;
		if (q) filter.$text = { $search: q };
		const items = await Document.find(filter).select('title workspace updatedAt').limit(25).lean();
		res.json({ items });
	} catch (e) { next(e); }
});

module.exports = router;
