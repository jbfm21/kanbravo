'use strict';

import {KanbanActions} from '../../../../actions';
import {BoardShowStore} from '../../../../stores';
import {ExtendedStore} from '../../../../commons';

class TimeSheetStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.listUserCardTimeSheet, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.tooltip.updateTimesheet, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.tooltip.addTimesheet, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.timesheet.delete, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});

        this.listenToAsyncFnAutoBind(KanbanActions.card.userWorkOnCard, this, {progressed: this.triggerEmpty});
        this.listenToAsyncFnAutoBind(KanbanActions.card.userNotWorkOnCard, this, {progressed: this.triggerEmpty});

    }

    cardSetting_timesheet_listUserCardTimeSheet_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {cardId: response.body.cardId, userId: response.body.userId, timeSheet: response.body.data});
    }

    tooltip_updateTimesheet_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheetItem: response.body.data});
    }

    tooltip_addTimesheet_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheetItem: response.body.data});
    }

    cardSetting_timesheet_delete_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {timeSheetItemId: response.body.deletedId});
    }


    card_userNotWorkOnCard_completed(actionState, response) //eslint-disable-line
    {
        const {user, cardId, savedTimeSheetDocs} = response.body.data;
        this.triggerWithActionState(actionState, {user: user, cardId: cardId, timeSheetItems: savedTimeSheetDocs});
    }

    card_userWorkOnCard_completed(actionState, response) //eslint-disable-line
	{
        const {user, cardId, workOnCard} = response.body.data;
        this.triggerWithActionState(actionState, {user: user, cardId: cardId, workOnCard: workOnCard});
	}

    card_userNotWorkOnCard_failed(actionState, response) //eslint-disable-line
    {
        this.showErrorMessage(actionState, response);
        KanbanActions.board.get.asFunction(BoardShowStore.getSelectedBoard()._id); //recarrega o quadro
    }

    card_userWorkOnCard_failed(actionState, response) //eslint-disable-line
	{
        this.showErrorMessage(actionState, response);
        KanbanActions.board.get.asFunction(BoardShowStore.getSelectedBoard()._id); //recarrega o quadro
	}
}

module.exports = new TimeSheetStore();
