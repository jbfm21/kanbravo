'use strict';

var EmptyTemplate = require('./emptyTemplate');
var SoftwareTemplate = require('./softwareTemplate');
var PortfolioTemplate = require('./portfolioTemplate');
var CycleTemplate = require('./cycleTemplate');

class TemplateFactory
{
    static getTemplate(templateName, logger, loggerInfo, board)
    {
        switch (templateName)
        {
            case 'software': return new SoftwareTemplate(logger, loggerInfo, board);
            case 'portfolio': return new PortfolioTemplate(logger, loggerInfo, board);
            case 'cycle': return new CycleTemplate(logger, loggerInfo, board);
            default : return new EmptyTemplate(logger, loggerInfo, board);
        }
    }
}

module.exports = TemplateFactory;
