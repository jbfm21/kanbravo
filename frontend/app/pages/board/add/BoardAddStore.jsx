'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class BoardAddStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.board.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

	board_add_completed(actionState, response) //eslint-disable-line no-unused-vars
	{
        const board = response.body.data;
        this.triggerWithActionState(actionState, {board: board});
	}
}

module.exports = new BoardAddStore();
