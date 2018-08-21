'use strict';

import * as airflux from 'airflux';
import React from 'react';
import classNames from 'classNames';


import {injectIntl} from 'react-intl';
import {Header, Fields, Grid, Column} from 'react-semantify';
import forms from 'newforms';

import {Content, FormField, SpanContainer, AvatarField} from '../../../../components';

import {FormDefinition} from '../../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {AbstractItem} from '../base';

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class CardIdSettingItem extends AbstractItem
{
    static displayName = 'CardIdSettingItem';

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            wipLimit: forms.DecimalField(formDefinition.formFields.wipLimit),
            urlTemplate: forms.CharField(formDefinition.formFields.urlTemplate),
            prefix: forms.CharField(formDefinition.formFields.prefix),
            paddingChar: forms.CharField(formDefinition.formFields.paddingChar),
            paddingSize: forms.CharField(formDefinition.formFields.paddingSize)
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
                                    <FormField containerClassName={'k-size k-70percent'} inputClassName="k-input" editableMode={editableMode} disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.title} requiredIcon=""/>
                                    <FormField containerClassName={'k-field separator little k-size k-25percent'} showLabel={false} showLabelOnReadMode={true} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.wipLimit} requiredIcon=""/>
                                </Header>

                                <FormField style={{marginTop: '10px'}} containerClassName={'k-size k-100percent'} inputClassName="k-input" editableMode={editableMode} showInReadOnlyMode disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.urlTemplate} requiredIcon=""/>
                                <Fields style={{display: 'inline-flex', width: '100%', marginTop: '5px'}}>
                                    <SpanContainer style={{display: 'inline-flex', width: '50%'}}>
                                        <FormField containerClassName={'k-size'} inputClassName="k-input mini" editableMode={editableMode} showInReadOnlyMode disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.prefix} requiredIcon=""/>
                                    </SpanContainer>
                                    <SpanContainer style={{display: 'inline-flex', width: '50%'}} invisible={!editableMode}>
                                        <FormField containerClassName={'k-size'} inputClassName="k-input mini" editableMode={editableMode} showInReadOnlyMode disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.paddingChar} requiredIcon=""/>
                                    </SpanContainer>
                                    <SpanContainer style={{display: 'inline-flex', width: '50%'}} invisible={!editableMode}>
                                        <FormField containerClassName={'k-size k-field little separator'} inputClassName="k-input mini" editableMode={editableMode} showInReadOnlyMode disabled={false} errorToolTipClassName="pointing red basic prompt" showLabel boundField={fields.paddingSize} requiredIcon=""/>
                                    </SpanContainer>
                                </Fields>
                            </Header>
                        </Content>
                    </Column>
                </Grid>
            </div>
       );
    }
}

module.exports = injectIntl(CardIdSettingItem, {withRef: true});
