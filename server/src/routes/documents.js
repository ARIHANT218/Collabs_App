const express = require('express');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { createError } = require('../utils/error');
const { getWorkspaceRole, assertCanRead, assertCanWrite } = require('../utils/roles');

const router = express.Router();
router.use(authRequired);

async function ensureWorkspaceAccess(userId, workspaceId, write = false) {
	const role = await getWorkspaceRole(userId, workspaceId);
	if (write) assertCanWrite(role); else assertCanRead(role);
}

router.get('/:workspaceId', async (req, res, next) => {
	try {
		await ensureWorkspaceAccess(req.user.id, req.params.workspaceId, false);
		const items = await Document.find({ workspace: req.params.workspaceId }).lean();
		res.json({ items });
	} catch (e) { next(e); }
});

router.post('/:workspaceId', async (req, res, next) => {
	try {
		const { title, content, parent } = req.body;
		if (!title) throw createError(400, 'Title required');
		await ensureWorkspaceAccess(req.user.id, req.params.workspaceId, true);
		let path = [];
		if (parent) {
			const p = await Document.findById(parent).lean();
			if (!p) throw createError(400, 'Parent not found');
			path = [ ...p.path, p._id ];
		}
		const searchableText = typeof content?.text === 'string' ? content.text : '';
		const doc = await Document.create({ workspace: req.params.workspaceId, title, content: content || {}, searchableText, parent: parent || null, path, versions: [] });
		res.status(201).json({ item: doc });
	} catch (e) { next(e); }
});

// Get single document
router.get('/item/:id', async (req, res, next) => {
	try {
		const doc = await Document.findById(req.params.id).lean();
		if (!doc) throw createError(404, 'Not found');
		await ensureWorkspaceAccess(req.user.id, doc.workspace.toString(), false);
		res.json({ item: doc });
	} catch (e) { next(e); }
});

// Update document + mentions + versioning
router.put('/:id', async (req, res, next) => {
	try {
		const { title, content, message, mentions } = req.body;
		const doc = await Document.findById(req.params.id);
		if (!doc) throw createError(404, 'Not found');
		await ensureWorkspaceAccess(req.user.id, doc.workspace.toString(), true);
		if (typeof title === 'string') doc.title = title;
		if (content) {
			doc.versions.push({ content: doc.content, updatedBy: req.user.id, message: message || 'update' });
			doc.content = content;
			doc.searchableText = typeof content?.text === 'string' ? content.text : doc.searchableText;
		}
		if (Array.isArray(mentions) && mentions.length) {
			doc.mentions = mentions;
			await Notification.insertMany(mentions.map(userId => ({ user: userId, workspace: doc.workspace, document: doc._id, type: 'mention', payload: { by: req.user.id } })));
		}
		await doc.save();
		req.app.get('io').to(`doc:${doc._id.toString()}`).emit('doc:updated', { id: doc._id.toString() });
		res.json({ item: doc });
	} catch (e) { next(e); }
});

// Versions list
router.get('/:id/versions', async (req, res, next) => {
	try {
		const doc = await Document.findById(req.params.id).lean();
		if (!doc) throw createError(404, 'Not found');
		await ensureWorkspaceAccess(req.user.id, doc.workspace.toString(), false);
		res.json({ items: doc.versions || [] });
	} catch (e) { next(e); }
});

// Revert to version by index
router.post('/:id/revert/:index', async (req, res, next) => {
	try {
		const idx = parseInt(req.params.index, 10);
		const doc = await Document.findById(req.params.id);
		if (!doc) throw createError(404, 'Not found');
		await ensureWorkspaceAccess(req.user.id, doc.workspace.toString(), true);
		if (!Array.isArray(doc.versions) || idx < 0 || idx >= doc.versions.length) throw createError(400, 'Invalid version index');
		const target = doc.versions[idx];
		doc.versions.push({ content: doc.content, updatedBy: req.user.id, message: `revert to ${idx}` });
		doc.content = target.content;
		doc.searchableText = typeof target.content?.text === 'string' ? target.content.text : doc.searchableText;
		await doc.save();
		res.json({ item: doc });
	} catch (e) { next(e); }
});

// Delete
router.delete('/:id', async (req, res, next) => {
	try {
		const doc = await Document.findById(req.params.id);
		if (!doc) throw createError(404, 'Not found');
		await ensureWorkspaceAccess(req.user.id, doc.workspace.toString(), true);
		await doc.deleteOne();
		res.json({ ok: true });
	} catch (e) { next(e); }
});

module.exports = router;
