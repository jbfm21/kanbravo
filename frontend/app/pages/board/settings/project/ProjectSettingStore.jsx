'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class ProjectSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.project);
    }
}

module.exports = new ProjectSettingStore();
