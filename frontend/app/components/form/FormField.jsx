'use strict';

import React from 'react';
import classNames from 'classnames';

import {Icon, Input, Field, Label} from 'react-semantify';

export default class FormField extends React.Component
{

    static displayName = 'FormField';

    static propTypes =
    {
        boundField: React.PropTypes.object.isRequired,
        containerClassName: React.PropTypes.string,
        inputClassName: React.PropTypes.string,
        style: React.PropTypes.object,
        labelStyle: React.PropTypes.object,
        labelEditModeContainerStyle: React.PropTypes.object,
        readOnlyClassName: React.PropTypes.string,
        readOnlyValueStyle: React.PropTypes.string,
        showInReadOnlyMode: React.PropTypes.bool,
        showErrorMessage: React.PropTypes.bool,
        requiredIcon: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        errorToolTipClassName: React.PropTypes.string,
        showLabel: React.PropTypes.bool,
        showLabelOnReadMode: React.PropTypes.bool,
        containerStyle: React.PropTypes.object,
        editableMode: React.PropTypes.bool,
        renderReadOnlyText: React.PropTypes.func,
        children: React.PropTypes.node,
        refName: React.PropTypes.string,
        onEnterKeyPressed: React.PropTypes.func,
        isValueLocked: React.PropTypes.bool,
        onLockIconClick: React.PropTypes.func
    };

    static defaultProps = {
        style: null,
        labelStyle: null,
        inputClassName: 'icon',
        containerClassName: null,
        requiredIcon: 'asterisk red',
        labelEditModeContainerStyle: {display: 'flex'},
        errorToolTipClassName: 'basic red pointing prompt',
        disabled: false,
        editableMode: true,
        showLabel: true,
        showLabelOnReadMode: false,
        showInReadOnlyMode: true,
        readOnlyClassName: null
    };

    constructor(props)
    {
        super(props);
        this.state = {value: this.props.boundField.value(), currentError: this.props.boundField.errorMessage()};
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line no-unused-vars
    {
        let bf = this.props.boundField;
        let valueChanged = this.state.value !== bf.value();
        let errorChanged = this.state.currentError !== bf.errorMessage();
        let disableChange = this.props.disabled !== nextProps.disabled;
        let editableModeChange = this.props.editableMode !== nextProps.editableMode;
        let lockedChange = this.props.isValueLocked !== nextProps.isValueLocked;
        if (valueChanged || errorChanged)
        {
            this.setState({value: bf.value(), currentError: bf.errorMessage()});
        }
        return valueChanged || errorChanged || disableChange || editableModeChange || lockedChange;
    }

    _handleOnEnterKeyPressed = (e) =>
    {
        if ((e.keyCode || e.which) === 13)
        {
            e.preventDefault();
            this.props.onEnterKeyPressed(e);
            return true;
        }
        return true;
    }

    render()
    {
        let {readOnlyValueStyle, labelEditModeContainerStyle, onLockIconClick, isValueLocked, containerClassName, containerStyle, refName, showLabel, showErrorMessage, showLabelOnReadMode, showInReadOnlyMode, boundField, inputClassName, readOnlyClassName, requiredIcon, errorToolTipClassName, disabled, editableMode, style, labelStyle, renderReadOnlyText} = this.props;
        let hasErrorMessageToShow = boundField.errors().isPopulated();
        let fieldClassName = classNames(hasErrorMessageToShow && 'error');
        let errorToolTipClassNameFinal = classNames(errorToolTipClassName, 'transition visible');
        let errorToolTipLabel = boundField.errors().asText().replace('*', '');
        let labelRenderOptions = {attrs: {style: labelStyle}};
        //TODO: melhorar o trecho abaixo para não ficar repetitivo
        let inputRenderOptions = {attrs: {disabled: disabled, style: style, ref: refName}};
        if (isValueLocked)
        {
            inputRenderOptions.attrs.tabIndex = -1;
        }
        if (this.props.onEnterKeyPressed)
        {
            inputRenderOptions.attrs['onKeyPress'] = this._handleOnEnterKeyPressed; //eslint-disable-line
        }
        readOnlyClassName = readOnlyClassName || inputClassName;
        let readOnlyText = (renderReadOnlyText) ? renderReadOnlyText(boundField.value()) : boundField.value();
        let lockedIcon = isValueLocked ? 'lock' : 'unlock';
        return (
            <div className={containerClassName} style={containerStyle}>
            {
                editableMode &&
                    <Field className={fieldClassName}>
                        <div style={labelEditModeContainerStyle}>
                            {onLockIconClick && <Icon className={lockedIcon} title={'Permite travar este campo para que o valor deste campo seja mantido em novas inclusões'} style={{cursor: 'pointer'}} onClick={onLockIconClick.bind(this, boundField.name)} />}
                            {showLabel && boundField.labelTag(labelRenderOptions)}
                        </div>
                        <Input className={inputClassName}>
                            {boundField.render(inputRenderOptions)}
                            {boundField.field.required && requiredIcon && <Icon className={requiredIcon}/>}
                            {this.props.children}
                        </Input>
                        {hasErrorMessageToShow && showErrorMessage && <Label className={errorToolTipClassNameFinal}>{errorToolTipLabel}</Label>}
                    </Field>
            }
            {
                !editableMode && showInReadOnlyMode &&
                    <Field className={fieldClassName} style={style}>
                        {(showLabel || showLabelOnReadMode) && boundField.labelTag(labelRenderOptions)}
                        <span className={readOnlyClassName} style={readOnlyValueStyle}>{readOnlyText}</span>
                    </Field>
            }
            </div>
        );
    }
}
