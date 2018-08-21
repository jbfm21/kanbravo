'use strict';

const entityDbManager = require('../db/timesheet');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');

const CardChildEntity = new CardChildEntityClass('boards/card/comment', entityDbManager);

class TimeSheetApi
{
    findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1, trackerStartDate: -1}, populate: [{path: 'user', select: 'givenname surname nickname avatar'}]});}
    findAllByUser(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1, trackerStartDate: -1}, appendDataFn: (innerReq) => {return {userId: innerReq.params.userId};}, equalConditions: [{field: 'user', value: req.params.userId}]});}
    addData(req, res, next) {return CardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {forceDelete: true});}
    updateData(req, res, next) {return CardChildEntity.updateData(req, res, next);}
}

const timeSheetApi = new TimeSheetApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/timesheets/:userId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, timeSheetApi.findAllByUser.bind(timeSheetApi));
    server.get({path: '/boards/:boardId/cards/:cardId/timesheets', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, timeSheetApi.findAll.bind(timeSheetApi));
	server.post({path: '/boards/:boardId/cards/:cardId/timesheets', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, timeSheetApi.addData.bind(timeSheetApi));
    server.put({path: '/boards/:boardId/cards/:cardId/timesheets/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, timeSheetApi.updateData.bind(timeSheetApi));
    server.del({path: '/boards/:boardId/cards/:cardId/timesheets/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, timeSheetApi.deleteData.bind(timeSheetApi));
};

module.exports.api = new TimeSheetApi();
