'use strict';

import {KanbanActions, UIActions} from '../../actions';
import {RouterNavigator, ExtendedStore} from '../../commons';
import {defineMessages} from 'react-intl';

const messages = defineMessages(
{
    registerSuccess: {id: 'register.success', description: 'User register success', defaultMessage: 'Parabéns, você acaba de ser cadastrado no KQanban, bom proveito!'}
});

class SignUpStore extends ExtendedStore
{
	constructor()
    {
        super();
		this.listenToAsyncFnAutoBind(KanbanActions.user.signup, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

	user_signup_completed(actionState, response) //eslint-disable-line
	{
		UIActions.showClientSuccessMessage.asFunction(messages.registerSuccess);
		RouterNavigator.goToLogin();
	}
}

module.exports = new SignUpStore();
