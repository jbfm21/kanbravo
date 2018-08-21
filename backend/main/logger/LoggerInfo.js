'use strict';
class LoggerInfo
{
    constructor(source, action, data, result)
    {
        this.source = source;
        this.action = action;
        this.data = data;
        this.result = result;
    }

    create(data, result)
    {
        return new LoggerInfo(this.source, this.action, data, result);
    }

}

module.exports = LoggerInfo;

