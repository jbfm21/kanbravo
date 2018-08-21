import React from 'react';
import ReactDOM from 'react-dom';
import {default as RIEBase} from './RIEBase';

export default class RIEStatefulBase extends RIEBase
{
    constructor(props)
    {
        super(props);
    }

    startEditing = () =>
    {
        if (!this.props.isDisabled)
        {
            this.setState({editing: true, invalid: false});
        }
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

    cancelEditing = () =>
    {
        this.setState({editing: false, invalid: false});
    };

    keyDown = (event) =>
    {
        if (this.props.shouldFinishEditOnEnter)
        {
            if (event.keyCode === 9) {this.finishEditing();}         // tab
            if (event.keyCode === 13) {this.finishEditing();}         // Enter`
        }

        if (event.keyCode === 27)
        {
            // Escape
            event.preventDefault();
            event.stopPropagation();
            this.cancelEditing();
        }
    };

    textChanged = (event) =>
    {
        this.doValidations(event.target.value.trim());
    };

    componentDidUpdate = (prevProps, prevState) =>
    {
        var inputElem = ReactDOM.findDOMNode(this.refs.input);
        if (this.state.editing && !prevState.editing)
        {
            inputElem.focus();
            try
            {
                this.selectInputText(inputElem);
            }
            catch (err)
            {
                //do nothing
            }
        }
        else if (this.state.editing && prevProps.value !== this.props.value)
        {
            this.finishEditing();
        }
    };

    renderEditingComponent = () =>
    {
        return <input
            disabled={this.state.loading}
            className={this.makeClassString()}
            style={this.props.style}
            defaultValue={this.props.value}
            onInput={this.textChanged}
            onBlur={this.finishEditing}
            ref="input"
            onKeyDown={this.keyDown} />;
    };

    renderNormalComponent = () =>
    {
        return <span
            tabIndex="0"
            className={this.makeClassString()}
            style={this.props.style}
            onFocus={this.startEditing}
            onClick={this.startEditing}>{this.state.newValue || this.props.value}</span>;
    };

    elementBlur = (event) =>  //eslint-disable-line
    {
        this.finishEditing();
    };

    elementClick = (event) =>
    {
        this.startEditing();
        event.target.element.focus();
    };

    render = () =>
    {
        if (this.state.editing)
        {
            return this.renderEditingComponent();
        }
        return this.renderNormalComponent();
    };
}
