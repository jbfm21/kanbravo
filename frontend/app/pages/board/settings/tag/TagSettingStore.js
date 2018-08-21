'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class TagSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.tag);
    }
}

module.exports = new TagSettingStore();
