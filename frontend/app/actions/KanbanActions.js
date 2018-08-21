'use strict';
import * as airflux from 'airflux';
import {Api} from '../api';
import _ from 'lodash';

class AirfluxAction
{
    constructor(functionName, restApiFunction)
    {
        let action = new airflux.PromiseAction().withChildren(['progressed']);
        action.actionName = functionName;
        _.forOwn(action.children, function(value, key)
        {
            action.children[key].actionName = action.actionName + '_' + key;
        });
        action.listen((...args) =>
        {
            if (action.progressed)
            {
                action.progressed.asFunction();
            }
            return restApiFunction(...args);
        });
        return action;
    }
}
class AirfluxMultipleAction
{
    constructor(name, restApi)
    {
        let functions = _.functionsIn(restApi);
        _.forEach(functions, (functionName) =>
        {
            this[functionName] = new airflux.PromiseAction().withChildren(['progressed']);
            let action = this[functionName];
            action.actionName = name + '_' + functionName;
            _.forOwn(action.children, function(value, key)
            {
                action.children[key].actionName = action.actionName + '_' + key;
            });
            action.listen((...args) =>
            {
                if (action.progressed)
                {
                    action.progressed.asFunction();
                }
                return restApi[functionName](...args);
            });
        });
    }
}

const KanbanActions =
{
    user: new AirfluxMultipleAction('user', Api.user),
    feedback: new AirfluxMultipleAction('feedback', Api.feedback),
    board: new AirfluxMultipleAction('board', Api.board),
    boardLayout: new AirfluxMultipleAction('boardLayout', Api.boardLayout),
    boardActions: new AirfluxMultipleAction('boardActions', Api.boardActions),
    boardSetting: {
        aging: new AirfluxMultipleAction('boardSetting_aging', Api.boardSetting.aging),
        boardMember: new AirfluxMultipleAction('boardSetting_boardMember', Api.boardSetting.boardMember),
        cardIdConfig: new AirfluxMultipleAction('boardSetting_cardIdConfig', Api.boardSetting.cardIdConfig),
        classOfService: new AirfluxMultipleAction('boardSetting_classOfService', Api.boardSetting.classOfService),
        customFieldConfig: new AirfluxMultipleAction('boardSetting_customFieldConfig', Api.boardSetting.customFieldConfig),
        impedimentType: new AirfluxMultipleAction('boardSetting_impedimentType', Api.boardSetting.impedimentType),
        itemSize: new AirfluxMultipleAction('boardSetting_itemSize', Api.boardSetting.itemSize),
        itemType: new AirfluxMultipleAction('boardSetting_itemType', Api.boardSetting.itemType),
        metricType: new AirfluxMultipleAction('boardSetting_metricType', Api.boardSetting.metricType),
        priority: new AirfluxMultipleAction('boardSetting_priority', Api.boardSetting.priority),
        project: new AirfluxMultipleAction('boardSetting_project', Api.boardSetting.project),
        ratingType: new AirfluxMultipleAction('boardSetting_ratingType', Api.boardSetting.ratingType),
        tag: new AirfluxMultipleAction('boardSetting_tag', Api.boardSetting.tag),
        tagCategory: new AirfluxMultipleAction('boardSetting_tagCategory', Api.boardSetting.tagCategory),
        taskType: new AirfluxMultipleAction('boardSetting_taskType', Api.boardSetting.taskType),
        templateCard: new AirfluxMultipleAction('boardSetting_templateCard', Api.boardSetting.templateCard),
        trackerIntegration: new AirfluxMultipleAction('boardSetting_trackerIntegration', Api.boardSetting.trackerIntegration),
        visualStyle: new AirfluxMultipleAction('boardSetting_visualStyle', Api.boardSetting.visualStyle)
    },
    card: new AirfluxMultipleAction('card', Api.card),
    cardSetting: {
        comment: new AirfluxMultipleAction('cardSetting_comment', Api.cardSetting.comment),
        impediment: new AirfluxMultipleAction('cardSetting_impediment', Api.cardSetting.impediment),
        reminder: new AirfluxMultipleAction('cardSetting_reminder', Api.cardSetting.reminder),
        task: new AirfluxMultipleAction('cardSetting_task', Api.cardSetting.task),
        cardCustomField: new AirfluxMultipleAction('cardSetting_cardCustomField', Api.cardSetting.cardCustomField),
        timesheet: new AirfluxMultipleAction('cardSetting_timesheet', Api.cardSetting.timesheet),
        cardMovementHistory: new AirfluxMultipleAction('cardSetting_cardMovementHistory', Api.cardSetting.cardMovementHistory)
    },
    tooltip:
    {
        updateImpediment: new AirfluxAction('tooltip_updateImpediment', Api.cardSetting.impediment.update),
        addTimesheet: new AirfluxAction('tooltip_addTimesheet', Api.cardSetting.timesheet.add),
        updateTimesheet: new AirfluxAction('tooltip_updateTimesheet', Api.cardSetting.timesheet.update)
    },
    cache:
    {
        cacheBoardAllConfiguration: new AirfluxAction('cache_cacheBoardAllConfiguration', Api.boardActions.getAllConfiguration)
    },

    cardConnection:
    {
        updateCard: new AirfluxAction('cardConnection_updateCard', Api.card.update),
        addInFirstLeafLane: new AirfluxAction('cardConnection_addInFirstLeafLane', Api.card.addInFirstLeafLane),
        addInBacklog: new AirfluxAction('cardConnection_addInBacklog', Api.card.addInBacklog)
    }

};

module.exports = KanbanActions;

