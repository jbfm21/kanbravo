'use strict';

import Immutable from 'immutable';
import {KanbanActions} from '../../actions';
import {LocalStorageManager, FunctionHelper, RouterNavigator, ExtendedStore} from '../../commons';

var StateRecord = Immutable.Record({loggedUser: null, jwtToken: null});

class AuthStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.state = new StateRecord();

        this.listenToAsyncFnAutoBind(KanbanActions.user.login, this);
        this.listenToAsyncFnAutoBind(KanbanActions.user.loginUserByJwt, this, {progressed: this.triggerEmpty, completed: this.user_login_completed, failed: this.user_logout_completed});
        this.listenToAsyncFnAutoBind(KanbanActions.user.logout, this, {progressed: this.triggerEmpty, failed: this.user_logout_completed});
    }

	getLoggedUser() {return this.state.loggedUser;}
    getjwtToken() {return this.state.jwtToken;}

    _clearState()
    {
        LocalStorageManager.setJwtToken(null);
        this.state = new StateRecord();
    }

    user_login_progressed(actionState)
    {
        this._clearState();
        this.triggerWithActionState(actionState);
    }

    user_login_completed(actionState, response)
    {
        const {token, initialPath} = response.body;
        if (FunctionHelper.isUndefined(token))
        {
            this.user_logout_completed(KanbanActions.user.logout.completed, null);
            return;
        }
        LocalStorageManager.setJwtToken(token);
        this.state = new StateRecord({loggedUser: LocalStorageManager.getLoggedUser(), jwtToken: token});
        const isToGoToListBoardPage = initialPath === '/' || initialPath === '/login' || FunctionHelper.isUndefined(initialPath);
        if (isToGoToListBoardPage)
        {
            RouterNavigator.goToListBoard();
        }
        else
        {
            RouterNavigator.navigateTo(initialPath);
        }
        this.triggerWithActionState(actionState, this.state);
    }

    user_login_failed(actionState, response)
    {
        this._clearState();
        this.triggerErrorMessage(actionState, response);
    }

    user_logout_completed(actionState, response) //eslint-disable-line
    {
        this._clearState();
        this.triggerWithActionState(actionState, this.state);
        RouterNavigator.goToLogin();
    }
}

module.exports = new AuthStore();
