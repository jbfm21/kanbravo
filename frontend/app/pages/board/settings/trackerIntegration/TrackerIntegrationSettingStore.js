'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class TrackerIntegrationSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.trackerIntegration);
    }
}

module.exports = new TrackerIntegrationSettingStore();
