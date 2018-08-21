/// <reference path="../../typings/node/node.d.ts"/>
'use strict';

const winston = require('winston');
const bunyan = require('bunyan');
const mongoose = require('mongoose');

//mongoose.Promise = require('bluebird');

const config = require('konfig')({path: __dirname + '/config'}).app;
const Server = require('./server');

let logger = bunyan.createLogger({name: 'qkanban-server', src: true,
    streams: [
        //{level: config.logger.level, stream: process.stdout},
        {level: config.logger.level, path: config.logger.app}
    ]
});

let onMongooseError = function(err)
{
   logger.error(`onMongooseError: ${err}`);
};

winston.add(winston.transports.File, {filename: config.logger.app, handleExceptions: true, humanReadableUnhandledException: true});
// winston.add(winston.transports.File, {filename: serverConfig.logger.api});
// winston.handleExceptions(new winston.transports.File({filename: serverConfig.logger.exception}));
//winston.add(winston.transports.Console, {handleExceptions: true, humanReadableUnhandledException: true});
/*
winston.add(
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.logger.app, handleExceptions: true, humanReadableUnhandledException: true})
]);
*/

//mongoose.set('debug', true);
mongoose.connect(config.db.mongodb);
mongoose.connection.on('error', onMongooseError);

let apiServer = new Server(logger, config);
apiServer.start();
