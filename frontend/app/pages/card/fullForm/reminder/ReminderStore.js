'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class ReminderStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.reminder.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.reminder.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.reminder.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.reminder.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    cardSetting_reminder_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {reminders: response.body.data});
    }

    cardSetting_reminder_add_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {reminderItem: response.body.data});
    }

    cardSetting_reminder_update_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {reminderItem: response.body.data});
    }

    cardSetting_reminder_delete_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {reminderItemId: response.body.deletedId});
    }
}

module.exports = new ReminderStore();
