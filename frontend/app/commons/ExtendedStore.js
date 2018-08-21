'use strict';

import * as airflux from 'airflux';
import _ from 'lodash';

import {FunctionHelper, RouterNavigator} from '../commons';
import {UIActions} from '../actions';

export default class ExtendedStore extends airflux.Store
{
    constructor()
    {
        super();
    }

    getFormattedMessage(response)
    {
        return FunctionHelper.formatServerErrorMessage(response);
    }

    listenToAsyncFnAutoBind(action, caller, options)
    {
        let that = this;
        _.forOwn(action.children, function(value, key)
        {
            const childrenAction = action.children[key];
            const childrenActionName = childrenAction.actionName;
            const callerFunction = (options && options[key]) ? options[key] : caller[childrenActionName];
            if (callerFunction)
            {
                that.listenTo(childrenAction, callerFunction.bind(that, childrenAction));
            }
        });
    }

    listenToAsyncFn(action, onProgress, onComplete, onFail)
    {
        if (onProgress) {this.listenTo(action.progressed, onProgress);}
        if (onComplete) {this.listenTo(action.completed, onComplete);}
        if (onFail) {this.listenTo(action.failed, onFail);}
    }

    triggerEmpty(actionState)
    {
        this.triggerWithActionState(actionState, {});
    }

    triggerErrorMessage(actionState, response)
    {
        this.trigger({actionState: actionState, actionMessage: this.getFormattedMessage(response)});
    }

    triggerWithActionState(actionState, state)
    {
        const stateToSend = FunctionHelper.isUndefined(state) ? {} : state;
        this.trigger({actionState: actionState, state: stateToSend});
    }

    triggerWithActionStateAndErrorMessage(actionState, response, state)
    {
        const stateToSend = FunctionHelper.isUndefined(state) ? {} : state;
        this.trigger({actionState: actionState, actionMessage: this.getFormattedMessage(response), state: stateToSend});
    }

    showErrorMessage(actionState, response, state)
    {
        UIActions.showClientErrorMessage.asFunction(this.getFormattedMessage(response));
        this.triggerWithActionStateAndErrorMessage(actionState, response, state);
    }

    goToErrorPage(actionState, response, state)
    {
        UIActions.showClientErrorMessage.asFunction(this.getFormattedMessage(response));
        this.triggerWithActionStateAndErrorMessage(actionState, response, state);
        RouterNavigator.goToErrorPage();
    }

}
