'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class GeneralSettingStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.board.get, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.board.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.board.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    board_get_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        let board = response.body.data;
        this.triggerWithActionState(actionState, {board: board});
    }

    board_update_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        let board = response.body.data;
        this.triggerWithActionState(actionState, {board: board});
    }

    board_delete_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerWithActionState(actionState);
    }
}

module.exports = new GeneralSettingStore();

