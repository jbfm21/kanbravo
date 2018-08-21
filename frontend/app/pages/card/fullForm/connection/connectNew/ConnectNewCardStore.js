'use strict';

import {KanbanActions} from '../../../../../actions';
import {ExtendedStore} from '../../../../../commons';

class ConnectNewCardStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.cardConnection.addInFirstLeafLane, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardConnection.addInBacklog, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});

    }

    cardConnection_addInFirstLeafLane_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {card: response.body.data});
    }

    cardConnection_addInBacklog_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {card: response.body.data});
    }

}

module.exports = new ConnectNewCardStore();
