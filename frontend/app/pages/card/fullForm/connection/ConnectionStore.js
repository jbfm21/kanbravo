'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class ConnectionStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.card.getChildrenConnection, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.reminder.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    card_getChildrenConnection_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {connections: response.body.data});
    }

    cardSetting_reminder_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {reminders: response.body.data});
    }
}

module.exports = new ConnectionStore();
