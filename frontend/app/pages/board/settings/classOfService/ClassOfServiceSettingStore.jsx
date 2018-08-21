'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class ClassOfServiceSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.classOfService);
    }
}

module.exports = new ClassOfServiceSettingStore();
