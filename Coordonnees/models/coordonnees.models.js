import Config from '../../config/database'
const mongoose = require('mongoose');
mongoose.connect(Config.database);
const Schema = mongoose.Schema;

const coordsSchema = new Schema({
    userid: Schema.Types.ObjectId,
    datetime: Date,
    speed: Number,
    location: {
        type: { type: String },
        coordinates: []
    }
});


coordsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
coordsSchema.set('toJSON', {
    virtuals: true
});

function getModels(schemaName, userSchema) {
    try {
        return mongoose.model(schemaName, userSchema);
    } catch (e) {
        return mongoose.model(schemaName);
    }
}

const Coords = getModels('location', coordsSchema);

exports.createCoords = (userData) => {
    const coordonnee = new Coords(userData);
    return coordonnee.save();
};


exports.findByEmail = (email) => {
    return Coords.find({ email: email });
};

exports.findById = (id) => {
    return Coords.findById(id).then((result) => {
        result = result.toJSON();
        delete result._id;
        delete result.__v;
        return result;
    });
};

exports.findTracks = (id, perPage, page) => {
    return Coords.findById(id)
        .slice('tracks', [perPage * page, perPage])
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.patchUser = (id, userData) => {
    return new Promise((resolve, reject) => {
        Coords.findById(id, function (err, user) {
            if (err) reject(err);
            for (let i in userData) {
                user[i] = userData[i];
            }
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                resolve(updatedUser);
            });
        });
    })
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Coords.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        Coords.remove({ _id: userId }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};