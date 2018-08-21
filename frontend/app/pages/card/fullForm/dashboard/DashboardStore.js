'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';


class DashboardStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

	getState()
	{
		return this.state;
	}

    cardSetting_timesheet_list_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheet: response.body.data});
    }

}

module.exports = new DashboardStore();
