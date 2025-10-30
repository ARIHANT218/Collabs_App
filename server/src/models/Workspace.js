const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], required: true }
	},
	{ _id: false }
);

const WorkspaceSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		members: { type: [MemberSchema], default: [] }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Workspace', WorkspaceSchema);
