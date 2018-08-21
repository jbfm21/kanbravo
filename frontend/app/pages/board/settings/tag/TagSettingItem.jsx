'use strict';
import * as airflux from 'airflux';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {Header, Grid, Column} from 'react-semantify';
import forms from 'newforms';

import {Content, FormField} from '../../../../components';
import {KanbanActions} from '../../../../actions';
import {UIActions} from '../../../../actions';
import {FormDefinition, FunctionHelper} from '../../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {default as ComboField} from '../../../card/fullForm/components/ComboField.jsx';
import {AbstractItem} from '../base';

const messages = defineMessages(
{
    selectPlaceHolder: {id: 'modal.cardForm.selectPlaceHolder', description: '', defaultMessage: 'Selecionar'}
});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class TagSettingItem extends AbstractItem
{
    static displayName = 'TagSettingItem';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        const formDefinition = new FormDefinition(props.intl);
        const dataFormDefinition = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            wipLimit: forms.DecimalField(formDefinition.formFields.wipLimit)
        });

        let additionalStateDataDefinition = {selectedTagCategory: null};
        super(props, dataFormDefinition, additionalStateDataDefinition);
    }

    componentWillMount()
    {
        if (this.props.entity)
        {
            this.setImmutableState({selectedTagCategory: this.props.entity.type});
        }
    }

    componentDidMount()
    {
        this.resetForm();
    }

    getDataToSubmit() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        let dataToSubmit = super.getFormDataToSubmit();
        dataToSubmit.type = this.state.data.selectedTagCategory;
        return dataToSubmit;
    }

    resetForm() //esse metodo nao pode ser substituido por arrow function, para fazer uso do super.
    {
        super.baseResetForm();
        if (this.props.entity)
        {
            this.setImmutableState({selectedTagCategory: this.props.entity.type});
        }
    }

    _handleSelectTagCategory = (fieldName, selectedItem) =>
    {
        this.setImmutableState({selectedTagCategory: selectedItem});
        this.forceUpdate();
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
        const {formatMessage} = this.props.intl;
        const fields = dataForm.boundFieldsObj();
        const {selectedTagCategory} = this.state.data;
        const boardId = this.props.boardId;
        return (
            <div className={'k-itemContainer'} style={{width: '100%'}}>
                <Grid className="stackable two column" style={{width: '100%'}}>
                    <Column className="eight wide">
                        <Content>
                            <Header style={{width: '100%', display: 'inline-flex', position: 'relative'}}>
                                <FormField containerClassName={'k-size k-100percent'} showErrorMessage editableMode={editableMode} disabled={false} inputClassName="k-input" errorToolTipClassName="pointing red basic prompt" showLabel={false} boundField={fields.title} requiredIcon=""/>
                            </Header>
                        </Content>
                    </Column>
                    <Column className="five wide" style={{margin: '0px', padding: '0px'}}>
                        <Header style={{width: '100%', display: 'inline-flex', position: 'relative'}}>
                            {
                                editableMode && <ComboField fieldName="type" label={''} getSuggestionFunc={KanbanActions.boardSetting.tagCategory.search} selectedItem={selectedTagCategory} onSelectItem={this._handleSelectTagCategory} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)} style={{marginLeft: '10px', width: '100%'}} />
                            }
                            {
                                !editableMode && FunctionHelper.isDefined(selectedTagCategory) && selectedTagCategory.title
                            }
                            {
                                !editableMode && !FunctionHelper.isDefined(selectedTagCategory) && '--'
                            }
                        </Header>
                    </Column>
                    <Column className="three wide">
                        <Content>
                            <Header style={{width: '100%', display: 'inline-flex', position: 'relative'}}>
                                    <FormField containerClassName={'k-field separator little k-size k-25percent'} showLabel={false} showLabelOnReadMode={true} inputClassName="k-input" showErrorMessage editableMode={editableMode} showInReadOnlyMode disabled={false} style={{marginLeft: '10px', padding: '5px', fontSize: '12px', whiteSpace: 'nowrap', minWidth: '200px'}} errorToolTipClassName="pointing red basic prompt" boundField={fields.wipLimit} requiredIcon=""/>
                            </Header>
                        </Content>
                    </Column>

                </Grid>
            </div>
       );
    }
}

module.exports = injectIntl(TagSettingItem, {withRef: true});
