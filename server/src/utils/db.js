const mongoose = require('mongoose');

async function connectDb() {
	const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/collabs';
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, { autoIndex: true });
	console.log('Mongo connected');
	try {
		await Promise.all([]);
	} catch (e) {
		console.warn('Index init warning:', e.message);
	}
}

module.exports = { connectDb };
