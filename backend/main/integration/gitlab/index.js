'use strict';

var restify = require('restify');


var AbstractIntegration = require('../AbstractIntegration');

class GitLabIntegration extends AbstractIntegration
{
    createNewIssue(projectId, title, description)
    {
        var client = restify.createJsonClient({url: this.url, version: '*'});
        client.post(`/projects/${projectId}/issues`, {title: title, description: description}, function(err, req, res, obj)
        {
            console.log('%d -> %j', res.statusCode, res.headers);
            console.log('%j', obj);
        });
    }
}

module.exports = GitLabIntegration;
