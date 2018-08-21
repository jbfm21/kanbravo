'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class ItemSizeSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.itemSize);
    }
}

module.exports = new ItemSizeSettingStore();
