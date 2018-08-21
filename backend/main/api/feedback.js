'use strict';

const async = require('async');
const AppError = require('../errors/app-error');
const accessControl = require('../api-util/access-control');
const ApiUtils = require('../api-util/api-utils');

const dbFeedback = require('../db/feedback');

class FeedBackApi
{
    add(req, res, next) //eslint-disable-line consistent-return
    {
        let dataToAdd = ApiUtils.getBodyModel(req);
        const user = req.user;

        dataToAdd['owner'] = user.nickname;  //eslint-disable-line

        if (!dataToAdd)
        {
            return next(new AppError(res.__('INVALID_REQUEST')));
        }

        let entityToSave = new dbFeedback(dataToAdd);

        let createFeedBackTask = (nextTask) => entityToSave.save(nextTask);

        let endTask = (err, savedEntity) => //eslint-disable-line no-unused-vars
        {
            if (err)
            {
                return next(new AppError(res.__('INVALID_REQUEST')));
            }
            if (!savedEntity)
            {
                return next(new AppError(res.__('INVALID_REQUEST')));
            }
            return res.send(201);
        };
        async.waterfall([createFeedBackTask.bind(this)], endTask.bind(this)); //eslint-disable0line consistent-return
    }
}

const feedbackApi = new FeedBackApi();
module.exports = function(server)
{
	server.post({path: '/feedbacks', version: '1.0.0'}, accessControl.ensureAuthenticated, feedbackApi.add.bind(feedbackApi));
};

