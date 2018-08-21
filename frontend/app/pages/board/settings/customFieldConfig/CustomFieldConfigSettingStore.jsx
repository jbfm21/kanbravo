'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class CustomFieldConfigSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.customFieldConfig);
    }
}

module.exports = new CustomFieldConfigSettingStore();
