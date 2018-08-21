import React, {Component, PropTypes} from 'react';
import {Field, Icon} from 'react-semantify';

import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {UIActions} from '../../../../actions';
import {NumberInput, DateInput, DateTimeInput, TextAreaInput, StringInput, StaticComboField} from '../../../../components';
import {FieldType} from '../../../../enums';
import {FunctionHelper, FormDefinition} from '../../../../commons';

const messages = defineMessages(
{
    textPlaceHolder: {id: 'modal.cardForm.customFieldTab.textPlaceHolder', description: '', defaultMessage: 'Entre com o texto desejado...'},
    numberPlaceHolder: {id: 'modal.cardForm.customFieldTab.textPlaceHolder', description: '', defaultMessage: 'Entre com o número desejado...'},
    comboboxPlaceHolder: {id: 'modal.cardForm.customFieldTab.comboboxPlaceHolder', description: '', defaultMessage: 'Selecione a opção desejada...'}
});

var StateRecord = Immutable.Record({editedCustomFieldItem: null});

@ImmutableState
class CustomFieldItem extends Component
{
   static displayName = 'CustomFieldItem';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        customField: PropTypes.object,
        customFieldConfig: PropTypes.object.isRequired,
        isLoading: PropTypes.bool.isRequired,
        onSave: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
    {
        this._setCustomFieldInState(this.props);
    }

    componentWillReceiveProps(nextProps)
    {
        this._setCustomFieldInState(nextProps);
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (this.props.customField.nonce !== nextProps.customField.nonce) || (this.props.isLoading !== nextProps.isLoading);
    }

    _setCustomFieldInState = (props) =>
    {
        let {customField} = props;
        this.setImmutableState({editedCustomFieldItem: customField});
    }

    _isNumberAcceptable = (string) => //eslint-disable-line
    {
        return true;
    };

    _handleChangeData = (newData) =>
    {
       let {editedCustomFieldItem} = this.state.data;
       let itemToUpdate = FunctionHelper.cloneAndAssign(editedCustomFieldItem, newData);
       return this.props.onSave(itemToUpdate);
    }

    //TODO: colocar os metodos abaixo dentro do TextAreaInput ?????
    _handleTextEditModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let text = this.state.data.editedCustomFieldItem.value;
        UIActions.showTextEditModal.asFunction(text, this._handleTextEditModalTextChanged.bind(this), this._handleTextEditModalCancel.bind(this));
    };

    _handleTextEditModalTextChanged = (text) =>
    {
        this._handleChangeData({value: text});
    };

    _handleTextEditModalCancel = () =>
    {
    };

    _getDropDownSuggestions = () =>
    {
        let {customFieldConfig} = this.props;
        if (FunctionHelper.isNullOrEmpty(customFieldConfig.helpText))
        {
            return [];
        }
        return FunctionHelper.convertTextListToDropDownList(customFieldConfig.helpText);
    }

    _renderField = () =>
    {
        let {customFieldConfig, isLoading} = this.props;
        let {editedCustomFieldItem} = this.state.data;
        const {formatMessage} = this.props.intl;
        switch (customFieldConfig.fieldType)
        {
            case FieldType.date.name:
                return (
                    <div style={{display: 'inline-block'}}>
                        <DateInput
                            propName="value"
                            placeHolder="--/--/--"
                            value={editedCustomFieldItem.value}
                            change={this._handleChangeData}
                            validate={this._isNumberAcceptable}
                            isDisabled={isLoading}
                            required={false}
                            classLoading="isLoading"
                            classInvalid="k-inlineEdit invalid"
                        />
                    </div>
                );
            case FieldType.datetime.name:
                return (
                    <div style={{display: 'inline-block'}}>
                        <DateTimeInput
                            dateFormat="YYYY-MM-DDTHH:mm:SS.000Z"
                            propName="value"
                            placeHolder="--/--/-- --:--"
                            value={editedCustomFieldItem.value}
                            required={false}
                            change={this._handleChangeData}
                            validate={this._isNumberAcceptable}
                            isDisabled={isLoading}
                            classLoading="isLoading"
                            classInvalid="k-inlineEdit invalid"
                        />
                    </div>
                );
            case FieldType.dropdown.name:
               return (
                   <div style={{display: 'inline-block'}}>
                    <StaticComboField
                        placeHolder={formatMessage(messages.comboboxPlaceHolder)}
                        initialValue={editedCustomFieldItem.value}
                        propName="value"
                        showValueInLabelIfDistinct
                        onChangeData={this._handleChangeData}
                        getSuggestions={this._getDropDownSuggestions}
                    />
                   </div>
                );
            case FieldType.numeric.name:
            {
                let value = (FunctionHelper.isNullOrEmpty(editedCustomFieldItem.value)) ? '' : Number(editedCustomFieldItem.value);
                return (
                    <div style={{display: 'inline-block'}}>
                        <NumberInput
                            propName="value"
                            value={value}
                            placeHolder={formatMessage(messages.numberPlaceHolder)}
                            change={this._handleChangeData}
                            required={false}
                            isDisabled={isLoading}
                            normalStyle={{textAlign: 'left', margin: '2px', padding: '0px', cursor: 'pointer'}}
                            style={{border: '1px solid black', textAlign: 'left', width: '150px !important', margin: '2px', padding: '0px'}}
                            classLoading="isLoading"
                            classInvalid="k-inlineEdit invalid"
                        />
                    </div>
                );
            }
            case FieldType.short_string.name:
                return (
                    <div style={{display: 'inline-flex', width: '93%', height: '25px'}}>
                        <StringInput
                            maxLength={FormDefinition.CustomField_ShortString_MaxLength}
                            placeHolder={formatMessage(messages.textPlaceHolder)}
                            propName="value"
                            value={editedCustomFieldItem.value}
                            change={this._handleChangeData}
                            isDisabled={isLoading}
                            normalStyle={{textAlign: 'left', margin: '2px', padding: '0px', cursor: 'pointer'}}
                            style={{border: '1px solid black'}}
                            classLoading="isLoading"
                            classInvalid="k-inlineEdit invalid"
                        />
                    </div>
                );
            case FieldType.text.name:
                return (
                    <div style={{display: 'block'}}>
                        <TextAreaInput
                            maxLength={FormDefinition.CustomField_Text_MaxLength}
                            shouldFinishEditOnEnter={false}
                            placeHolder={formatMessage(messages.textPlaceHolder)}
                            normalStyle={{borderRadius: '.28571429rem', border: '1px solid black', minHeight: '40px', maxHeight: '300px', overflowY: 'auto', paddingLeft: '4px'}}
                            style={{border: '1px solid black', minHeight: '60px', height: '100px', maxHeight: '300px'}}
                            propName="value"
                            value={editedCustomFieldItem.value}
                            change={this._handleChangeData}
                            isDisabled={isLoading}
                            classLoading="isLoading"
                            classInvalid="k-inlineEdit invalid"
                        />
                    </div>
                );
            default: return null;
        }
    }

    render()
    {
        let {customFieldConfig} = this.props;
        return (
            <Field className="inline">
                <div style={{display: 'inline-block'}}>
                    <span style={{fontWeight: 'bold'}}>{customFieldConfig.title}</span>
                    {customFieldConfig.fieldType === FieldType.text.name &&
                        <Icon onClick={this._handleTextEditModalShow.bind(this)} className={'mini expand'} style={{cursor: 'pointer'}}/>
                    }
                    :
                </div>
                {this._renderField()}
            </Field>
        );
    }

}

module.exports = injectIntl(CustomFieldItem);

