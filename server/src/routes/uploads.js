const express = require('express');
const multer = require('multer');
const path = require('path');
const { authRequired } = require('../middleware/auth');
const FileAsset = require('../models/FileAsset');
const { createError } = require('../utils/error');

const router = express.Router();
router.use(authRequired);

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const ts = Date.now();
		const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
		cb(null, `${ts}_${safe}`);
	}
});

const upload = multer({ storage });

router.post('/:workspaceId', upload.single('file'), async (req, res, next) => {
	try {
		if (!req.file) throw createError(400, 'File required');
		const url = `/uploads/${req.file.filename}`;
		const asset = await FileAsset.create({
			workspace: req.params.workspaceId,
			uploadedBy: req.user.id,
			filename: req.file.originalname,
			mimeType: req.file.mimetype,
			size: req.file.size,
			url
		});
		res.status(201).json({ item: asset });
	} catch (e) { next(e); }
});

module.exports = router;
