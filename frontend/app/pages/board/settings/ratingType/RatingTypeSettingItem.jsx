'use strict';

import * as airflux from 'airflux';
import React from 'react';
import classNames from 'classNames';


import {injectIntl} from 'react-intl';
import {Header, Icon, Fields, Grid, Column} from 'react-semantify';
import forms from 'newforms';

import {Content, Description, FormField, AvatarField, Button} from '../../../../components';

import {UIActions} from '../../../../actions';
import {FormDefinition} from '../../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {AbstractItem} from '../base';

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class RatingTypeSettingItem extends AbstractItem
{
    static displayName = 'RatingTypeSettingItem';

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            policy: forms.CharField(formDefinition.formFields.policy),
            maxRating: forms.DecimalField(formDefinition.formFields.maxRating)
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
        //TODO: codigo repetido com RatingTypeSettingItem e ItemWithAvatar e ProjectSettingItem
        let dataToSubmit = super.getFormDataToSubmit();
        const {icon, letter, foreColor, backgroundColor, imageSrc, imageFile, borderColor, borderWidth, borderRadius} = this.state.data.selectedAvatar;
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

    _handleTextEditModalShow = (dataForm, field, e) =>
    {
        if (e) {e.preventDefault();}
        let text = field.value();
        UIActions.showTextEditModal.asFunction(text, this._handleTextEditModalTextChanged.bind(this, dataForm, field), this._handleTextEditModalCancel.bind(this, dataForm, field));
    };

    _handleTextEditModalTextChanged = (dataForm, field, text) =>
    {
        dataForm.updateData({[field.name]: text});
    };

    _handleTextEditModalCancel = () =>
    {
    };

    renderForm(editableMode, dataForm)
    {
        const that = this;
        let {selectedAvatar} = this.state.data;
        let avatarClassName = classNames('ui', 'image', {'k-boxShadown': editableMode});
        let fields = dataForm.boundFieldsObj();
        return (
            <div className={'k-itemContainer'} style={{width: '100%'}}>
                <Grid className="stackable two column" style={{width: '100%'}}>
                    <Column className="center aligned two wide">
                        <AvatarField avatarClassName={avatarClassName} avatarLineHeight={'1.7'} avatar={selectedAvatar} editableMode={editableMode} onSelectAvatar={this._handleSelectAvatar} />
                    </Column>
                    <Column className="fourteen wide">
                        <Content>
                            <Header>
                                <Fields style={{display: 'inline-flex', width: '100%'}}>
                                    <FormField showErrorMessage containerClassName={'k-size k-100percent'} editableMode={editableMode} disabled={false} inputClassName="k-input" errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.title} requiredIcon=""/>
                                    <FormField containerClassName={'k-field separator little k-size k-25percent'} showLabel={false} showLabelOnReadMode={true} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px', padding: '5px', fontSize: '12px', whiteSpace: 'nowrap', minWidth: '100px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.maxRating} requiredIcon=""/>
                                </Fields>
                            </Header>
                            <Description style={{marginTop: '5px'}}>
                                <FormField showErrorMessage editableMode={editableMode} disabled={false} inputClassName="k-textarea" errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.policy} requiredIcon=""/>
                                {
                                    editableMode && <Button onClick={that._handleTextEditModalShow.bind(this, dataForm, fields.description)} className={'circular icon mini k-right-bottom-icon'} ><Icon className={'mini expand'}/></Button>
                                }
                            </Description>
                        </Content>
                    </Column>
                </Grid>
            </div>
       );
    }
}

module.exports = injectIntl(RatingTypeSettingItem, {withRef: true});
