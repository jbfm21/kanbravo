import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {FunctionHelper} from '../../commons';
import {default as RIEStatefulBase} from './RIEStatefulBase';

export default class DateTimeInput extends RIEStatefulBase
{
    static display = 'DateTimeInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        format: React.PropTypes.func,
        nonce: React.PropTypes.string,
        required: React.PropTypes.bool,
        placeHolder: React.PropTypes.string,
        lessThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.any]),
        greaterThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.any]),
        lessOrEqualThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.any]),
        greaterOrEqualThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.any]),
        requireBeforeValue: React.PropTypes.bool
    };

    static defaultProps =
    {
        required: true,
        requireBeforeValue: false
    };

    finishEditing = () =>
    {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);

        if (!this.validate(newValue))
        {
            return this.cancelEditing();
        }

        if (!this.props.required && FunctionHelper.isNullOrEmpty(newValue) && this.props.value !== newValue)
        {
            this.commit(null);
        }
        else
        {
            let oldValueToCheck = FunctionHelper.isDefined(this.props.value) ? moment(this.props.value).format('YYYY-MM-DD HH-mm-SS') : null;
            let newValueToCheck = FunctionHelper.isDefined(newValue) ? moment(newValue).format('YYYY-MM-DD HH-mm-SS') : null;
            if (!this.state.invalid && (oldValueToCheck !== newValueToCheck))
            {
                let newDateValue = moment(newValue).utc().toDate();
                this.commit(newDateValue);
            }
        }
        return this.cancelEditing();
    };

    validate = (value) =>
    {
        if (!this.props.required && FunctionHelper.isNullOrEmpty(value))
        {
            return true;
        }
        let momentValue = moment(value);
        if (!momentValue.isValid())
        {
            return false;
        }

        //Verifica se é obrigatório que o valor anterior vinculada a essa data esteja preenchido
        if (FunctionHelper.isUndefined(this.props.greaterThan) && FunctionHelper.isUndefined(this.props.greaterOrEqualThan) && this.props.requireBeforeValue)
        {
            return false;
        }

        if (FunctionHelper.isDefined(this.props.lessThan) && momentValue >= moment.utc(this.props.lessThan))
        {
            return false;
        }

        if (FunctionHelper.isDefined(this.props.lessOrEqualThan) && momentValue > moment.utc(this.props.lessOrEqualThan))
        {
            return false;
        }
        if (FunctionHelper.isDefined(this.props.greaterThan) && momentValue <= moment.utc(this.props.greaterThan))
        {
            return false;
        }
        if (FunctionHelper.isDefined(this.props.greaterOrEqualThan) && momentValue < moment.utc(this.props.greaterOrEqualThan))
        {
            return false;
        }
        return true;

    };

    renderNormalComponent = () =>
    {
         let style = {cursor: 'pointer', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'transparent', margin: '0px', padding: '0px'};
         if (FunctionHelper.isNullOrEmpty(this.props.value))
         {
            style.color = 'gray';
            style.fontStyle = 'italic';
         }
         let value = !FunctionHelper.isNullOrEmpty(this.props.value) ? moment(this.props.value).format('DD/MM/YYYY HH:mm') : this.props.placeHolder;
         return (
             <div type="datetime-local"
                 className={this.makeClassString()}
                 style={style}
                 onFocus={this.startEditing}
                 onClick={this.startEditing}>{value}
             </div>
         );
    };

    renderEditingComponent = () =>
    {
        let value = !(FunctionHelper.isNullOrEmpty(this.props.value)) ? moment(this.props.value).format('YYYY-MM-DDTHH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss');
        return (
            <input type="datetime-local"
                className={this.makeClassString()}
                defaultValue={value}
                disabled={this.state.loading || this.props.isDisabled}
                style={this.props.style}
                onInput={this.textChanged}
                onBlur={this.finishEditing}
                ref="input"
                style={{border: '1px solid black', textAlign: 'center', margin: '0px', padding: '0px'}}
                onKeyDown={this.keyDown} />
       );
    };
}
