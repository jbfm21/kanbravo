'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import forms from 'newforms';

import {KanbanActions} from '../../actions';
import {NavLink, Form, Container, Content} from '../../components';
import {SignUpStore} from '../../stores';
import {FormDefinition} from '../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../decorators';

const messages = defineMessages(
{
    formTitle: {id: 'signup.form.title', description: 'Register form title', defaultMessage: 'Cadastre-se agora!'},
    formSubmitButton: {id: 'signup.form.submitButton', description: 'Submit button for signup form', defaultMessage: 'Efetuar cadastro'},
    loginQuestion: {id: 'signup.login.question', description: 'Login question', defaultMessage: 'Já possui uma conta?'},
    loginAction: {id: 'signup.login.action', description: 'Login link', defaultMessage: 'Efetue o login aqui'},
    forgotPassword: {id: 'signup.forgotPassword', description: 'Forgot password link', defaultMessage: 'Esqueceu sua senha?'},
    invalidPasswordConfirmation: {id: 'signup.invalidPasswordConfirmation', description: 'Password not confirmed', defaultMessage: 'Senha não confirmada'}
});

const StateRecord = Immutable.Record({isLoading: false, actionMessage: null, signupForm: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class SignupPage extends React.Component
{
    static displayName = 'SignupPage';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(SignUpStore, this._listenToSignUpStoreChange);
        const {formatMessage} = this.props.intl;
        const formDefinition = new FormDefinition(this.props.intl);
        const SignUpFormEntity = forms.Form.extend({
            givenname: forms.CharField(formDefinition.formFields.givenname),
            surname: forms.CharField(formDefinition.formFields.surname),
            nickname: forms.CharField(formDefinition.formFields.nickname),
            avatarImageFile: forms.ImageField(formDefinition.formFields.avatar),
            username: forms.EmailField(formDefinition.formFields.email),
            password: forms.CharField(formDefinition.formFields.password),
            passwordConfirm: forms.CharField(formDefinition.formFields.passwordConfirm),
            clean: ['password', 'passwordConfirm', function()
            {
                const isInvalidPasswordConfirmation = this.data.password && this.data.passwordConfirm && this.data.password !== this.data.passwordConfirm;
                if (isInvalidPasswordConfirmation)
                {
                    this.addError('password', formatMessage(messages.invalidPasswordConfirmation));
                }
                else
                {
                    this.errors().remove('password');
                }
            }]
        });

        this.state = {data: new StateRecord({signupForm: new SignUpFormEntity({onChange: this._handleFormChange})})};
    }

    _listenToSignUpStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.user.signup.progressed:
                this.setImmutableState({isLoading: true, actionMessage: null});
                break;
            case KanbanActions.user.signup.completed:
                this.setImmutableState({isLoading: false, actionMessage: null});
                break;
            case KanbanActions.user.signup.failed:
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

    _handleFormSubmit = (cleanedData, formData) =>
    {
        cleanedData.avatarImageFile = formData.avatarImageFile;
        KanbanActions.user.signup.asFunction(cleanedData);
    };

    render()
    {
        const {formatMessage} = this.props.intl;
        const {isLoading, signupForm, actionMessage} = this.state.data;
        const actionLabel = formatMessage(messages.formSubmitButton);
        return (
            <Container className="k-principal-container k-form">
                <Header className="k-title"><Icon className="add user"/><Content><FormattedMessage {...messages.formTitle} /></Content></Header>
                <Form formKey="signupForm" isLoading={isLoading} form={signupForm} onSubmit={this._handleFormSubmit} actionLabel={actionLabel} errorMessageToShow={actionMessage}>
                    <p><a href="#"><FormattedMessage {...messages.forgotPassword} /></a></p>
                    <p><small><FormattedMessage {...messages.loginQuestion} /><NavLink to={'/login'}><FormattedMessage {...messages.loginAction} /></NavLink></small></p>
                </Form>
            </Container>
        );
    }
}

module.exports = injectIntl(SignupPage);
