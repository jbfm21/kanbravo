'use strict';

import {KanbanActions} from '../../../../actions';
import {AbstractStore} from '../base';

class MetricSettingStore extends AbstractStore
{
    constructor()
    {
        super(KanbanActions.boardSetting.metricType);
    }
}

module.exports = new MetricSettingStore();
