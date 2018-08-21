import React from 'react';
import ReactDOM from 'react-dom';

import {RIEStatefulBase} from '../../../components';


export default class WipLimitInput extends RIEStatefulBase
{
    static display = 'WipLimitInput';

    constructor(props)
    {
        super(props);
    }

    static propTypes =
    {
        format: React.PropTypes.func
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
        return !isNaN(value) && isFinite(value) && value.length > 0 && parseInt(value) >= 0; //eslint-disable-line
    };

    renderNormalComponent = () =>
    {
         return <input type="number"
                      className={this.makeClassString()}
                      defaultValue={this.props.value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={{cursor: 'pointer', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'transparent', width: '35px', margin: '0px', padding: '0px'}}
                      onFocus={this.startEditing}
                      onClick={this.startEditing}/>;
    };

    renderEditingComponent = () =>
    {
        return <input type="number"
                      className={this.makeClassString()}
                      defaultValue={this.props.value}
                      disabled={this.state.loading || this.props.isDisabled}
                      style={this.props.style}
                      onInput={this.textChanged}
                      onBlur={this.finishEditing}
                      ref="input"
                      style={{border: '1px solid black', textAlign: 'center', width: '35px', margin: '0px', padding: '0px'}}
                      onKeyDown={this.keyDown} />;
    };

}
