import React from 'react';
import ReactDOM from 'react-dom';

import {default as RIEStatefulBase} from './RIEStatefulBase';
import {FunctionHelper} from '../../commons';

export default class NumberInput extends RIEStatefulBase
{
    static display = 'NumberInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        normalStyle: React.PropTypes.object,
        format: React.PropTypes.func,
        required: React.PropTypes.bool
    };


    finishEditing = () =>
    {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);
        if (!this.state.invalid && this.props.value !== parseInt(newValue, 0))
        {
            this.commit(newValue);
        }
        this.cancelEditing();
    };

    validate = (value) =>
    {
        return (!this.props.required) || (!isNaN(value) && isFinite(value)); //eslint-disable-line
    };

    renderNormalComponent = () =>
    {
         let isToShowPlaceHolder = FunctionHelper.isUndefined(this.props.value) || this.props.value.length <= 0;
         let value = !isToShowPlaceHolder ? this.props.value : this.props.placeHolder;
         const style = (this.props.normalStyle) ? this.props.normalStyle : {borderRadius: '.28571429rem', cursor: 'pointer', border: '1px solid black', textAlign: 'center', backgroundColor: 'transparent', width: '35px', margin: '0px', padding: '0px'};
         return (<div className={this.makeClassString()}
                      style={style}
                      onFocus={this.startEditing}
                      onClick={this.startEditing}>{value}</div>);
    };

    renderEditingComponent = () =>
    {
        const style = (this.props.style) ? this.props.style : {border: '1px solid black', textAlign: 'center', width: '35px', margin: '0px', padding: '0px'};
        return <input type="number"
                      className={this.makeClassString()}
                      defaultValue={this.props.value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={this.props.style}
                      onInput={this.textChanged}
                      onBlur={this.finishEditing}
                      ref="input"
                      style={style}
                      onKeyDown={this.keyDown} />;
    };

}
