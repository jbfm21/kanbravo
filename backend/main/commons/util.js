'use strict';
const _ = require('lodash');

class Utils
{
    static splitName(fullname)
    {
        const emptyName = {givenname: '', surname: ''};
        if (!fullname)
        {
            return emptyName;
        }
        fullname = _.trim(fullname);
        let splitedName = fullname.split(' ', 2);
        if (splitedName.length === 0)
        {
            return emptyName;
        }
        if (splitedName.length === 1)
        {
            return {givenname: _.trim(splitedName[0]), surname: ''};
        }
        return {givenname: _.trim(splitedName[0]), surname: _.trim(splitedName[1])};
    }
    static uuid()
    {
        var i, random;
        var uuid = '';
        for (i = 0; i < 32; i++)
        {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20)
            {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16); //eslint-disable-line no-nested-ternary
        }
        return uuid;
    }
}

module.exports = Utils;
