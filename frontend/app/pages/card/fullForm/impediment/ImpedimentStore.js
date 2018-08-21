'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class ImpedimentStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.impediment.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.impediment.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.impediment.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.impediment.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    cardSetting_impediment_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {impediments: response.body.data});
    }

    cardSetting_impediment_add_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {impedimentItem: response.body.data});
    }

    cardSetting_impediment_update_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {impedimentItem: response.body.data});
    }

    cardSetting_impediment_delete_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {impedimentItemId: response.body.deletedId});
    }
}

module.exports = new ImpedimentStore();
