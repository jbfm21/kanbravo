'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class CustomFieldStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardCustomField.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardCustomField.upinsert, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    cardSetting_cardCustomField_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {cardCustomFields: response.body.data});
    }

    cardSetting_cardCustomField_upinsert_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {customFieldItem: response.body.data});
    }

}

module.exports = new CustomFieldStore();
