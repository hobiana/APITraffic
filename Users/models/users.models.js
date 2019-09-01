import Config from '../../config/database'
const mongoose = require('mongoose');
mongoose.connect(Config.database);
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    permissionLevel: Number,
    tracks: [Schema.Types.ObjectId]
});


userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

function getModels(schemaName, userSchema) {
    try {
        return mongoose.model(schemaName, userSchema);
    } catch (e) {
        return mongoose.model(schemaName);
    }
}

const User = getModels('Users', userSchema);

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.addPersonToTrack = (userId, personToTrackId) => {
    return User.update(
        { _id: userId },
        { $push: { tracks: personToTrackId } }
    );
};

exports.findByEmail = (email) => {
    return User.find({ email: email });
};

exports.findById = (id) => {
    return User.findById(id).then((result) => {
        result = result.toJSON();
        delete result._id;
        delete result.__v;
        return result;
    });
};

exports.findTracks = (id, perPage, page) => {
    console.log(perPage)
    return User.findById(id)
        .slice('tracks', [perPage * page, perPage])
        .then((result) => {
            if (result == null) {
                result = {
                    tracks: []
                }
            } else {
                result = result.toJSON();
            }
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.patchUser = (id, userData) => {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, user) {
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
        User.find()
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
        User.remove({ _id: userId }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};