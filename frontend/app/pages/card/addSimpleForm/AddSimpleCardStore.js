'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class AddSimpleCardStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.card.addInFirstLeafLane, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.addInBacklog, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});

        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.templateCard.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.templateCard.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.templateCard.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    card_addInFirstLeafLane_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
    }

    card_addInBacklog_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
    }

    boardSetting_templateCard_add_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerWithActionState(actionState, {templateCard: response.body.data});
    }

    boardSetting_templateCard_update_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerWithActionState(actionState, {templateCard: response.body.data});
    }

    boardSetting_templateCard_delete_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
    }

}

module.exports = new AddSimpleCardStore();
