import React from 'react';
import ReactDOM from 'react-dom';

import {FunctionHelper} from '../../commons';
import {default as RIEStatefulBase} from './RIEStatefulBase';


export default class StringInput extends RIEStatefulBase
{
    static display = 'StringInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        format: React.PropTypes.func,
        placeHolder: React.PropTypes.string,
        maxLength: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
    };

    finishEditing = () =>
    {
        let newValue = ReactDOM.findDOMNode(this.refs.input).value;
        this.doValidations(newValue);
        if (!this.state.invalid && this.props.value !== newValue)
        {
            this.commit(newValue);
        }
        this.cancelEditing();
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
        let value = this.props.value;
        return <input type="text"
                      className={this.makeClassString()}
                      maxLength={this.props.maxLength}
                      defaultValue={value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={this.props.style}
                      onInput={this.textChanged}
                      onKeyDown={this.keyDown}
                      onBlur={this.finishEditing}
                      ref="input" />;
    };
}
