const jwt = require('jsonwebtoken'),
    secret = require('../config/env.config.js').jwt_secret,
    crypto = require('crypto');


exports.verifyRefreshBodyField = (req, res, next) => {
    if (req.body && req.body.refresh_token) {
        return next();
    } else {
        return res.status(400).send({ error: 'need to pass refresh_token field' });
    }
};

exports.validRefreshNeeded = (req, res, next) => {
    let b = new Buffer(req.body.refresh_token, 'base64');
    let refresh_token = b.toString();
    let hash = crypto.createHmac('sha512', req.jwt.refreshKey).update(req.jwt.userId + secret).digest("base64");
    if (hash === refresh_token) {
        req.body = req.jwt;
        return next();
    } else {
        return res.status(400).send({ error: 'Invalid refresh token' });
    }
};

exports.validJWTNeeded = (req, res, next) => {
    if ('authorization', req.headers['authorization']) {
        console.log(req.headers['authorization'])
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                console.log('tsy bearer ilay authorization')
                return res.status(401).send({ message: 'No Bearer authorization' });
            } else {
                console.log('marina bearer!!')
                req.jwt = jwt.verify(authorization[1], secret);
                return next();
            }
        } catch (err) {
            console.log(err)
            return res.status(403).send({ message: 'erreur bearer' });
        }
    } else {
        return res.status(401).send({ message: 'no authorization header' });
    }
};