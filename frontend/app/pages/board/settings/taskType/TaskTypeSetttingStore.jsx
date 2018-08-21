'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class TaskTypeSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.taskType);
    }
}

module.exports = new TaskTypeSettingStore();
