import Config from '../../config/database'
import UserModel from '../../Users/models/users.models'
const mongoose = require('mongoose');
mongoose.connect(Config.database);
const Schema = mongoose.Schema;

const pointSchema = new Schema({
    name: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
});


const covoiturageSchema = new Schema({
    departure: pointSchema,
    arrival: pointSchema,
    passengers: [Schema.Types.ObjectId],
    totalPassengers: {
        type: Number,
        min: [2, 'Too few passengers']
    },
    dateTime: Date,
    routes: String
});


covoiturageSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
covoiturageSchema.set('toJSON', {
    virtuals: true
});

function getModels(schemaName, schema) {
    try {
        console.log("tao 1")
        return mongoose.model(schemaName, schema);
    } catch (e) {
        console.log("tao 2")
        return mongoose.model(schemaName);
    }
}

const Cov = getModels('Covoiturages', covoiturageSchema);

exports.createCovoiturage = (CovoiturageData) => {
    console.log("test", CovoiturageData)
    const Covoiturage = new Cov(CovoiturageData);
    return Covoiturage.save();
};

exports.findById = async (id) => {
    let passengers = [];
    let covoiturage = await Cov.findById(id);
    covoiturage = covoiturage.toJSON();
    for (let i = 0; i < covoiturage.passengers.length; i++) {
        await UserModel.findById(covoiturage.passengers[i])
            .then((user) => {
                delete user.password;
                delete user.permissionLevel;
                delete user.tracks;
                passengers.push(user);
            });
    }
    delete covoiturage._id;
    delete covoiturage.__v;
    covoiturage["passengers"] = passengers;
    return covoiturage;
};

exports.patchCovoiturage = (id, CovoiturageData) => {
    return new Promise((resolve, reject) => {
        Cov.findById(id, function (err, Covoiturage) {
            if (err) reject(err);
            for (let i in CovoiturageData) {
                Covoiturage[i] = CovoiturageData[i];
            }
            Cov.save(function (err, updatedCovoiturage) {
                if (err) return reject(err);
                resolve(updatedCovoiturage);
            });
        });
    })
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Cov.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, Covoiturages) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Covoiturages);
                }
            })
    });
};

exports.removeById = (CovoiturageId) => {
    return new Promise((resolve, reject) => {
        Cov.remove({ _id: CovoiturageId }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};