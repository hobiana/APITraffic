const TrafficModel = require('../models/traffic.models');
import crypto from 'crypto';


exports.getById = (req, res) => {
    TrafficModel.findById(req.params.userId).then((result) => {
        res.status(200).send(result);
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
    return TrafficModel.list(limit, page);
};