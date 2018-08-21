'use strict';

import React from 'react';
import * as airflux from 'airflux';

import {injectIntl} from 'react-intl';
import {Header, Grid, Column} from 'react-semantify';
import forms from 'newforms';

import {Content, FormField} from '../../../../components';

import {UIActions} from '../../../../actions';
import {FormDefinition} from '../../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {default as AbstractItem} from './AbstractItem.jsx';

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class Item extends AbstractItem
{
    static displayName = 'Item';

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title)
        });
        super(props, dataFormDefinition);
    }

    componentWillMount()
    {
    }

    componentDidMount()
    {
        this.resetForm();
    }

    getDataToSubmit() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        return super.getFormDataToSubmit();
    }

    resetForm() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        super.baseResetForm();
    }

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
        let fields = dataForm.boundFieldsObj();
        return (
            <div className={'k-itemContainer'} style={{width: '100%'}}>
                <Grid className="stackable one column" style={{width: '100%'}}>
                    <Column className="sixteen wide">
                        <Content>
                            <Header>
                                <FormField showErrorMessage editableMode={editableMode} disabled={false} inputClassName="k-input" errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.title} requiredIcon=""/>
                            </Header>
                        </Content>
                    </Column>
                </Grid>
            </div>
       );
    }
}

module.exports = injectIntl(Item, {withRef: true});
