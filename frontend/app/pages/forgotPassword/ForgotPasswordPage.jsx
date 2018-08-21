'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import forms from 'newforms';

import {KanbanActions} from '../../actions';
import {Form, Container, Content} from '../../components';
import {default as ForgotPasswordStore} from './ForgotPasswordStore.jsx';
import {LocalStorageManager, FormDefinition} from '../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../decorators';

const messages = defineMessages(
{
    formTitle: {id: 'forgotPassword.form.title', description: 'Login form title', defaultMessage: 'Recupere a sua senha!'},
    formSubmitButton: {id: 'forgotPassword.form.submitButton', description: 'Submit button for login form', defaultMessage: 'Recuperar'}
});


const StateRecord = Immutable.Record({isLoading: false, actionMessage: null, forgotPasswordForm: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class ForgotPasswordPage extends React.Component
{

    static displayName = 'ForgotPasswordPage';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(ForgotPasswordStore, this._listenToForgotPasswordStoreChange);

        const formDefinition = new FormDefinition(this.props.intl);
        const ForgotPasswordFormEntity = forms.Form.extend({
            username: forms.EmailField(formDefinition.formFields.email)
        });

        this.state = {data: new StateRecord({forgotPasswordForm: new ForgotPasswordFormEntity({onChange: this._handleFormChange})})};
    }


    _listenToForgotPasswordStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.user.forgotPassword.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;
            case KanbanActions.user.forgotPassword.completed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;
            case KanbanActions.user.forgotPassword.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;
            default: break;
        }
    }

    _handleFormChange = () =>
    {
        this.setImmutableState({actionMessage: null});
        this.forceUpdate();
    };

    _handleFormSubmit = (data) =>
    {
        const {username, password} = data;
        KanbanActions.user.forgotPassword.asFunction(username, password);
    };

    render()
    {
        const {formatMessage} = this.props.intl;
        const {isLoading, forgotPasswordForm, actionMessage} = this.state.data;
        const actionLabel = formatMessage(messages.formSubmitButton);
        const isUserAuthenticated = LocalStorageManager.isUserAuthenticated();
        return (
            <Container className="k-principal-container k-form">
                <Header className="k-title"><Icon className="lock"/><Content><FormattedMessage {...messages.formTitle} /></Content></Header>
                {
                    !isUserAuthenticated &&
                        <Form formKey="forgotPasswordForm" isLoading={isLoading} form={forgotPasswordForm} onSubmit={this._handleFormSubmit} actionLabel={actionLabel} errorMessageToShow={actionMessage} />
                }
            </Container>
        );
    }
}

module.exports = injectIntl(ForgotPasswordPage);
