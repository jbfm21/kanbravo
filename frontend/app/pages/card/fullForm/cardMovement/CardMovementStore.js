'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class CardMovementStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardMovementHistory.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardMovementHistory.updateMovement, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardMovementHistory.deleteMovement, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});

    }

    cardSetting_cardMovementHistory_list_completed(actionState, response)
    {
        //TODO: o metodo list retorna uma lista contendo um único elemento caso tenha encontrado
        let cardMovementHistory = response.body.data.length > 0 ? response.body.data[0] : null;
        this.triggerWithActionState(actionState, {cardMovementHistory: cardMovementHistory});
    }

    cardSetting_cardMovementHistory_updateMovement_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {cardMovementHistory: response.body.data});
    }

    cardSetting_cardMovementHistory_deleteMovement_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {cardMovementHistory: response.body.data});
    }


}

module.exports = new CardMovementStore();
