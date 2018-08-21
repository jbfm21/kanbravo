'use strict';

import React from 'react';
import _ from 'lodash';
import Loader from 'react-loader';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Form as FormUI, Header} from 'react-semantify';
import forms from 'newforms';

import {KanbanActions} from '../../../actions';
import {UserEntity} from '../../../entities';
import {Form, Container, Content, Avatar, FormField, FormToast, Button} from '../../../components';
import {UserProfileStore} from '../../../stores';
import {FormDefinition, FunctionHelper} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {default as constants} from '../../../commons/Constants';

const messages = defineMessages(
{
    formTitle: {id: 'profile.form.title', description: 'Register form title', defaultMessage: 'Atualize o seu perfil!'},
    formSubmitButton: {id: 'profile.form.submitButton', description: 'Submit button for signup form', defaultMessage: 'Atualizar perfil'},
    invalidPasswordConfirmation: {id: 'profile.invalidPasswordConfirmation', description: 'Password not confirmed', defaultMessage: 'Senha não confirmada'},
    invalidOldPassword: {id: 'profile.invalidOldPassword', description: 'Old password not filled', defaultMessage: 'Senha antiga inválida'},
    getProfileFailed: {id: 'profile.get.failed', description: 'Error while getting profile', defaultMessage: 'Não foi possível carregar as informações do seu perfil.'},
    updateProfileSuccess: {id: 'profile.update.success', description: 'Update profile success', defaultMessage: 'Informações do perfil salvas com sucesso!'},
    updateProfileFailed: {id: 'profile.update.failed', description: 'Update profile failed', defaultMessage: 'Não foi possível salvar as informações do perfil.'}
});

var StateRecord = Immutable.Record({isLoading: false, messageKind: null, actionMessage: null, profileForm: null, userProfile: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class UserProfilePage extends React.Component
{
    static displayName = 'UserProfilePage';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(UserProfileStore, this._listenToUserProfileStoreChange);

        const {formatMessage} = this.props.intl;
        const formDefinition = new FormDefinition(this.props.intl);
        const ProfileFormEntity = forms.Form.extend({
            givenname: forms.CharField(formDefinition.formFields.givenname),
            surname: forms.CharField(formDefinition.formFields.surname),
            nickname: forms.CharField(formDefinition.formFields.nickname),
            avatarImageFile: forms.ImageField(formDefinition.formFields.avatar),
            username: forms.EmailField(formDefinition.formFields.email),
            newPassword: forms.CharField(formDefinition.formFields.newPassword),
            newPasswordConfirm: forms.CharField(formDefinition.formFields.newPasswordConfirm),
            clean: ['newPassword', 'newPasswordConfirm', function()
            {
                if (this.data.newPassword && this.data.newPasswordConfirm && this.data.newPassword !== this.data.newPasswordConfirm)
                {
                    this.addError('newPassword', formatMessage(messages.invalidPasswordConfirmation));
                }
                else
                {
                    this.errors().remove('newPassword');
                }
            }]
        });

        this.state = {data: new StateRecord({profileForm: new ProfileFormEntity({controlled: true, onChange: this._handleFormChange})})};
    }

    componentWillMount()
    {
        KanbanActions.user.getLoggedUserProfile.asFunction();
    }

    _listenToUserProfileStoreChange(store)
    {
        const {formatMessage} = this.props.intl;
        switch (store.actionState)
        {
            //-------------------------------------------------------------
            case KanbanActions.user.getLoggedUserProfile.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.user.getLoggedUserProfile.completed:
                this.state.data.profileForm.reset(store.state.userProfile);
                this.setImmutableState({isLoading: false, userProfile: store.state.userProfile});
                break;
            case KanbanActions.user.getLoggedUserProfile.failed:
                this.setImmutableState({isLoading: false, messageKind: 'negative', actionMessage: `${formatMessage(messages.getProfileFailed)} ${store.actionMessage}`});
                break;
            //-------------------------------------------------------------
            case KanbanActions.user.updateUserProfile.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.user.updateUserProfile.completed:
                this.state.data.profileForm.reset(store.state.userProfile);
                this.setImmutableState({isLoading: false, messageKind: 'positive', actionMessage: `${formatMessage(messages.updateProfileSuccess)}`, userProfile: store.state.userProfile});
                break;
            case KanbanActions.user.updateUserProfile.failed:
                this.setImmutableState({isLoading: false, messageKind: 'negative', actionMessage: `${formatMessage(messages.updateProfileFailed)} ${store.actionMessage}`});
                break;
            //-------------------------------------------------------------
            default: break;
        }
    }

    _handleFormChange = () =>
    {
        this.setImmutableState({actionMessage: null});
        this.forceUpdate();
    };

    _handleFormSubmitLdapData = (e) =>
    {
        e.preventDefault();
        const form = this.state.data.profileForm;
        if (!form.validate())
        {
            return;
        }
        this._handleFormSubmit(form.cleanedData, form.data);
    }

    _handleFormSubmit = (cleanedData, formData) =>
    {
        let entityDataToSubmit = {};
        _.assign(entityDataToSubmit, this.state.data.userProfile);
        _.assign(entityDataToSubmit, cleanedData);
        entityDataToSubmit.avatarImageFile = formData.avatarImageFile;
        KanbanActions.user.updateUserProfile.asFunction(entityDataToSubmit);
    };

    _renderForm()
    {
        const {userProfile} = this.state.data;
        if (userProfile.provider === constants.LDAP_PROVIDER)
        {
            return this._renderLdapForm();
        }
        return this._renderLocalForm();
    }

    _renderLocalForm()
    {
        const {isLoading, profileForm, actionMessage} = this.state.data;
        const {formatMessage} = this.props.intl;
        const actionLabel = formatMessage(messages.formSubmitButton);
        return (<Form formKey="profileForm" isLoading={isLoading} form={profileForm} onSubmit={this._handleFormSubmit} actionLabel={actionLabel} errorMessageToShow={actionMessage}/>);
    }

    _renderLdapForm()
    {
        const {isLoading, profileForm, actionMessage, messageKind} = this.state.data;
        const {formatMessage} = this.props.intl;
        const actionLabel = formatMessage(messages.formSubmitButton);
        const fields = profileForm.boundFieldsObj();
        return (<FormUI className="segment error">
            <Loader loaded={!isLoading} />
            <FormField boundField={fields.givenname} editableMode={false} showInReadOnlyMode disabled={true} showLabelOnReadMode containerClassName={'tiny-fields-separator'} showErrorMessage/>
            <FormField boundField={fields.surname} editableMode={false} showInReadOnlyMode disabled={true} showLabelOnReadMode containerClassName={'tiny-fields-separator'} showErrorMessage/>
            <FormField boundField={fields.nickname} editableMode={false} showInReadOnlyMode disabled={true} showLabelOnReadMode containerClassName={'tiny-fields-separator'} showErrorMessage/>
            <FormField boundField={fields.username} editableMode={false} showInReadOnlyMode disabled={true} showLabelOnReadMode containerClassName={'tiny-fields-separator'} showErrorMessage/>
            <FormField boundField={fields.avatarImageFile} editableMode={true} showLabelOnReadMode containerClassName={'tiny-fields-separator'} showErrorMessage/>
            <FormToast message={actionMessage} kind={messageKind} />
            <Button className="positive" disabled={isLoading} onClick={this._handleFormSubmitLdapData}>{actionLabel}</Button>
        </FormUI>);
    }

    render()
    {
        const {profileForm, userProfile} = this.state.data;
        if (FunctionHelper.isUndefined(userProfile) || FunctionHelper.isUndefined(profileForm))
        {
            return null;
        }
        const userEntity = new UserEntity(userProfile);
        return (
            <Container className="k-principal-container k-form">
                <Header className="k-title">
                    <Avatar hostStyle={{backgroundColor: 'white', textShadow: '0px 0px black', width: null, height: null, display: 'inline-block', border: '1px solid black', padding: '3px', marginRight: '2px', marginTop: '2px', borderRadius: '3px'}} title={`${userEntity.fullname}`} style={{width: '40px', height: '40px', display: 'inline-block', fontSize: '18px', lineHeight: '2.5'}} avatar={userEntity.avatar} />
                    <Content style={{verticalAlign: 'middle'}}>
                        <FormattedMessage {...messages.formTitle} />
                    </Content>
                </Header>
                {this._renderForm()}
            </Container>
        );
    }
}

module.exports = injectIntl(UserProfilePage);
