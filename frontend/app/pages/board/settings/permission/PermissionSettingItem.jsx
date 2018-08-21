'use strict';

import * as airflux from 'airflux';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlight from 'autosuggest-highlight';
import React from 'react';
import classNames from 'classNames';

import {injectIntl} from 'react-intl';
import {Header, Grid, Column} from 'react-semantify';
import forms from 'newforms';


import {Content, FormField, Description, Avatar, AvatarField} from '../../../../components';
import {Member} from '../../../../entities';
import {KanbanActions} from '../../../../actions';
import {FormDefinition} from '../../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {AbstractItem, EnumTemplateMode} from '../base';
import {default as PermissionSuggestionStore} from './PermissionSuggestionStore';


@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class PermissionSettingItem extends AbstractItem
{
    static displayName = 'PermissionSettingItem';

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            role: forms.ChoiceField(formDefinition.formFields.memberRole),
            hourPerDay: forms.DecimalField(formDefinition.formFields.hourPerDay),
            wipLimit: forms.DecimalField(formDefinition.formFields.wipLimit)
        });
        let additionalStateDataDefinition = {selectedUser: null, searchText: '', suggestions: []};
        super(props, dataFormDefinition, additionalStateDataDefinition);
        this.listenTo(PermissionSuggestionStore, this._listenToPermissionSuggestionStore);
    }

    componentDidMount()
    {
        this.resetForm();
    }

    getDataToSubmit() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        let dataToSubmit = super.getFormDataToSubmit();
        dataToSubmit.user = (this.props.templateMode === EnumTemplateMode.InsertTemplate.name) ? this.state.data.selectedUser : this.props.entity.user;
        return dataToSubmit;
    }

    resetForm() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        this.setImmutableState({selectedUser: null, searchText: '', suggestions: []});
        super.baseResetForm();
    }

    _getSuggestionValue(user)
    {
        return `${user.givenname} ${user.surname}`;
    }

    _renderValue(item)
    {
        let {avatar, title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar &&
                        <span style={{verticalAlign: 'middle', width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 2}}/></span>
                }
                <span style={{marginLeft: '10px', verticalAlign: 'middle'}}>{title}</span>
            </div>
        );
    }

    _renderSuggestion(user, {value, valueBeforeUpDown})
    {
        const suggestionText = `${user.givenname} ${user.surname}`;
        const query = (valueBeforeUpDown || value).trim();
        const matches = AutosuggestHighlight.match(suggestionText, query);
        const parts = AutosuggestHighlight.parse(suggestionText, matches);
        let avatar = null;
        if (user && user.avatar)
        {
            avatar = user.avatar;
            avatar.name = `${user.givenname} ${user.surname}`;
        }

        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar &&
                        <div className={'centeredContainer'} style={{width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 1.7}}/></div>
                }
                <div style={{marginLeft: '10px'}}>
                {
                    parts.map((part, index) =>
                    {
                        const className = part.highlight ? 'highlight' : null;
                        return (<span className={className} key={index}>{part.text}</span>);
                    })
                 }
                </div>
            </div>
        );
    }

    _listenToPermissionSuggestionStore(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.user.searchUser.completed:
                this.setImmutableState({suggestions: store.state.suggestions});
                break;
            default: break;
        }
    }

    _handleUserSuggestionTextChange = (event, {newValue, method}) => //eslint-disable-line no-unused-vars
    {
        this.setImmutableState({searchText: newValue});
    };

    _handleUserSuggestionSelected = (event, {suggestion, suggestionValue, method}) => //eslint-disable-line no-unused-vars
    {
        this.setImmutableState({selectedUser: suggestion});
    };

    _handleUserSuggestionsUpdateRequested = ({value}) =>
    {
        KanbanActions.user.searchUser.asFunction(value);
    };

    renderForm(editableMode, dataForm) //eslint-disable-line no-unused-vars
    {
        const currentMember = this.props.entity;
        const memberProxy = new Member(currentMember);
        const avatar = memberProxy.getAvatarToShow();
        const currentMemberFullName = memberProxy.getFullName();
        const fields = dataForm.boundFieldsObj();

        const {searchText, suggestions} = this.state.data;
        const value = searchText;

        const inputProps = {placeholder: 'Selecione um membro', value, onChange: this._handleUserSuggestionTextChange};
        const avatarClassName = classNames('ui', 'image', {boxShadown: editableMode});

        const isToShowInserForm = editableMode && (this.props.templateMode === EnumTemplateMode.InsertTemplate.name);
        const isToShowEditForm = editableMode && (this.props.templateMode === EnumTemplateMode.EditDeleteTemplate.name);
        const isToShowReadOnlyForm = !editableMode && this.props.templateMode === EnumTemplateMode.EditDeleteTemplate.name;

        if (isToShowInserForm)
        {
            return (
                <div className={'k-itemContainer'} style={{width: '100%'}}>
                    <Content style={{width: '100%'}}>
                        <Header style={{width: '100%', display: 'inline-flex', position: 'relative'}}>
                            <Autosuggest suggestions={suggestions}
                                onSuggestionsUpdateRequested={this._handleUserSuggestionsUpdateRequested}
                                onSuggestionSelected={this._handleUserSuggestionSelected}
                                getSuggestionValue={this._getSuggestionValue}
                                renderSuggestion={this._renderSuggestion}
                                inputProps={inputProps}
                            />
                            <FormField showErrorMessage containerClassName={'k-size k-25percent'} editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px', padding: '5px'}} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.role} requiredIcon=""/>
                            <FormField showLabel={false} containerClassName={'k-size k-25percent'} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.hourPerDay} requiredIcon=""/>
                            <FormField showLabel={false} containerClassName={'k-field separator medium k-size k-50percent'} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} tyle={{marginLeft: '20px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.wipLimit} requiredIcon=""/>
                        </Header>
                    </Content>
                </div>
            );
        }

        if (isToShowEditForm)
        {
            return (
                <div className={'k-itemContainer'} style={{width: '100%'}}>
                    <Grid className="stackable two column" style={{width: '100%'}}>
                        <Column className="center aligned two wide">
                            <AvatarField avatarClassName={avatarClassName} avatarLineHeight={'1.7'} avatar={avatar} editableMode={false}/>
                        </Column>
                        <Column className="fourteen wide">
                            <Content>
                                <Header>{currentMemberFullName}</Header>
                                <Description style={{marginTop: '5px'}}>
                                    <FormField showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} inputClassName="tiny" style={{marginLeft: '10px', padding: '2px'}} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.role} requiredIcon=""/>
                                    <FormField showLabel showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px', padding: '2px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.hourPerDay} requiredIcon=""/>
                                    <FormField showLabel showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px', padding: '2px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.wipLimit} requiredIcon=""/>
                                </Description>
                            </Content>
                        </Column>
                    </Grid>
                </div>
            );
        }

        if (isToShowReadOnlyForm)
        {
            return (
                <div className={'k-itemContainer'} style={{width: '100%'}}>
                    <Grid className="stackable two column" style={{width: '100%'}}>
                        <Column className="center aligned two wide">
                            <AvatarField avatarClassName={avatarClassName} avatarLineHeight={'1.7'} avatar={avatar} editableMode={false}/>
                        </Column>
                        <Column className="fourteen wide">
                            <Content>
                                <Header>{currentMemberFullName}</Header>
                                <Description style={{marginTop: '5px'}}>
                                    <FormField editableMode showInReadOnlyMode disabled inputClassName="k-combobox withoutLayout" style={{marginLeft: '10px'}} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.role} requiredIcon=""/>
                                    <FormField containerClassName={'k-size k-field little separator'} inputClassName="k-input mini" editableMode={false} showLabel showInReadOnlyMode disabled style={{marginLeft: '5px'}} boundField={fields.hourPerDay} requiredIcon=""/>
                                    <FormField containerClassName={'k-size k-field little separator'} inputClassName="k-input mini" editableMode={false} showLabel showInReadOnlyMode disabled style={{marginLeft: '5px'}} boundField={fields.wipLimit} requiredIcon=""/>
                                </Description>
                            </Content>
                        </Column>
                    </Grid>
                </div>
            );
        }
        return null;
    }
}

module.exports = injectIntl(PermissionSettingItem, {withRef: true});
