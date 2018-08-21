'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class UserProfileStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.user.getLoggedUserProfile, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.user.updateUserProfile, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    user_getLoggedUserProfile_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        const userProfile = response.body.data;
        this.triggerWithActionState(actionState, {userProfile: userProfile});
    }

    user_updateUserProfile_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        const userProfile = response.body.data;
        this.triggerWithActionState(actionState, {userProfile: userProfile});
    }

}

module.exports = new UserProfileStore();

