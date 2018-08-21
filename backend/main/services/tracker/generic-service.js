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
        let assignedMembers = card.assignedMembers;
        if (!assignedMembers)
        {
            return;
        }
        card.assignedMembers = [];
        _.forEach(assignedMembers, (assignedMember) =>
        {
            let fullname = assignedMember.fullname;
            let nickname = assignedMember.nickname;
            let splittedName = commonUtils.util.splitName(fullname);
            let member = {_id: commonUtils.util.uuid(), user: {_id: commonUtils.util.uuid(), avatar: {}, nickname: nickname, givenname: splittedName.givenname, surname: splittedName.surname, wipLimit: 0}};
            card.assignedMembers.push(member);
        });
    }

    transform(responseBody, populate)
    {
        let cards = responseBody['cards']; //eslint-disable-line
        cards = _.sortBy(cards, (card) => card.order);
        _.forEach(cards, (card) =>
        {
            this._transformAssignedMembers(card);
            populate(card);
        });
        return cards;
    }
}

module.exports = ClearQuestTrackerService;
