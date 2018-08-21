'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class TagCategorySettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.tagCategory);
    }
}

module.exports = new TagCategorySettingStore();
