import React from 'react';
import ReactDOM from 'react-dom';

import {FunctionHelper} from '../../commons';
import {default as RIEStatefulBase} from './RIEStatefulBase';


export default class TextAreaInput extends RIEStatefulBase
{
    static display = 'TextAreaInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        format: React.PropTypes.func,
        nonce: React.PropTypes.string,
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
         let style = !isToShowPlaceHolder ? this.props.normalStyle : {color: 'gray', fontStyle: 'italic', cursor: 'pointer'};
         return (<div className={this.makeClassString()}
                      style={style}
                      onFocus={this.startEditing}
                      onClick={this.startEditing}><span className={'text display-linebreak'}>{value}</span></div>);
    };

    renderEditingComponent = () =>
    {
        let value = this.props.value;
        return <textarea
                      className={this.makeClassString()}
                      maxLength={this.props.maxLength}
                      defaultValue={value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={this.props.style}
                      onInput={this.textChanged}
                      onBlur={this.finishEditing}
                      onKeyDown={this.keyDown}
                      ref="input" />;
    };
}
