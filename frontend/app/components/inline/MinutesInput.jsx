import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {default as RIEStatefulBase} from './RIEStatefulBase';
import {FunctionHelper} from '../../commons';

export default class MinutesInput extends RIEStatefulBase
{
    static display = 'MinutesInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        format: React.PropTypes.func,
        nonce: React.PropTypes.string
    };

    finishEditing = () =>
    {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);
        if (!this.state.invalid && new Date(this.props.value) !== new Date(newValue))
        {
            var duration = moment.duration(newValue);
            let durationInMinutes = duration.asMinutes();
            this.commit(durationInMinutes);
        }
        this.cancelEditing();
    };

    validate = (value) =>
    {
        return moment(value, 'HH:mm').isValid();
    };

    renderNormalComponent = () =>
    {
         return <div type="date"
                      className={this.makeClassString()}
                      style={{cursor: 'pointer', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'transparent', margin: '0px', padding: '0px'}}
                      onFocus={this.startEditing}
                      onClick={this.startEditing}>{FunctionHelper.formatMinutesToHourAndMinutes(this.props.value)}</div>;
    };

    renderEditingComponent = () =>
    {
        let value = FunctionHelper.formatMinutesToHourAndMinutes(this.props.value);
        return <input type="time"
                      className={this.makeClassString()}
                      defaultValue={value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={this.props.style}
                      onInput={this.textChanged}
                      onBlur={this.finishEditing}
                      ref="input"
                      style={{border: '1px solid black', textAlign: 'center', margin: '0px', padding: '0px'}}
                      onKeyDown={this.keyDown} />;

    };
}
