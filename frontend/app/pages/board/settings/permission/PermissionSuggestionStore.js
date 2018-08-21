'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class PermissionSuggestionStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.user.searchUser, this, {progressed: null, failed: this.showErrorMessage});
    }

    user_searchUser_completed(actionState, response)
	{
        this.triggerWithActionState(actionState, {suggestions: response.body.data});
    }
}

module.exports = new PermissionSuggestionStore();
