const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
	{
		workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
		type: { type: String, required: true },
		metadata: { type: Object, default: {} }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);
