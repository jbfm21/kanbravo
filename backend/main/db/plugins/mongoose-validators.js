'use strict';
var validator = require('validator');

function createValidator(callback, options)
{
    var message = options.message ? options.message : undefined; //eslint-disable-line
    return {
        validator: callback,
        msg: message
    };
}

function validatorHandler(method)
{
    return function(options)
    {
        var hasOptions = typeof (options) === 'object' && !(options instanceof RegExp);
        var opts = hasOptions ? options : {};
        var skipNull = opts.skipNull ? true : false;
        var skipEmpty = opts.skipEmpty ? true : false;
        var args = [].slice.call(arguments, hasOptions && method !== 'isURL' ? 1 : 0);
        return createValidator(function(value)
        {
            let isToAddOptionsToCall = true;
            if (method === 'isAlphanumeric')
            {
                isToAddOptionsToCall = false;
            }
            if (skipNull && (value === null || value === undefined)) //eslint-disable-line
            {
                return true;
            }
            else if (skipEmpty && (value === null || value === undefined || value === '')) //eslint-disable-line
            {
                return true;
            }
            if (isToAddOptionsToCall)
            {
                return validator[method].apply(null, [String(value)].concat(args).concat([options]), args);
            }
            return validator[method].apply(null, [String(value)].concat(args), args);
        }, opts);
    };
}

Object.keys(validator).filter(function(key)
{
    return typeof (validator[key]) === 'function';
}).forEach(function(method)
{
    exports[method] = validatorHandler(method);
});
