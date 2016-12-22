'use strict';

var _ = require('lodash'),
    UserCtrl = require('./controllers/user-controller'),
    routes = [
        {path: '/api/get-chat-account', httpMethod: 'GET', middleware: [UserCtrl.getChatAccount]},
        {path: '/api/get-channels', httpMethod: 'GET', middleware: [UserCtrl.getAllChannels]},
        {path: '/api/get-channel', httpMethod: 'GET', middleware: [UserCtrl.getChannel]}
    ];

module.exports = function (app) {
    _.each(routes, function (route) {
        var args = _.flatten([route.path, route.middleware]);
        switch (route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
        }
    });
};
