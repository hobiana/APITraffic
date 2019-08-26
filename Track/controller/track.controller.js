const TrackModel = require('../models/track.model');

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    TrackModel.getTracks(req.params.userId,limit, page).then((result) => {
        res.status(200).send(result);
    })
 };

 exports.createTrack = (req, res) => {
    let userId = req.id;
    TrackModel.createTrack(req.params.userId,req.body).then((result) => {
        res.status(200).send(result);
    })
 };