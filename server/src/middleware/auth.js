const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error');

function authRequired(req, _res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	const cookieToken = req.cookies?.token;
	const jwtToken = token || cookieToken;
	if (!jwtToken) return next(createError(401, 'Authentication required'));
	try {
		const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
		req.user = payload;
		return next();
	} catch (_e) {
		return next(createError(401, 'Invalid token'));
	}
}

function requireRole(...roles) {
	return (req, _res, next) => {
		if (!req.user) return next(createError(401, 'Authentication required'));
		if (!roles.includes(req.user.role)) return next(createError(403, 'Forbidden'));
		next();
	};
}

module.exports = { authRequired, requireRole };
