'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class ItemTypeSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.itemType);
    }
}

module.exports = new ItemTypeSettingStore();
