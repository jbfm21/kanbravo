'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import forms from 'newforms';

import {KanbanActions} from '../../actions';
import {NavLink, Form, Container, Content} from '../../components';
import {AuthStore} from '../../stores';
import {LocalStorageManager, FormDefinition} from '../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../decorators';

const messages = defineMessages(
{
    formTitle: {id: 'login.form.title', description: 'Login form title', defaultMessage: 'Olá, seja bem-vindo!'},
    signupQuestion: {id: 'login.signup.question', description: 'Signup link', defaultMessage: 'Ainda não possui uma conta?'},
    signupAction: {id: 'login.signup.action', description: 'Signup link', defaultMessage: 'Cadastre-se e organize seu dia a dia'},
    forgotPassword: {id: 'login.forgotPassword', description: 'Forgot password link', defaultMessage: 'Esqueceu sua senha?'},
    formSubmitButton: {id: 'login.form.submitButton', description: 'Submit button for login form', defaultMessage: 'Efetuar autenticação'}
});

const StateRecord = Immutable.Record({isLoading: false, actionMessage: null, loginForm: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class LoginPage extends React.Component
{

    static displayName = 'LoginPage';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(AuthStore, this._listenToAuthStoreChange);

        const formDefinition = new FormDefinition(this.props.intl);
        const LoginFormEntity = forms.Form.extend({
            strategy: forms.ChoiceField(formDefinition.formFields.loginStrategy),
            username: forms.CharField(formDefinition.formFields.login),
            password: forms.CharField(formDefinition.formFields.password)
        });

        this.state = {data: new StateRecord({loginForm: new LoginFormEntity({onChange: this._handleFormChange})})};
    }

    _listenToAuthStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.user.login.progressed:
                this.setImmutableState({isLoading: true, actionMessage: null});
                break;
            case KanbanActions.user.login.completed:
                this.setImmutableState({isLoading: false, actionMessage: null});
                break;
            case KanbanActions.user.login.failed:
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
        const {username, password, strategy} = data;
        KanbanActions.user.login.asFunction(strategy, username, password);
    };

    _isValidToken = () =>
    {
        if (LocalStorageManager.isUserAuthenticated())
        {
            try
            {
                let decodedJwt = LocalStorageManager.getDecotedJwtToken();
                if (decodedJwt)
                {
                    return true;
                }
            }
            catch (e)
            {
                return false;
            }
        }
        return false;
    }

    render()
    {
        const {formatMessage} = this.props.intl;
        const {isLoading, loginForm, actionMessage} = this.state.data;
        const actionLabel = formatMessage(messages.formSubmitButton);
        const isUserAuthenticated = this._isValidToken();
        return (
            <Container className="k-principal-container k-form">
                <Header className="k-title"><Icon className="sign in"/><Content><FormattedMessage {...messages.formTitle} /></Content></Header>
                {
                    !isUserAuthenticated &&
                        <Form formKey="loginForm" isLoading={isLoading} form={loginForm} onSubmit={this._handleFormSubmit} actionLabel={actionLabel} errorMessageToShow={actionMessage}>
                            <p><NavLink to={'/forgotPassword'}><FormattedMessage {...messages.forgotPassword} /></NavLink></p>
                            <p><small><FormattedMessage {...messages.signupQuestion} /><NavLink to={'/signup'}><FormattedMessage {...messages.signupAction} /></NavLink></small></p>
                        </Form>
                }
            </Container>
        );
    }
}

module.exports = injectIntl(LoginPage);
