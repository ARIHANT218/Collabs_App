const express = require('express');
const Workspace = require('../models/Workspace');
const { authRequired } = require('../middleware/auth');
const { createError } = require('../utils/error');
const { getWorkspaceRole, assertIsAdmin } = require('../utils/roles');

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res, next) => {
	try {
		const userId = req.user.id;
		const items = await Workspace.find({ $or: [ { owner: userId }, { 'members.user': userId } ] }).lean();
		res.json({ items });
	} catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		if (!name) throw createError(400, 'Name required');
		const ws = await Workspace.create({ name, description, owner: req.user.id, members: [ { user: req.user.id, role: 'Admin' } ] });
		res.status(201).json({ item: ws });
	} catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const role = await getWorkspaceRole(req.user.id, req.params.id);
		assertIsAdmin(role);
		const ws = await Workspace.findById(req.params.id);
		if (!ws) throw createError(404, 'Not found');
		if (name) ws.name = name;
		if (description) ws.description = description;
		await ws.save();
		res.json({ item: ws });
	} catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
	try {
		const role = await getWorkspaceRole(req.user.id, req.params.id);
		assertIsAdmin(role);
		const ws = await Workspace.findById(req.params.id);
		if (!ws) throw createError(404, 'Not found');
		await ws.deleteOne();
		res.json({ ok: true });
	} catch (e) { next(e); }
});

router.post('/:id/members', async (req, res, next) => {
	try {
		const { userId, role } = req.body;
		const myRole = await getWorkspaceRole(req.user.id, req.params.id);
		assertIsAdmin(myRole);
		const ws = await Workspace.findById(req.params.id);
		if (!ws) throw createError(404, 'Not found');
		const idx = ws.members.findIndex(m => m.user.toString() === userId);
		if (idx >= 0) ws.members[idx].role = role; else ws.members.push({ user: userId, role });
		await ws.save();
		res.json({ item: ws });
	} catch (e) { next(e); }
});

// Admin can remove a member from workspace
router.delete('/:id/members/:userId', async (req, res, next) => {
	try {
		const ws = await Workspace.findById(req.params.id);
		if (!ws) throw createError(404, 'Not found');
		const myRole = await getWorkspaceRole(req.user.id, ws._id);
		assertIsAdmin(myRole);
		const userId = req.params.userId;
		ws.members = ws.members.filter(m => m.user.toString() !== userId);
		await ws.save();
		res.json({ item: ws });
	} catch(e) { next(e); }
});

module.exports = router;
