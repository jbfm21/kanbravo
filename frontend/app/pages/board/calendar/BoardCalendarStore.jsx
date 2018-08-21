'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class BoardCalendarStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.boardActions.getCalendar, this, {progressed: this.triggerEmpty, failed: this.goToErrorPage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

	getState()
	{
		return this.state;
	}

	boardActions_getCalendar_completed(actionState, response)
	{
        this.triggerWithActionState(actionState, {board: response.body.data.board, calendarEvents: response.body.data.calendarEvents});
	}

    card_update_completed(actionState, response) //eslint-disable-line
    {
        //TODO: otimizar para nao precisar carregar todo o calendario novamente, lembrando que a api recebe eventos e não cartão.
        //Verificar como atualizar os cartões associados aos eventos, sem precisar reexecutar a api.
        let savedCard = response.body.data;
        this.triggerWithActionState(actionState, {savedCard: savedCard});
    }
}

module.exports = new BoardCalendarStore();
