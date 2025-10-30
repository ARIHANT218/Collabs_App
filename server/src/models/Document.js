const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema(
	{
		content: { type: Object, default: {} },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		message: { type: String }
	},
	{ timestamps: true, _id: false }
);

const DocumentSchema = new mongoose.Schema(
	{
		workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
		title: { type: String, required: true, index: true },
		content: { type: Object, default: {} },
		searchableText: { type: String, default: '' },
		parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
		path: { type: [mongoose.Schema.Types.ObjectId], default: [] },
		versions: { type: [VersionSchema], default: [] },
		mentions: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
	},
	{ timestamps: true }
);

// Create text index for full-text search (title + searchableText)
DocumentSchema.index({ title: 'text', searchableText: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);
