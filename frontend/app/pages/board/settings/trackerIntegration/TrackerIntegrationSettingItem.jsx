'use strict';

import * as airflux from 'airflux';
import React from 'react';
import classNames from 'classNames';


import {injectIntl} from 'react-intl';
import {Header, Fields, Grid, Column} from 'react-semantify';
import forms from 'newforms';

import {Content, FormField, SpanContainer, AvatarField} from '../../../../components';

import {FormDefinition, FunctionHelper} from '../../../../commons';
import {IntegrationType} from '../../../../enums';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {AbstractItem} from '../base';

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class TrackerIntegrationSettingItem extends AbstractItem
{
    static displayName = 'TrackerIntegrationSettingItem';

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            wipLimit: forms.DecimalField(formDefinition.formFields.wipLimit),
            queryUrl: forms.CharField(formDefinition.formFields.queryUrl),
            integrationType: forms.ChoiceField(formDefinition.formFields.trackerIntegrationType),
            apiHeader: forms.CharField(formDefinition.formFields.trackerIntegrationApiHeader),
            apiKey: forms.CharField(formDefinition.formFields.trackerIntegrationApiKey),
            isActive: forms.BooleanField(formDefinition.formFields.isActive)
        });
        let additionalStateDataDefinition = {selectedAvatar: {icon: null, letter: null, imageSrc: null, imageFile: null, foreColor: {r: 0, g: 0, b: 0, a: 1}, backgroundColor: {r: 255, g: 255, b: 255, a: 0}}};
        super(props, dataFormDefinition, additionalStateDataDefinition);
    }

    componentWillMount()
    {
        if (this.props.entity)
        {
            this.setImmutableState({selectedAvatar: this.props.entity.avatar});
        }
    }

    componentDidMount()
    {
        this.resetForm();
    }

    getDataToSubmit() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        //TODO: codigo repetido com  ItemWithAvatar e ProjectSettingItem
        let dataToSubmit = super.getFormDataToSubmit();
        let {icon, letter, foreColor, backgroundColor, imageSrc, imageFile, borderColor, borderWidth, borderRadius} = this.state.data.selectedAvatar;
        dataToSubmit.avatar = {icon: icon, letter: letter, imageSrc: imageSrc, foreColor: foreColor, backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: borderWidth, borderRadius: borderRadius};
        dataToSubmit.avatarImageFile = (imageFile) ? imageFile : null;
        return dataToSubmit;
    }

    resetForm() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        super.baseResetForm();
        if (this.props.entity)
        {
            this.setImmutableState({selectedAvatar: this.props.entity.avatar});
        }
    }

    _handleSelectAvatar = (avatar) =>
    {
        this.setImmutableState({selectedAvatar: {letter: avatar.letter, imageSrc: avatar.imageSrc, imageFile: avatar.imageFile, icon: avatar.icon, foreColor: avatar.foreColor, backgroundColor: avatar.backgroundColor, borderColor: avatar.borderColor, borderWidth: avatar.borderWidth, borderRadius: avatar.borderRadius}});
    };

    _renderTrackerIntegrationTypeReadOnlyText = (data) =>
    {
        switch (data)
        {
            //TODO: Deixar isso em algum lugar centralizado da aplicacao
            case 'generic': return 'Genérico';
            case 'clearquest': return 'ClearQuest';
            default: return `(${data})`;
        }
    };

    _renderIsActivateReadOnlyText = (data) =>
    {
        return data ? 'sim' : 'não';
    }

    _renderApiKeyConfiguration(fields, editableMode)
    {
        let dataToSubmit = super.getFormDataToSubmit();
        if (FunctionHelper.isNullOrEmpty(dataToSubmit.integrationType))
        {
            return null;
        }
        switch (dataToSubmit.integrationType)
        {
            case IntegrationType.clearquest.name: return null;
            default: return (
                <Fields style={{display: 'inline-flex', width: '100%', marginTop: '5px'}}>
                    <SpanContainer style={{display: 'inline-flex', width: '50%'}} invisible={!editableMode}>
                        <FormField containerClassName={'k-size k-90percent k-field little separator'} inputClassName="k-input" editableMode={editableMode} showInReadOnlyMode={false} disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.apiHeader} requiredIcon=""/>
                    </SpanContainer>
                    <SpanContainer style={{display: 'inline-flex', width: '50%'}} invisible={!editableMode}>
                        <FormField containerClassName={'k-size k-90percent'} inputClassName="k-input" editableMode={editableMode} showInReadOnlyMode={false} disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.apiKey} requiredIcon=""/>
                    </SpanContainer>
                </Fields>
            );
        }
    }

    renderForm(editableMode, dataForm)
    {
        let {selectedAvatar} = this.state.data;

        const fields = dataForm.boundFieldsObj();
        const avatarClassName = classNames('ui', 'image', {'k-boxShadown': editableMode});
        return (
            <div className={'k-itemContainer'} style={{width: '100%'}}>
                <Grid className="stackable two column" style={{width: '100%'}}>
                    <Column className="center aligned two wide">
                        <AvatarField avatarClassName={avatarClassName} avatarLineHeight={'1.7'} avatar={selectedAvatar} editableMode={editableMode} onSelectAvatar={this._handleSelectAvatar} />
                    </Column>
                    <Column className="fourteen wide">
                        <Content>
                            <Header>
                                <Header style={{width: '100%', display: 'inline-flex', position: 'relative'}}>
                                    <FormField containerClassName={'k-size k-55percent'} inputClassName="k-input" editableMode={editableMode} disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.title} requiredIcon=""/>
                                    <FormField showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} showLabelOnReadMode={false} renderReadOnlyText={this._renderTrackerIntegrationTypeReadOnlyText} style={{marginLeft: '10px', fontSize: '13px', whiteSpace: 'nowrap', minWidth: '100px', height: '30px'}} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.integrationType} requiredIcon=""/>
                                    <FormField readOnlyValueStyle={{marginLeft: '2px'}} renderReadOnlyText={this._renderIsActivateReadOnlyText} labelEditModeContainerStyle={{textAlign: 'center'}} containerClassName={'k-size k-10percent'} inputClassName="k-input" editableMode={editableMode} showInReadOnlyMode={true} disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.isActive} requiredIcon=""/>
                                    <FormField containerClassName={'k-field separator little k-size k-25percent'} showLabel={false} showLabelOnReadMode={true} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.wipLimit} requiredIcon=""/>
                                </Header>

                                <FormField style={{marginTop: '10px'}} containerClassName={'k-size k-100percent'} inputClassName="k-input" editableMode={editableMode} showInReadOnlyMode disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.queryUrl} requiredIcon=""/>
                                {this._renderApiKeyConfiguration(fields, editableMode)}
                            </Header>
                        </Content>
                    </Column>
                </Grid>
            </div>
       );
    }
}

module.exports = injectIntl(TrackerIntegrationSettingItem, {withRef: true});
