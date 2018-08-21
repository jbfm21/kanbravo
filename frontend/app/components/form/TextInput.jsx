//TODO: Intercionalizar
import React, {Component} from 'react';

import Immutable from 'immutable';

import {ImmutableState} from '../../decorators';
import {FunctionHelper} from '../../commons';


var StateRecord = Immutable.Record({value: ''});

@ImmutableState
export default class TextInput extends Component
{
    static displayName = 'TextInput';

    static propTypes =
    {
        onChangeData: React.PropTypes.func.isRequired,
        submitKeyFunction: React.PropTypes.func,
        initialValue: React.PropTypes.string
    };

    componentDidMount()
    {
        let that = this;
        window.$('#textarea_' + this._id).bind('keydown', function(e) //eslint-disable-line
        {
            if (that.props && that.props.submitKeyFunction && that.props.submitKeyFunction(e))
            {
                e.preventDefault();
                that.props.onChangeData(e);
                return true;
            }
        });
    }

    getValue()
    {
        return this.state.data.value;
    }

    setValue(value)
    {
        this.setImmutableState({value: value});
    }

    focus()
    {
        window.$('#textarea_' + this._id).focus(); //eslint-disable-line
    }

	_handleChangeValue = (event) =>
    {
        this.setImmutableState({value: event.target.value});
	}

    constructor(props)
    {
        super(props);
        this._id = FunctionHelper.uuid();
        this.state = {data: new StateRecord()};
    }

    render()
    {
        let {initialValue, onChangeData, submitKeyFunction, ...others} = this.props; //eslint-disable-line
        let {value} = this.state.data;
        return (
            <textarea id={'textarea_' + this._id}
                defaultValue={initialValue}
                onChange={this._handleChangeValue}
                value={value}
                {...others}
            />
        );
    }

}

