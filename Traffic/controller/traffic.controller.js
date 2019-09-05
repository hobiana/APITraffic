const TrafficModel = require('../models/traffic.models');
import crypto from 'crypto';


exports.getById = (req, res) => {
    TrafficModel.findById(req.params.userId).then((result) => {
        res.status(200).send(result);
    });
};

exports.list = async (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
            page = page - 1;
            if (page < 0) page = 0
        }
    }
    let rep = await TrafficModel.analyse_traffic(req.query.origin, req.query.destination, req.query.test);
    return res.status(200).send(rep);
};