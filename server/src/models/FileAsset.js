const mongoose = require('mongoose');

const FileAssetSchema = new mongoose.Schema(
	{
		workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		filename: { type: String, required: true },
		mimeType: { type: String, required: true },
		size: { type: Number, required: true },
		url: { type: String, required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('FileAsset', FileAssetSchema);
