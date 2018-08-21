'use strict';

const entityDbManager = require('../db/trackerIntegration');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/cardIdConfig', entityDbManager);

class TrackerIntegrationApi
{
    sanitizeData(req, res, data, nextTask)
    {
        if (!data.integrationType)
        {
            data.apiHeader = null;
            data.apiKey = null;
        }
        switch (data.integrationType)
        {
            case 'clearquest':
                data.apiHeader = null;
                data.apiKey = null;
                break;
            default: break;
        }
        nextTask(null, data);
    }
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next, {appendDataBeforeSaveFn: this.sanitizeData});}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next, {createDataToUpdate: this.sanitizeData});}
}

const trackerIntegrationApi = new TrackerIntegrationApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/trackerIntegrations', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.findAll.bind(trackerIntegrationApi));
    server.get({path: '/boards/:boardId/trackerIntegrations/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.searchByTitle.bind(trackerIntegrationApi));
    server.get({path: '/boards/:boardId/trackerIntegrations/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.findById.bind(trackerIntegrationApi));
	server.post({path: '/boards/:boardId/trackerIntegrations', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.addData.bind(trackerIntegrationApi));
    server.put({path: '/boards/:boardId/trackerIntegrations/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.updateData.bind(trackerIntegrationApi));
    server.del({path: '/boards/:boardId/trackerIntegrations/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, trackerIntegrationApi.deleteData.bind(trackerIntegrationApi));
};

module.exports.api = new TrackerIntegrationApi();
