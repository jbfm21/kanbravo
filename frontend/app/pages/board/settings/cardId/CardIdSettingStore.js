'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class CardIdSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.cardIdConfig);
    }
}

module.exports = new CardIdSettingStore();
