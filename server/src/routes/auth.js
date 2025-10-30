const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');		
const fetch = require('node-fetch');

const qs = require('querystring');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
	return jwt.sign(
		{ id: user._id.toString(), email: user.email, role: user.role, name: user.name },
		process.env.JWT_SECRET
	);
}

router.get('/me', authRequired, async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).lean();
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, role = 'Editor', inviteCode } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ error: 'Missing fields' });
		}
		if (!['Admin','Editor','Viewer'].includes(role)) {
			return res.status(400).json({ error: 'Invalid role' });
		}
		if (role === 'Admin') {
			if (!inviteCode || inviteCode !== (process.env.ADMIN_INVITE_CODE || '')) {
				return res.status(403).json({ error: 'Admin invite code required' });
			}
		}
		const exists = await User.findOne({ email });
		if (exists) {
			return res.status(409).json({ error: 'Email already in use' });
		}
		const user = new User({ name, email, role });
		await user.setPassword(password);
		await user.save();
		const token = signToken(user);
		res.json({ user: { id: user._id, name, email, role: user.role }, token });
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { email, password, inviteCode } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		const ok = await user.validatePassword(password || '');
		if (!ok) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		if (user.role === 'Admin') {
			if (!inviteCode || inviteCode !== (process.env.ADMIN_INVITE_CODE || '')) {
				return res.status(403).json({ error: 'Admin invite code required' });
			}
		}
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: 'Internal server error' });
	}
});
//  GOOGLE OAUTH 
router.get('/oauth/google/start', async (req, res) => {
	const params = new URLSearchParams({
		client_id: process.env.GOOGLE_CLIENT_ID,
		redirect_uri: `${process.env.OAUTH_CALLBACK_BASE_URL}/google/callback`,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'online',
		prompt: 'consent'
	});
	res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/oauth/google/callback', async (req, res, next) => {
	try {
		const code = req.query.code;
		if (!code) return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=google_no_code`);
		const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: qs.stringify({
				code,
				client_id: process.env.GOOGLE_CLIENT_ID,
				client_secret: process.env.GOOGLE_CLIENT_SECRET,
				redirect_uri: `${process.env.OAUTH_CALLBACK_BASE_URL}/google/callback`,
				grant_type: 'authorization_code'
			})
		});
		const tokens = await tokenRes.json();
		if (!tokens.access_token) return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=google_token`);
		const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: { Authorization: `Bearer ${tokens.access_token}` }
		});
		const profile = await userRes.json();
		const email = profile.email;
		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({ name: profile.name || email.split('@')[0], email, avatarUrl: profile.picture, provider: 'google', role: 'Editor' });
		}
		const token = signToken(user);
		res.redirect(`${process.env.CLIENT_ORIGIN}/login?token=${encodeURIComponent(token)}`);
	} catch (e) { next(e); }
});

//  GITHUB OAUTH 
router.get('/oauth/github/start', async (req, res) => {
	const params = new URLSearchParams({
		client_id: process.env.GITHUB_CLIENT_ID,
		redirect_uri: `${process.env.OAUTH_CALLBACK_BASE_URL}/github/callback`,
		scope: 'read:user user:email'
	});
	res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/oauth/github/callback', async (req, res, next) => {
	try {
		const code = req.query.code;
		if (!code) return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=github_no_code`);
		const accessRes = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			body: JSON.stringify({
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
				redirect_uri: `${process.env.OAUTH_CALLBACK_BASE_URL}/github/callback`
			})
		});
		const ghTokens = await accessRes.json();
		if (!ghTokens.access_token) return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=github_token`);
		const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${ghTokens.access_token}`, 'User-Agent': 'collabs-app' } });
		const ghUser = await userRes.json();
		let email = ghUser.email;
		if (!email) {
			const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${ghTokens.access_token}`, 'User-Agent': 'collabs-app', 'Accept': 'application/vnd.github+json' } });
			const emails = await emailsRes.json();
			const primary = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) : null;
			email = primary?.email || emails?.[0]?.email;
		}
		if (!email) return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=github_email`);
		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({ name: ghUser.name || ghUser.login || email.split('@')[0], email, avatarUrl: ghUser.avatar_url, provider: 'github', role: 'Editor' });
		}
		const token = signToken(user);
		res.redirect(`${process.env.CLIENT_ORIGIN}/login?token=${encodeURIComponent(token)}`);
	} catch (e) { next(e); }
});

router.post('/oauth/:provider/callback', async (req, res, next) => {
	try {
		const { provider } = req.params;
		const { email, name, avatarUrl } = req.body;
		if (!email) {
			return res.status(400).json({ error: 'Email required' });
		}
		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({ name: name || email.split('@')[0], email, avatarUrl, provider, role: 'Editor' });
		}
		const token = signToken(user);
		res.json({ user: { id: user._id, name: user.name, email, role: user.role }, token });
	} catch (e) { 
		console.error(e);
		return res.status(500).json({ error: 'Internal server error' });


	 }
});

module.exports = router;
