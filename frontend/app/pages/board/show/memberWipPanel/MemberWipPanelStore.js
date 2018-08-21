'use strict';

import * as airflux from 'airflux';

import {UIActions} from '../../../../actions';

class MemberWipPanelStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.refreshMemberWipPanel, this.onRefreshMemberWipPanel);
    }

    onRefreshMemberWipPanel()
    {
        this.trigger({actionState: UIActions.refreshMemberWipPanel});
    }

}

module.exports = new MemberWipPanelStore();
