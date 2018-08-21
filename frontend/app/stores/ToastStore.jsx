'use strict';

import * as airflux from 'airflux';
import {UIActions} from '../actions';
import {defineMessages} from 'react-intl';

import {FunctionHelper} from '../commons';

const messages = defineMessages(
{
    registerSuccess: {id: 'register.success', description: 'User register success', defaultMessage: 'Parabéns, você acaba de ser cadastrado no KQanban, bom proveito!'},
    updateUserProfileSuccess: {id: 'updateProfile.success', description: 'User updateProfile success', defaultMessage: 'Perfil atualizado com sucesso!'},
    toastTitle: {id: 'toast.title', description: 'Toast Title', defaultMessage: 'Atenção'}
});

class ToastStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.showServerSuccessMessage, this._onShowServerSuccessMessage);
        this.listenTo(UIActions.showServerErrorMessage, this._onShowServerErrorMessage);
        this.listenTo(UIActions.showClientSuccessMessage, this._onShowClientSuccessMessage);
        this.listenTo(UIActions.showClientErrorMessage, this._onShowClientErrorMessage);
    }

    _onShowServerSuccessMessage(response)
    {
        let message = response.body.message; //eslint-disable-line no-unused-vars
        let messageToSend = {type: 'success', title: messages.toastTitle, message: message};
        this.trigger({state: messageToSend});
    }

    _onShowServerErrorMessage(response)
    {
        let message = FunctionHelper.formatServerErrorMessage(response); //eslint-disable-line no-unused-vars
        let messageToSend = {type: 'error', title: messages.toastTitle, message: message};
        this.trigger({state: messageToSend});
    }

    _onShowClientErrorMessage(message)
    {
        let messageToSend = {type: 'error', title: messages.toastTitle, message: message};
        this.trigger({state: messageToSend});
    }

    _onShowClientSuccessMessage(message)
    {
        let messageToSend = {type: 'success', title: messages.toastTitle, message: message};
        this.trigger({state: messageToSend});
    }
}

module.exports = new ToastStore();
