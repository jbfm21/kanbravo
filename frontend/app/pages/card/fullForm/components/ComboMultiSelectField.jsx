'use strict';
import React from 'react';

import {Icon, Field} from 'react-semantify';
import {default as AutoMultiSuggestionFormField} from './AutoMultiSuggestionFormField.jsx';


class ComboMultiSelectField extends React.Component
{
    static displayName = 'ComboField';

    static propTypes =
    {
        boardId: React.PropTypes.string.isRequired,
        fieldName: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        selectedItems: React.PropTypes.array,
        style: React.PropTypes.object,
        placeHolder: React.PropTypes.string.isRequired,
        getSuggestionFunc: React.PropTypes.object.isRequired,
        onSelectItems: React.PropTypes.func.isRequired,
        contentClassName: React.PropTypes.string,
        isValueLocked: React.PropTypes.bool,
        onLockIconClick: React.PropTypes.func

    };

    static defaultProps =
    {
        isValueLocked: false
    };

    constructor()
    {
        super();
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (this.props.boardId !== nextProps.boardId) ||
                (this.props.fieldName !== nextProps.fieldName) ||
                (this.props.label !== nextProps.label) ||
                (this.props.selectedItems !== nextProps.selectedItems) ||
                (this.props.style !== nextProps.style) ||
                (this.props.placeHolder !== nextProps.placeHolder) ||
                (this.props.getSuggestionFunc !== nextProps.getSuggestionFunc) ||
                (this.props.isValueLocked !== nextProps.isValueLocked) ||
                (this.props.onLockIconClick !== nextProps.onLockIconClick) ||
                (this.props.onSelectItems !== nextProps.onSelectItems);
    }

    _handleOnSelectItems = (items) =>
    {
        this.props.onSelectItems(this.props.fieldName, items);
        this.forceUpdate();
    }

    render() //eslint-disable-line no-unused-vars
    {
        let {onLockIconClick, isValueLocked, style, label, boardId, selectedItems, placeHolder, getSuggestionFunc, fieldName, contentClassName} = this.props;
        let lockedIcon = isValueLocked ? 'lock' : 'unlock';

        return (
            <Field>
                <div style={{display: 'flex'}}>
                    {onLockIconClick && <Icon style={{cursor: 'pointer'}} className={lockedIcon }title={'Permite travar este campo para que o valor deste campo seja mantido em novas inclusões'} onClick={onLockIconClick.bind(this, fieldName)} />}
                    <label>{label}</label>
                </div>
                <AutoMultiSuggestionFormField isValueLocked={isValueLocked} style={style} contentClassName={contentClassName} boardId={boardId} placeHolder={placeHolder} getSuggestionFunc={getSuggestionFunc} initialData={selectedItems} onSelectItems={this._handleOnSelectItems}/>
            </Field>
        );
    }
}

module.exports = ComboMultiSelectField;
