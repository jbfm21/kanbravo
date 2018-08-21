'use strict';
class Logger
{
    constructor(loggerUtil)
    {
        this.loggerUtil = loggerUtil;
    }
    info(message, loggerInfo)
    {
        this.loggerUtil.info({logInfo: loggerInfo}, message);
    }
    debug(message, loggerInfo)
    {
        this.loggerUtil.debug({logInfo: loggerInfo}, message);
    }
    error(message, loggerInfo)
    {
        this.loggerUtil.error({logInfo: loggerInfo}, message);
    }
    exception(err, message, loggerInfo)
    {
        this.loggerUtil.error(err, {logInfo: loggerInfo}, message);
    }
}

module.exports = Logger;
