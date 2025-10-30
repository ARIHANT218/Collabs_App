const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String },
		avatarUrl: { type: String },
		provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
		role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Viewer' }
	},
	{ timestamps: true }
);

UserSchema.methods.setPassword = async function (password) {
	this.passwordHash = await bcrypt.hash(password, 10);
};

UserSchema.methods.validatePassword = async function (password) {
	if (!this.passwordHash) return false;
	return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
