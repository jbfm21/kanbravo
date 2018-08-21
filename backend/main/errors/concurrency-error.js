'use strict';

var restify = require('restify');

//TODO: intercionalizar
class ConcurrencyError extends restify.RestError
{
    constructor(originalData)
    {
        super({
            restCode: 'ConcurrencyError',
            statusCode: 409,
            message: {text: 'Não foi possível realizar a operação, pois as informações foram atualizadas por outra pessoa. Favor tentar novamente, caso necessário recarregue a página.', originalData: originalData},
            constructorOpt: ConcurrencyError
        });
        this.name = 'ConcurrencyError';
        this.data = originalData;
    }
}

module.exports = ConcurrencyError;
