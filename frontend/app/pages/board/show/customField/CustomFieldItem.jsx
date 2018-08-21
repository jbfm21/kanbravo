import React, {Component, PropTypes} from 'react';
import moment from 'moment';

import {injectIntl, intlShape} from 'react-intl';

import {FieldType} from '../../../../enums';
import {FunctionHelper} from '../../../../commons';

class CustomField extends Component
{
   static displayName = 'CustomFieldItem';

    static propTypes =
    {
        data: PropTypes.object,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        let nonce = FunctionHelper.isDefined(this.props.data) ? this.props.data.nonce : '';
        let nextNonce = FunctionHelper.isDefined(nextProps.data) ? nextProps.nonce : '';
        return (nonce !== nextNonce);
    }

    _renderField = () =>
    {
        let {data} = this.props;
        let value = data.value;
        let customFieldConfig = data.type;
        switch (customFieldConfig.fieldType)
        {
            case FieldType.date.name:
            {
                let formattedValue = !FunctionHelper.isNullOrEmpty(value) ? moment(value).utc().format('DD/MM/YYYY') : '';
                return (
                    <div style={{display: 'inline-block'}}>
                        <div>{formattedValue}</div>
                    </div>
                );
            }
            case FieldType.datetime.name:
            {
                let formattedValue = !FunctionHelper.isNullOrEmpty(value) ? moment(value).format('DD/MM/YYYY HH:mm') : '';
                return (
                    <div style={{display: 'inline-block'}}>
                        <div>{formattedValue}</div>
                    </div>
                );
            }
            case FieldType.dropdown.name:
                return (
                    <div style={{display: 'inline-block'}}>
                        <div>{value}</div>
                    </div>
                );
            case FieldType.numeric.name:
                return (
                    <div style={{display: 'inline-block'}}>
                        <div>{value}</div>
                    </div>
                );
            case FieldType.short_string.name:
                return (
                    <div style={{display: 'block', maxHeight: '60px', overflowY: 'auto'}}>
                        <div>{value}</div>
                    </div>
                );
            case FieldType.text.name:
                return (
                    <div style={{display: 'block', maxHeight: '60px', overflowY: 'auto'}}>
                        <div>{value}</div>
                    </div>
                );
            default: return null;
        }
    }

    render()
    {
        let {data} = this.props;
        return (
            <tr>
                <td>
                    <span style={{fontWeight: 'bold'}}>{data.type && data.type.title}:</span>
                </td>
                <td>{this._renderField()}</td>
            </tr>
        );
    }

}

module.exports = injectIntl(CustomField);

