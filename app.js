import bodyParser from 'body-parser';
var express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// mongoose
const mongoose = require('mongoose');
const config = require('./config/database');
const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');


mongoose.connect(config.database, function (err, db) {
    if (err) {
        throw err;
    } else {
        console.log("***************** connected to " + config.database + "  ***************")
    }
});
mongoose.Promise = global.Promise;

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});


app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);



app.listen(port, function () {
    console.log('app listening at port %s', port);
});

console.log('todo list RESTful API server started on: ' + port);