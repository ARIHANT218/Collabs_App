const express = require('express');
const Activity = require('../models/Activity');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.post('/track', async (req, res, next) => {
	try {
		const { type, workspaceId, documentId, metadata } = req.body;
		const item = await Activity.create({ type, workspace: workspaceId, document: documentId, user: req.user.id, metadata });
		res.json({ item });
	} catch (e) { 
		console.error(e);
		return res.json({ error: 'Internal server error' });
	}	
});

router.get('/summary/:workspaceId', async (req, res, next) => {
	try {
		const workspaceId = req.params.workspaceId;
		const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const agg = await Activity.aggregate([
			{ $match: { workspace: require('mongoose').Types.ObjectId.createFromHexString(workspaceId), createdAt: { $gte: since } } },
			{ $group: { _id: { type: '$type' }, count: { $sum: 1 } } }
		]);
		res.json({ items: agg });
		} catch (e) { 
		console.error(e);
		return res.json({ error: 'Internal server error' });
	}
});

module.exports = router;
