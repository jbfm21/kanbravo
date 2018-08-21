//https://github.com/jcteague/autofixturejs

'use strict';

String.prototype.as = function (builder)
{
    let fieldName = this;
    return function (incrementer)
    {
        return {
            name: fieldName,
            value: builder(incrementer)
        };
    };
};
String.prototype.asNumber = function ()
{
    let fieldName = this;
    return function (incrementer)
    {
        return {name: fieldName, value: incrementer};
    };
};

String.prototype.asDate = function ()
{
    let fieldName = this;
    return function ()
    {
        return {name: fieldName, value: new Date()};
    };
};

String.prototype.asArray = function (length)
{
    let fieldName = this;
    let createArray = function (incrementer)
    {
        let result = [];
        for (let i = incrementer; i <= incrementer + length; i++)
        {
            result.push(fieldName + i);
        }
        return result;
    };
    return function (incrementer)
    {
        return {name: fieldName, value: createArray(incrementer)};
    };
};

String.prototype.withValue = function (customValue)
{
    let fieldName = this;
    return function (incrementer)
    {
        return {name: fieldName, value: customValue + incrementer};
    };
};

String.prototype.fromFixture = function (fixtureName)
{
    let fieldName = this;
    return function ()
    {
        return {name: fieldName, value: exports.create(fixtureName)};
    };
};

var fixtures = {};

var buildFromArray = function buildFromArray(fieldArr, incrementer)
{
    let fixture = {};
    let that = this;
    fieldArr.forEach(function (n)
    {
        switch (typeof n)
        {
            case 'string': fixture[n] = n + incrementer; break;
            case 'function':
                let funcResult = n(incrementer, that);
                fixture[funcResult.name] = funcResult.value;
                break;
            default: break;
        }
    });
    return fixture;
};

var buildFromObject = function buildFromObject(fieldObj, incrementer)
{
    let fixture = {};
    for (let k in fieldObj)
    {
        if (fieldObj.hasOwnProperty(k))
        {
            let fieldValue = fieldObj[k];
            switch (typeof fieldValue)
            {
                case 'function': fixture[k] = fieldValue(incrementer); break;
                case 'string':
                    fixture[k] = (fieldValue !== null && fieldValue !== '') ? fieldValue + incrementer : k + incrementer;
                    break;
                default: fixture[k] = fieldObj[k];
            }
        }
    }
    return fixture;
};

var _createString = function (length)
{
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var createFixture = function (fixtureName, overrides, incrementer)
{
    let fixtureDef = fixtures[fixtureName].definition;
    let fixtureCount = fixtures[fixtureName].count;
    let fixture;
    let incrementValue = fixtureCount + incrementer;

    if (fixtureDef instanceof Array)
    {
        fixture = buildFromArray(fixtureDef, incrementValue);
    }
    else if (fixtureDef instanceof Object)
    {
        fixture = buildFromObject(fixtureDef, incrementValue);
    }
    var applyOverrides = function (target, override)
    {
        for (var o in override)
        {
            if (typeof o === 'object')
            {
                applyOverrides(target, o);
            }
            if (override.hasOwnProperty(o) && target.hasOwnProperty(o))
            {
                if (typeof target[o] === 'object')
                {
                    applyOverrides(target[o], override[o]);
                }
                target[o] = override[o];
            }
        }
    };
    if (overrides)
    {
        applyOverrides(fixture, overrides);
    }
    fixtures[fixtureName].count = incrementValue;
    return fixture;
};

exports = module.exports =
{
    define: function define(name, fixtureDef)
    {
        fixtures[name] = {};
        fixtures[name].definition = fixtureDef;
        fixtures[name].count = 0;
    },
    create: function create(fixtureName, overrides)
    {
        return createFixture(fixtureName, overrides, 1);
    },
    createString: function createString(length)
    {
        return _createString(length);
    },
    createEmail: function createEmail(length, lengthDomain)
    {
        return _createString(length) + '@' + this.createString(lengthDomain) + '.com';
    },
    createListOf: function createListOf(fixtureName, count, overrides)
    {
        overrides = overrides || {};
        let result = [];
        for (var i = 0; i < count; i++)
        {
            let fixture = createFixture(fixtureName, overrides, i + 1);
            result[i] = fixture;
        }
        return result;
    }
};
