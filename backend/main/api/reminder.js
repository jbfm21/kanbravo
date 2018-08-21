'use strict';

const entityDbManager = require('../db/reminder');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');

const CardChildEntity = new CardChildEntityClass('boards/card/reminder', entityDbManager);
class ReminderApi
{
     findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1}});}
     findById(req, res, next) {return CardChildEntity.findById(req, res, next);}
     addData(req, res, next) {return CardChildEntity.addData(req, res, next);}
     deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {forceDelete: true});}
     updateData(req, res, next) {return CardChildEntity.updateData(req, res, next);}
}

const reminderApi = new ReminderApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/reminders', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, reminderApi.findAll.bind(reminderApi));
    server.get({path: '/boards/:boardId/cards/:cardId/reminders/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, reminderApi.findById.bind(reminderApi));
	server.post({path: '/boards/:boardId/cards/:cardId/reminders', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, reminderApi.addData.bind(reminderApi));
    server.put({path: '/boards/:boardId/cards/:cardId/reminders/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, reminderApi.updateData.bind(reminderApi));
    server.del({path: '/boards/:boardId/cards/:cardId/reminders/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, reminderApi.deleteData.bind(reminderApi));
};

module.exports.api = new ReminderApi();
