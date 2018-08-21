'use strict';

const _ = require('lodash');
const commonUtils = require('../../commons/index');

class ClearQuestTrackerService
{
    constructor()
    {
    }

    _transformAssignedMembers(card)
    {
        //Expressao regular para separar o nome da chave
        //ex: "Programador 1(prom1), Programador2 2(prom2)",
        let memberSplitRegext = /(?:([^|,]\w[^,]*)(\w*\(\w*\)))/gm;
        let assignedMembers = card.assignedMembers || '';
        if (card.creatorFullname && card.creatorLogin)
        {
            assignedMembers = assignedMembers + `, ${card.creatorFullname} (${card.creatorLogin})`; //eslint-disable-line
        }
        if (!assignedMembers)
        {
            return;
        }
        let match = null;
        card.assignedMembers = [];
        while ((match = memberSplitRegext.exec(assignedMembers)) != null) //eslint-disable-line
        {
            if (match && match.length >= 3)
            {
                let fullname = match[1];
                let nickname = match[2].replace('(', '').replace(')', '');
                let splittedName = commonUtils.util.splitName(fullname);
                let member = {_id: commonUtils.util.uuid(), user: {_id: commonUtils.util.uuid(), avatar: {}, nickname: nickname, givenname: splittedName.givenname, surname: splittedName.surname, wipLimit: 0}};
                card.assignedMembers.push(member);
            }
        }
    }

    _transformTags(card) //eslint-disable-line
    {
        let strTags = card.tags;
        if (!strTags)
        {
            return null;
        }
        card.tags = _.split(strTags, /[,;]/);
    }

    transform(responseBody, populate)
    {
        let cards = responseBody['oslc_cm:results'];
        cards = _.sortBy(cards, (card) => card.order);
        _.forEach(cards, (card) =>
        {
            this._transformAssignedMembers(card);
            this._transformTags(card);
            populate(card);
        });
        return cards;
    }
}

module.exports = ClearQuestTrackerService;
