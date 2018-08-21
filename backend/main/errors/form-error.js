'use strict';

var restify = require('restify');
var _ = require('lodash');

class FormError extends restify.RestError
{

    constructor(mongooseValidationErrors)
    {
        let formatMongooseErrors = (errors) =>
        {
            let formmatedMessage = _.map(errors, function(error)
            {
                return {msg: error.message, param: error.path, value: error.value};
            });
            return formmatedMessage;
        };

        super({
            restCode: 'FormError',
            statusCode: 418,
            message: formatMongooseErrors(mongooseValidationErrors),
            constructorOpt: FormError
        });
        this.name = 'AppError';
    }
}

module.exports = FormError;
