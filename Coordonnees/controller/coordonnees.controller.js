const CoordonneesModel = require('../models/coordonnees.models');
import crypto from 'crypto';

exports.insert = (req, res) => {
    CoordonneesModel.createCoords(req.body)
        .then((result) => {
            res.status(201).send({ id: result._id });
        });
};


exports.getById = (req, res) => {
    CoordonneesModel.findById(req.params.userId).then((result) => {
        res.status(200).send(result);
    });
};

exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }
    CoordonneesModel.patchUser(req.params.userId, req.body).then((result) => {
        res.status(204).send({});
    });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    CoordonneesModel.list(limit, page).then((result) => {
        res.status(200).send(result);
    })
};

exports.removeById = (req, res) => {
    CoordonneesModel.removeById(req.params.userId)
        .then((result) => {
            res.status(204).send({});
        });
};