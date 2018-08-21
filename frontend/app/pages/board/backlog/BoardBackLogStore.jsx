'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class BoardBackLogStore extends ExtendedStore
{
    state: { cardList: []};

    constructor()
    {
        super();
        this.state = {cardList: []};
        this.listenToAsyncFnAutoBind(KanbanActions.card.listInBacklog, this, {progressed: this.triggerEmpty});
    }

    card_listInBacklog_progressed(actionState, response) //eslint-disable-line
    {
        this.triggerEmpty();
    }

    card_listInBacklog_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        let cardList = response.body.data;
        this.setState({cardList: cardList});
        this.triggerWithActionState(actionState, this.state);
    }

    card_listInBacklog_failed(actionState, response)
    {
        this.setState({cardList: []});
        this.goToErrorPage(actionState, response);
    }
}

module.exports = new BoardBackLogStore();

