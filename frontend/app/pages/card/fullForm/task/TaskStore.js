'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class TaskStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.list, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.task.delete, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    cardSetting_task_list_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {tasks: response.body.data});
    }

    cardSetting_task_add_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {taskItem: response.body.data});
    }

    cardSetting_task_update_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {taskItem: response.body.data});
    }

    cardSetting_task_delete_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {taskItemId: response.body.deletedId});
    }
}

module.exports = new TaskStore();
