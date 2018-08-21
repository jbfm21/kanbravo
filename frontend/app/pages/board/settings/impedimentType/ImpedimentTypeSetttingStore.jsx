'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class ImpedimentTypeSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.impedimentType);
    }
}

module.exports = new ImpedimentTypeSettingStore();
