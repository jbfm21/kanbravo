'use strict';

const entityDbManager = require('../db/impediment');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');
const dbCard = require('../db/card');

const CardChildEntity = new CardChildEntityClass('boards/card/impediment', entityDbManager);

const fieldsToPopulate = [{path: 'type', select: '_id title avatar'}];

class ImpedimentApi
{
     static _posDelete(deletedEntity, nextTask)
     {
        dbCard.findById(deletedEntity.card, (err, card) => //eslint-disable-line
        {
            //TODO: logar em caso de erro, e fazer rollback??
            if (err)
            {
                return nextTask(err);
            }
            card.impediments.remove(deletedEntity);
            card.save((saveErr)=> nextTask(saveErr, deletedEntity));
        });
     }
     static _posAdd(savedEntity, nextTask)
     {
        dbCard.findById(savedEntity.card, (err, card) => //eslint-disable-line
        {
            //TODO: logar em caso de erro, e fazer rollback??
            if (err)
            {
                return nextTask(err);
            }
            card.impediments.push(savedEntity);
            card.save((saveErr)=> nextTask(saveErr, savedEntity));
        });
     }

     findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1}, populate: fieldsToPopulate});}
     findById(req, res, next) {return CardChildEntity.findById(req, res, next, {populate: fieldsToPopulate});}
     addData(req, res, next) {return CardChildEntity.addData(req, res, next, {posOperation: ImpedimentApi._posAdd.bind(this), populateAfterSave: fieldsToPopulate});}
     deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {posOperation: ImpedimentApi._posDelete.bind(this), forceDelete: true});}
     updateData(req, res, next) {return CardChildEntity.updateData(req, res, next, {populateAfterSave: fieldsToPopulate});}
}

const impedimentApi = new ImpedimentApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/impediments', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentApi.findAll.bind(impedimentApi));
    server.get({path: '/boards/:boardId/cards/:cardId/impediments/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentApi.findById.bind(impedimentApi));
	server.post({path: '/boards/:boardId/cards/:cardId/impediments', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentApi.addData.bind(impedimentApi));
    server.put({path: '/boards/:boardId/cards/:cardId/impediments/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentApi.updateData.bind(impedimentApi));
    server.del({path: '/boards/:boardId/cards/:cardId/impediments/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentApi.deleteData.bind(impedimentApi));
};

module.exports.api = new ImpedimentApi();
