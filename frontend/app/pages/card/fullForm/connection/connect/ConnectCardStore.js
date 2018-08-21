'use strict';

import {KanbanActions} from '../../../../../actions';
import {ExtendedStore} from '../../../../../commons';

class ConnectCardStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.project.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.searchCardToConnect, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardConnection.updateCard, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});

    }

    boardSetting_project_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {projects: response.body.data});
    }

    card_searchCardToConnect_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {cards: response.body.data, ratingTypes: response.body.ratingTypes});
    }

    cardConnection_updateCard_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {card: response.body.data});
    }


}

module.exports = new ConnectCardStore();
