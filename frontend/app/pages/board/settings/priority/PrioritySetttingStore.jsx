'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class PrioritySettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.priority);
    }
}

module.exports = new PrioritySettingStore();
