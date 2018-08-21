'use strict';

//const async = require('async');
const request = require('superagent');
const _ = require('lodash');

const enums = require('../enums/index');
const commonUtils = require('../commons/index');
const trackerServices = require('./tracker');
const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

class TrackerService
{
    constructor(trackerIntegration, leafNodesHash, boardConfigs)
    {
        this.trackerIntegration = trackerIntegration;
        this.boardConfigs = boardConfigs;
        this.leafNodesHash = leafNodesHash;
    }

    getAdapter()
    {
        switch (this.trackerIntegration.integrationType)
        {
            case enums.trackerIntegrationType.clearquest.name: //TODO: Colocar
                return new trackerServices.clearQuest();
            default:
                return new trackerServices.generic();
        }
    }

    populate(card)
    {
        const getProperty = (propertyValue, propertyConfigs) =>
        {
            if (!propertyValue)
            {
                return null;
            }
            if (_.isArray(propertyValue))
            {
                return _.map(propertyValue, (val) => propertyConfigs[val]);
            }
            return propertyConfigs[propertyValue];
        };
        //TODO: creator, rating, impedimentType
        card.status = enums.cardStatus.inboard.name;
        card.classOfService = getProperty(card.classOfService, this.boardConfigs.classOfServices);
        card.itemType = getProperty(card.itemType, this.boardConfigs.itemTypes);
        card.itemSize = getProperty(card.itemSize, this.boardConfigs.itemSizes);
        card.metric = getProperty(card.metric, this.boardConfigs.metrics);
        card.priority = getProperty(card.priority, this.boardConfigs.priorities);
        card.project = getProperty(card.project, this.boardConfigs.projects);
        card.cardIdConfig = getProperty(card.cardIdConfig, this.boardConfigs.cardIdConfigs);
        card.tags = getProperty(card.tags, this.boardConfigs.tags);
        card.trackerIntegration = getProperty(this.trackerIntegration._id, this.boardConfigs.trackerIntegrations);
        card.board = this.boardConfigs.board;
        if (!card.endExecutionDate || card.endExecutionDate == null || card.endExecutionDate == '') {
           delete card.endExecutionDate;
        }
        
        card._id = commonUtils.util.uuid();
        card.isExternal = true;
        card.dateMetrics = {};
        if (this.leafNodesHash[card.lane] && this.leafNodesHash[card.lane].cards)
        {
            this.leafNodesHash[card.lane].cards.push(card._id);
        }
    }

    listCards(nextTask)
    {
        let r = request.get(this.trackerIntegration.queryUrl);
        if (this.trackerIntegration.apiKey && this.trackerIntegration.apiHeader)
        {
            r.set(this.trackerIntegration.apiHeader, this.trackerIntegration.apiKey);
        }
        else
        {
            let serviceConfig = serverConfig.services[this.trackerIntegration.integrationType];
            if (serviceConfig && serviceConfig.login && serviceConfig.password)
            {
                const password =  "KmaOs!b5r6kqp";
                r.auth(serviceConfig.login, password);
            }
        }
        r.set('Accept', 'application/json');
        r.end((err, res) =>
        {
            if (err)
            {
                return nextTask(err, null);
            }
            let responseBody = res.body;
            let cards = [];
            if (responseBody)
            {
                let adapter = this.getAdapter();
                cards = adapter.transform(responseBody, this.populate.bind(this));
            }
            return nextTask(null, cards);
        });
    }

}

module.exports = TrackerService;
