'use strict';
class OpenshiftApi
{
    health(req, res, next) { return res.send(200);} //eslint-disable-line
}

let openshiftApi = new OpenshiftApi();

module.exports = function(server)
{
    server.get({path: '/health', version: '1.0.0'}, openshiftApi.health.bind(openshiftApi));
};
