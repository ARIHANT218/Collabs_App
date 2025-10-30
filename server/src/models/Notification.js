const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
		document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
		type: { type: String, enum: ['mention', 'comment', 'activity'], required: true },
		payload: { type: Object, default: {} },
		readAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
