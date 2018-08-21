'use strict';

import * as airflux from 'airflux';
import {UIActions} from '../actions';
import {RouterNavigator} from '../commons';

class KanbanAppStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.goToBoardShowAfterAddNewBoard, this.goToBoardShowAfterAddNewBoard);
    }

    goToBoardShowAfterAddNewBoard(board)
	{
        this.trigger({state: {board: board}});
        RouterNavigator.goToBoardShow(board);
	}
}

module.exports = new KanbanAppStore();
