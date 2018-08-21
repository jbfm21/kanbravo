'use strict';

import {KanbanActions, UIActions} from '../../../actions';
import {FunctionHelper, ExtendedStore} from '../../../commons';

class CardFormModalStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenTo(UIActions.showCardFormModal, this._onCardFormModalShow);
        this.listenTo(UIActions.showParentCardFormModal, this._onParentCardFormModalShow);
        this.listenTo(UIActions.showCardTemplateFormModal, this._onCardTemplateFormModalShow);

        this.listenToAsyncFnAutoBind(KanbanActions.card.get, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.update, this, {progressed: this.triggerEmpty, completed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.addInFirstLeafLane, this, {progressed: this.triggerEmpty, completed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.addInBacklog, this, {progressed: this.triggerEmpty, completed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.templateCard.add, this, {progressed: this.triggerEmpty, completed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.templateCard.update, this, {progressed: this.triggerEmpty, completed: this.triggerEmpty, failed: this.triggerErrorMessage});

    }

    _onCardTemplateFormModalShow(boardId, card)
    {
        this.triggerWithActionState(UIActions.showCardTemplateFormModal, {card: card, boardId: boardId});
    }

    _onParentCardFormModalShow(boardId, card)
    {
        this.triggerWithActionState(UIActions.showParentCardFormModal, {boardId: boardId});
        KanbanActions.card.get.asFunction(card);
    }

    _onCardFormModalShow(boardId, card)
	{
        this.triggerWithActionState(UIActions.showCardFormModal, {boardId: boardId});
        let isEditingExistCard = FunctionHelper.isDefined(card._id);
        if (isEditingExistCard)
        {
            KanbanActions.card.get.asFunction(card);
        }
        else
        {
            //New card
            this.triggerWithActionState(KanbanActions.card.get.completed, {card: card});
        }
	}

    card_get_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {card: response.body.data});
    }
}

module.exports = new CardFormModalStore();

