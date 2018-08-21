'use strict';

import {KanbanActions} from '../../actions';
import {RouterNavigator, ExtendedStore} from '../../commons';

class ForgotPasswordStore extends ExtendedStore
{
	constructor()
    {
        super();
		this.listenToAsyncFnAutoBind(KanbanActions.user.forgotPassword, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    user_forgotPassword_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
		RouterNavigator.goToLogin();
		this.triggerWithActionState(actionState);
    }

}

module.exports = new ForgotPasswordStore();
