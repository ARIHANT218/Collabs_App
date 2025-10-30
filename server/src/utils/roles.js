const Workspace = require('../models/Workspace');
const { createError } = require('./error');

async function getWorkspaceRole(userId, workspaceId) {
	const ws = await Workspace.findById(workspaceId).lean();
	if (!ws) throw createError(404, 'Workspace not found');
	if (ws.owner.toString() === userId) return 'Admin';
	const member = ws.members.find(m => m.user.toString() === userId);
	return member ? member.role : null;
}

function assertCanRead(role) {
	if (!role) throw createError(403, 'No access');
}

function assertCanWrite(role) {
	if (!role) throw createError(403, 'No access');
	if (role === 'Viewer') throw createError(403, 'Editors only');
}

function assertIsAdmin(role) {
	if (role !== 'Admin') throw createError(403, 'Admins only');
}

module.exports = { getWorkspaceRole, assertCanRead, assertCanWrite, assertIsAdmin };
