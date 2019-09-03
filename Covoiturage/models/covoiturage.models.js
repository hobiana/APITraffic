import Config from '../../config/database'
import UserModel from '../../Users/models/users.models'
import polyline from '@mapbox/polyline'
const mongoose = require('mongoose');
mongoose.connect(Config.database);
const Schema = mongoose.Schema;

const PlaceSchema = new Schema({
    name: String,
    location: {
        type: { type: String },
        coordinates: []
    }
});

const lineStringSchema = new Schema({
    type: String,
    coordinates: [[Number]]
});


const covoiturageSchema = new Schema({
    clientPurpose: Schema.Types.ObjectId,
    departure: PlaceSchema,
    arrival: PlaceSchema,
    passengers: [Schema.Types.ObjectId],
    totalPassengers: {
        type: Number,
        min: [2, 'Too few passengers']
    },
    dateTime: Date,
    routes: lineStringSchema
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
    CovoiturageData.routes = {
        type: "LineString",
        coordinates: polyline.decode(CovoiturageData.routes)
    }
    console.log("test", CovoiturageData)
    const Covoiturage = new Cov(CovoiturageData);
    return Covoiturage.save();
};

exports.validate = (covId, userId) => {
    return Cov.update(
        { _id: covId },
        { $push: { passengers: userId } }
    );
};

exports.findById = async (id) => {
    let passengers = [];
    let covoiturage = await Cov.findById(id);
    covoiturage = covoiturage.toJSON();
    covoiturage.routes = polyline.encode(covoiturage.routes.coordinates)
    for (let i = 0; i < covoiturage.passengers.length; i++) {
        await UserModel.findById(covoiturage.passengers[i])
            .then((user) => {
                delete user.password;
                delete user.permissionLevel;
                delete user.tracks;
                passengers.push(user);
            });
    }
    covoiturage.clientPurpose = await UserModel.findById(covoiturage.clientPurpose)
    delete covoiturage.clientPurpose.tracks
    delete covoiturage.clientPurpose.password
    delete covoiturage.clientPurpose.permissionLevel

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
        Cov.aggregate()
            .facet({
                results: [
                    { "$skip": perPage * page },
                    { "$limit": perPage }
                ],
                total_pages: [
                    { "$count": "count" }
                ]
            })
            .exec(async function (err, Covoiturages) {
                if (err) {
                    reject(err);
                } else {
                    await Promise.all(Covoiturages[0].results.map(async (covoiturage) => {
                        covoiturage.routes = polyline.encode(covoiturage.routes.coordinates);
                        const user = await UserModel.findById(covoiturage.clientPurpose)
                        delete user.password;
                        delete user.permissionLevel;
                        delete user.tracks;
                        covoiturage.clientPurpose = user;
                    }));
                    try {
                        let rep = {
                            page: page + 1,
                            total_pages: parseInt(Covoiturages[0].total_pages[0].count / perPage) + 1,
                            results: Covoiturages[0].results
                        }
                        resolve(rep);
                    }
                    catch (err) {
                        let rep = {
                            page: page + 1,
                            total_pages: 1,
                            results: []
                        }
                        resolve(rep);
                    }
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