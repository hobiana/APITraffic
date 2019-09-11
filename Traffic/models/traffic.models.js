const axios =require( 'axios');
const polyline =require( '@mapbox/polyline');
const CoordonneeModel =require( '../../Coordonnees/models/coordonnees.models');

let ApiKey = 'AIzaSyBBhowPi5DO3oPSczGEQm1ZTdU6yFLbv0E';

async function getDirections(origin, destination) {
    const url = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&units=metric&alternatives=true&key=' + ApiKey
    console.log(url)
    return axios.get(url)
        .then((response) => {
            const rep = {
                status: response.status,
                data: response.data
            }
            return rep;
        })
        .catch((error) => {
            console.log(error.response.status)
            const err = {
                status: error.response.status,
                data: error.response.data
            }
            return error;
        })
}

exports.list = (perPage, page) => {
    return [];
};

// getCoordsNearPoint = async (point) => {
//     async CoordonneeModel.findNear(point)
// }

const taux = [
    [26.66,69.37,39.58]
]


exports.analyse_traffic = async (origin, destination, test) => {
    let response = [];
    if (origin != '' && destination != '') {
        let googleMapRoutes = await getDirections(origin, destination);
        // console.log("googleMapRoutes",googleMapRoutes)
        let routes = googleMapRoutes.data.routes;
        console.log('taille', routes.length)
        await routes.map((route, i) => {
            console.log(i)
            let rep = {
                distance: Math.round(route.legs[0].distance.value / 1000),
                pourcentage: taux[0][i],
                routes: route.overview_polyline.points
            }
            response.push(rep)
        })
    }

    console.log("render", response)
    return response;
}