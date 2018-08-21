'use strict';


import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class TimeSheetStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
   }

    cardSetting_timesheet_list_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheet: response.body.data});
    }

    cardSetting_timesheet_add_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {timeSheetItem: response.body.data});
    }

    cardSetting_timesheet_update_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheetItem: response.body.data});
    }

    cardSetting_timesheet_delete_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timesheetItemId: response.body.deletedId});
    }

}

module.exports = new TimeSheetStore();
