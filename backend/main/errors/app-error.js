'use strict';

var restify = require('restify');

class AppError extends restify.RestError
{
    constructor(message)
    {
        super({
            restCode: 'AppError',
            statusCode: 418,
            message: message,
            constructorOpt: AppError
        });
        this.name = 'AppError';
    }
}

module.exports = AppError;
