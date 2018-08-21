'use strict';


import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class KCardStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.cardCustomField.listToShowInCard, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.list, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.update, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.impediment.add, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.tooltip.updateImpediment, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
    }

    cardSetting_task_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {tasks: response.body.data});
    }

    cardSetting_task_update_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {taskItem: response.body.data});
    }

    cardSetting_cardCustomField_listToShowInCard_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {customFields: response.body.data});
    }

    cardSetting_impediment_add_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {impediment: response.body.data});
    }

    tooltip_updateImpediment_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {impediment: response.body.data});
    }

}

module.exports = new KCardStore();
