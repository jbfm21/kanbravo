import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {FunctionHelper} from '../../commons';
import {default as RIEStatefulBase} from './RIEStatefulBase';

export default class DateInput extends RIEStatefulBase
{
    static display = 'DateInput';

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
        showReadInFormMode: React.PropTypes.bool,
        lessThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
        greaterThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
        lessOrEqualThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
        greaterOrEqualThan: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
        requireBeforeValue: React.PropTypes.bool,
        defaultValue: React.PropTypes.object
    };

    static defaultProps = {
        defaultValue: null,
        showReadInFormMode: false,
        requireBeforeValue: false
    }

    finishEditing = () =>
    {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);
        if (!this.state.invalid && this.props.value !== newValue)
        {
            newValue = (FunctionHelper.isNullOrEmpty(newValue)) ? null : newValue;
            this.commit(newValue);
        }
        this.cancelEditing();
    };

    validate = (value) =>
    {
        if (!this.props.required && FunctionHelper.isNullOrEmpty(value))
        {
            return true;
        }
        let momentValue = moment(value, 'YYYY-MM-DD');
        if (!momentValue.isValid())
        {
            return false;
        }

        if (FunctionHelper.isUndefined(this.props.greaterThan) && FunctionHelper.isUndefined(this.props.greaterOrEqualThan) && this.props.requireBeforeValue)
        {
            return false;
        }

        if (FunctionHelper.isDefined(this.props.lessThan) && momentValue >= FunctionHelper.getFormattedMomentDate(this.props.lessThan, 'YYYY-MM-DD'))
        {
            return false;
        }
        if (FunctionHelper.isDefined(this.props.lessOrEqualThan) && momentValue > FunctionHelper.getFormattedMomentDate(this.props.lessOrEqualThan, 'YYYY-MM-DD'))
        {
            return false;
        }
        if (FunctionHelper.isDefined(this.props.greaterThan) && momentValue <= FunctionHelper.getFormattedMomentDate(this.props.greaterThan, 'YYYY-MM-DD'))
        {
            return false;
        }
        if (FunctionHelper.isDefined(this.props.greaterOrEqualThan) && momentValue < FunctionHelper.getFormattedMomentDate(this.props.greaterOrEqualThan, 'YYYY-MM-DD'))
        {
            return false;
        }
        return true;
    };

    renderNormalComponent = () =>
    {
         if (FunctionHelper.isDefined(this.props.children) && this.props.children !== false)
         {
             return (<div style={{cursor: 'pointer'}} onFocus={this.startEditing} onClick={this.startEditing}>{this.props.children}</div>);
         }
         if (this.props.showReadInFormMode)
         {
            let value = !FunctionHelper.isNullOrEmpty(this.props.value) ? moment(this.props.value).utc().format('YYYY-MM-DD') : null;
            return (<input type="date"
                        className={this.makeClassString()}
                        defaultValue={value}
                        style={this.props.style}
                        ref="input"
                        style={{border: '1px solid black', textAlign: 'center', margin: '0px', padding: '0px'}}
                        onClick={this.startEditing} />);
         }
         let value = !FunctionHelper.isNullOrEmpty(this.props.value) ? moment(this.props.value).utc().format('DD/MM/YYYY') : this.props.placeHolder;
         return <div type="date"
                    className={this.makeClassString()}
                    style={{cursor: 'pointer', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'transparent', margin: '0px', padding: '0px'}}
                    onFocus={this.startEditing}
                    onClick={this.startEditing}>{value}</div>;
    };

    renderEditingComponent = () =>
    {
        let value = !FunctionHelper.isNullOrEmpty(this.props.value) ? moment(this.props.value).utc().format('YYYY-MM-DD') : this.props.defaultValue;
        return (
            <input type="date"
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
