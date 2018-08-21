'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';


class TimelineStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardMovementHistory.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }


    cardSetting_cardMovementHistory_list_completed(actionState, response)
    {
        let cardMovementHistory = response.body.data.length > 0 ? response.body.data[0] : null;
        this.triggerWithActionState(actionState, {cardMovementHistory: cardMovementHistory});
    }
    cardSetting_timesheet_list_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheet: response.body.data});
    }
}

module.exports = new TimelineStore();
