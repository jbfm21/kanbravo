'use strict';

const entityDbManager = require('../db/card').templateCardModel;
const dbCard = require('../db/card');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/templateCard', entityDbManager);

class TemplateCardApi
{
    findAll(req, res, next) { return BoardChildEntity.findAll(req, res, next, {populate: dbCard.fieldsToPopulate});}
    searchByTitle(req, res, next) { return BoardChildEntity.searchByTitle(req, res, next, {populate: dbCard.fieldsToPopulate});}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next, {populate: dbCard.fieldsToPopulate});}
    addData(req, res, next)
    {
        let formatData = (req, res, dataToAdd, nextTask) => //eslint-disable-line
        {
            delete dataToAdd._id;
            delete dataToAdd.nonce;
            if (dataToAdd.ratings)
            {
                for (let index in dataToAdd.ratings)
                {
                    if (dataToAdd.ratings[index].votes)
                    {
                        dataToAdd.ratings[index].votes = 0;
                    }
                }
            }
            return nextTask(null, dataToAdd);
        };
        return BoardChildEntity.addData(req, res, next, {appendDataBeforeSaveFn: formatData, populate: dbCard.fieldsToPopulate});
    }
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next, {forceDelete: true});}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next, {populate: dbCard.fieldsToPopulate});}
}

const templateCardApi = new TemplateCardApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/templateCards', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.findAll.bind(templateCardApi));
    server.get({path: '/boards/:boardId/templateCards/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.searchByTitle.bind(templateCardApi));
    server.get({path: '/boards/:boardId/templateCards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.findById.bind(templateCardApi));
	server.post({path: '/boards/:boardId/templateCards', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.addData.bind(templateCardApi));
    server.del({path: '/boards/:boardId/templateCards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.deleteData.bind(templateCardApi));
    server.put({path: '/boards/:boardId/templateCards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, templateCardApi.updateData.bind(templateCardApi));
};

module.exports.api = new TemplateCardApi();
