'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class PermissionSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.boardMember);
    }
}

module.exports = new PermissionSettingStore();
