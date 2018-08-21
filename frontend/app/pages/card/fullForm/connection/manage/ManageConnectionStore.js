'use strict';

import {KanbanActions} from '../../../../../actions';
import {ExtendedStore} from '../../../../../commons';

class ManageConnectionStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.cardConnection.updateCard, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    cardConnection_updateCard_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {card: response.body.data});
    }
}

module.exports = new ManageConnectionStore();
