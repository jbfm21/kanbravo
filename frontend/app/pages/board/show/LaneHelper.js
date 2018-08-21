'use strict';

import _ from 'lodash';

import {FunctionHelper, TreeUtils} from '../../../commons';
import {BoardContextStore} from '../../../stores';
import {SwimLaneType} from '../../../enums';

export default class LaneHelper
{
    static getLaneById(boardLane, laneId)
    {
        //TODO: otimizae
        let stack = [];
        stack.push(boardLane.rootNode);
        while (stack.length > 0)
        {
            let node = stack.pop();
            if (node._id === laneId)
            {
                return node;
            }
            else if (node.children && node.children.length)
            {
                for (let ii = 0; ii < node.children.length; ii += 1)
                {
                    stack.push(node.children[ii]);
                }
            }
        }
        return null;
    }

    static getLaneCard(boardLane, cardId)
    {
        //TODO: otimizae
        let stack = [];
        stack.push(boardLane.rootNode);
        while (stack.length > 0)
        {
            let node = stack.pop();
            if (node.cards && node.cards.length > 0)
            {
                let card = _.find(node.cards, {_id: cardId});
                if (FunctionHelper.isDefined(card))
                {
                    return node;
                }
            }
            else if (node.children && node.children.length)
            {
                for (let ii = 0; ii < node.children.length; ii += 1)
                {
                    stack.push(node.children[ii]);
                }
            }
        }
        return null;
    }

    static getSwimLanes(swimLaneStyle)
    {
        if (FunctionHelper.isUndefined(swimLaneStyle) || swimLaneStyle.type === SwimLaneType.none.name)
        {
            return [];
        }
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return [];
        }
        switch (swimLaneStyle.type)
        {
            case SwimLaneType.none.name: return [];
            case SwimLaneType.custom.name:
                //TODO: implementar
                return [];
            case SwimLaneType.tagCategory.name:
            {
                let swimLanes = _.filter(boardAllConfig.tags, (item) => FunctionHelper.isDefined(item.type) && (item.type._id === swimLaneStyle.id || item.type === swimLaneStyle.id));
                return _.sortBy(swimLanes, (o) => o.title.toLowerCase());
            }
            case SwimLaneType.members.name:
            {
                let swimLanes = boardAllConfig[swimLaneStyle.type];
                return _.sortBy(swimLanes, (o) => (o.user && o.user.nickname) ? o.user.nickname.toLowerCase() : '');
            }
            default:
            {
                if (_.has(boardAllConfig, swimLaneStyle.type))
                {
                    let swimLanes = boardAllConfig[swimLaneStyle.type];
                    return _.sortBy(swimLanes, (o) => o.title.toLowerCase());
                }
                return [];
            }
        }
    }

    static getSwimLaneWip(boardLanes, swimLaneStyle, swimLane)
    {
        const swimLaneId = swimLane._id;
        if (FunctionHelper.isUndefined(swimLaneStyle) || swimLaneStyle.type === SwimLaneType.none.name)
        {
            return null;
        }
        let swimLaneProperty = swimLaneStyle.property;
        if (FunctionHelper.isUndefined(boardLanes))
        {
            return [];
        }
        let leafNodes = TreeUtils.getAllLeafNodes(boardLanes.rootNode);
        let cards = _.flatten(_.map(leafNodes, item => item.cards));
        let swimLaneCardMetrics = {swimLane: swimLaneId, totalCards: 0, wipCards: 0};
        _.forEach(cards, card =>
        {
           if (swimLaneId === SwimLaneType.notClassified.name)
           {
                if (!_.has(card, swimLaneProperty) || FunctionHelper.isUndefined(card[swimLaneProperty]) || (_.isArray(card[swimLaneProperty]) && FunctionHelper.isArrayNullOrEmpty(card[swimLaneProperty])))
                {
                   swimLaneCardMetrics.totalCards++; //eslint-disable-line
                    if (FunctionHelper.isDefined(card.dateMetrics.startLeadTimeDate))
                    {
                        swimLaneCardMetrics.wipCards++; //eslint-disable-line
                    }
                    return;
                }
            }
            if (_.isArray(card[swimLaneProperty]))
            {
                _.forEach(card[swimLaneProperty], item =>
                {
                    if (item._id === swimLaneId)
                    {
                        swimLaneCardMetrics.totalCards++;
                        if (FunctionHelper.isDefined(card.dateMetrics.startLeadTimeDate))
                        {
                            swimLaneCardMetrics.wipCards++;
                        }
                    }
                });
                return;
            }

            if (card[swimLaneProperty] && card[swimLaneProperty]._id === swimLaneId)
            {
                swimLaneCardMetrics.totalCards++;
                if (FunctionHelper.isDefined(card.dateMetrics.startLeadTimeDate))
                {
                    swimLaneCardMetrics.wipCards++;
                }
            }
        });
        return swimLaneCardMetrics;
    }

    static getAllSwimLanesWip(boardLanes, swimLaneStyle)
    {
        if (FunctionHelper.isUndefined(swimLaneStyle) || swimLaneStyle.type === SwimLaneType.none.name)
        {
            return null;
        }
        let swimLaneProperty = swimLaneStyle.property;
        if (FunctionHelper.isUndefined(boardLanes))
        {
            return [];
        }
        let leafNodes = TreeUtils.getAllLeafNodes(boardLanes.rootNode);
        let cards = _.flatten(_.map(leafNodes, item => item.cards));

        let isCardInProgress = (card) =>
        {
            return FunctionHelper.isDefined(card.dateMetrics.startLeadTimeDate) || card.startExecutionDate;
        };

        let swimLaneWips = {};
        _.forEach(cards, card =>
        {
            if (!_.has(card, swimLaneProperty) || FunctionHelper.isUndefined(card[swimLaneProperty]) || (_.isArray(card[swimLaneProperty]) && FunctionHelper.isArrayNullOrEmpty(card[swimLaneProperty])))
            {
                if (!swimLaneWips[SwimLaneType.notClassified.name]) //eslint-disable-line
                {
                    swimLaneWips[SwimLaneType.notClassified.name] = {swimLane: SwimLaneType.notClassified.name, totalCards: 0, wipCards: 0}; //eslint-disable-line
                }
                swimLaneWips[SwimLaneType.notClassified.name].totalCards++; //eslint-disable-line
                if (isCardInProgress(card))
                {
                    swimLaneWips[SwimLaneType.notClassified.name].wipCards++; //eslint-disable-line

                }
                return;
            }
            if (_.isArray(card[swimLaneProperty]))
            {
                _.forEach(card[swimLaneProperty], item =>
                {
                    if (!swimLaneWips[item._id])
                    {
                        swimLaneWips[item._id] = {swimLane: item, totalCards: 0, wipCards: 0};
                    }
                    swimLaneWips[item._id].totalCards++;
                    if (isCardInProgress(card))
                    {
                        swimLaneWips[item._id].wipCards++;
                    }
                });
                return;
            }

            let swimLaneId = card[swimLaneProperty]._id;
            if (!swimLaneWips[swimLaneId])
            {
                swimLaneWips[swimLaneId] = {swimLane: card[swimLaneProperty], totalCards: 0, wipCards: 0};
            }
            swimLaneWips[swimLaneId].totalCards++;
            if (isCardInProgress(card))
            {
                swimLaneWips[swimLaneId].wipCards++;
            }
        });
        return swimLaneWips;
    }

    static getMemberWip(boardLanes)
    {
        if (FunctionHelper.isUndefined(boardLanes))
        {
            return [];
        }
        let leafNodes = TreeUtils.getAllLeafNodes(boardLanes.rootNode);
        //let cards = _(leafNodes).map(item => item.cards).flatten().filter(item => FunctionHelper.isDefined(item.dateMetrics.startLeadTimeDate)).value();
        let cards = _.filter(_.flatten(_.map(leafNodes, item => item.cards)), item => FunctionHelper.isDefined(item.dateMetrics.startLeadTimeDate));
        //TODO: melhorar o codigo
        let memberWips = {};
        _.forEach(cards, item =>
        {
            _.forEach(item.assignedMembers, member =>
            {
                if (!memberWips[member._id])
                {
                    memberWips[member._id] = {member: member, totalCards: 0};
                }
                memberWips[member._id].totalCards++;
            });
        });
        return memberWips;
    }

    static getLaneWip(lane)
    {
        //TODO: possivel otimizacao: pre calcular já para todas as raias ou informacao ja vir preechida pelo servidor
        let wipCalculator = (laneNode) =>
        {
            return FunctionHelper.isDefined(laneNode.cards) ? laneNode.cards.length : 0;
        };
        return TreeUtils.calculateLeafNodes(lane, wipCalculator);
    }
}
