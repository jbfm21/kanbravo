'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class AgingSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.aging);
    }
}

module.exports = new AgingSettingStore();
