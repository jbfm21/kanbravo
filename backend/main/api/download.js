'use strict';
const fs = require('fs');
const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

const accessControl = require('../api-util/access-control');

const AbstractLoggerInfo = require('../logger/LoggerInfo');
const Logger = require('../logger/Logger');

class DownloadApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('DownloadApi', action);
    }
}

class DownloadApi
{
    sendFile(req, res, next)
    {
        const loggerInfo = new DownloadApiLoggerInfo('login');
        const logger = new Logger(req.log);

        const filePath = req.url;
        const fileName = req.params.fileName;

        const fullPathFile = serverConfig.directories.baseFilePath + filePath;

        logger.debug('Start');

        fs.readFile(fullPathFile, function(err, file)
        {
            if (err)
            {
                res.send(500);
                return next();
            }

            res.write(file);
            res.end();

            logger.info('Finished', loggerInfo.create('Sending file', fileName));
            return next();
        });
    }

}

const downloadApi = new DownloadApi();
module.exports = function(server)
{
    server.get({path: '/attachments/boards/:boardId/:cardId/:filename', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, downloadApi.sendFile.bind(downloadApi));
};
