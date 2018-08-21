'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class RatingTypeSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.ratingType);
    }
}

module.exports = new RatingTypeSettingStore();
