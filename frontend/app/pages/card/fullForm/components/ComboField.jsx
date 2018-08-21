'use strict';
import React from 'react';

import {Icon, Field} from 'react-semantify';
import {default as AutoSuggestionFormField} from './AutoSuggestionFormField.jsx';


class ComboField extends React.Component
{
    static displayName = 'ComboField';

    static propTypes =
    {
        boardId: React.PropTypes.string.isRequired,
        fieldName: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        selectedItem: React.PropTypes.object,
        style: React.PropTypes.object,
        placeHolder: React.PropTypes.string.isRequired,
        getSuggestionFunc: React.PropTypes.object.isRequired,
        filterSuggestionFunc: React.PropTypes.func,
        onSelectItem: React.PropTypes.func.isRequired,
        contentClassName: React.PropTypes.string,
        showAvatar: React.PropTypes.bool,
        isValueLocked: React.PropTypes.bool,
        onLockIconClick: React.PropTypes.func

    };

    static defaultProps =
    {
        showAvatar: true,
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
                (this.props.selectedItem !== nextProps.selectedItem) ||
                (this.props.style !== nextProps.style) ||
                (this.props.placeHolder !== nextProps.placeHolder) ||
                (this.props.getSuggestionFunc !== nextProps.getSuggestionFunc) ||
                (this.props.filterSuggestionFunc !== nextProps.filterSuggestionFunc) ||
                (this.props.isValueLocked !== nextProps.isValueLocked) ||
                (this.props.onLockIconClick !== nextProps.onLockIconClick) ||
                (this.props.onSelectItem !== nextProps.onSelectItem);
    }

    _handleOnSelectItem = (item) =>
    {
        this.props.onSelectItem(this.props.fieldName, item);
        this.forceUpdate();
    }

    render() //eslint-disable-line no-unused-vars
    {
        let {onLockIconClick, style, label, fieldName, boardId, selectedItem, placeHolder, getSuggestionFunc, filterSuggestionFunc, showAvatar, isValueLocked, contentClassName} = this.props;
        let lockedIcon = isValueLocked ? 'lock' : 'unlock';
        return (
            <Field>
                <div style={{display: 'flex'}}>
                    {onLockIconClick && <Icon style={{cursor: 'pointer'}} title={'Permite travar este campo para que o valor deste campo seja mantido em novas inclusões'} className={lockedIcon} onClick={onLockIconClick.bind(this, fieldName)} />}
                    <label>{label}</label>
                </div>
                <AutoSuggestionFormField isValueLocked={isValueLocked} showAvatar={showAvatar} contentClassName={contentClassName} style={style} boardId={boardId} placeHolder={placeHolder} filterSuggestionFunc={filterSuggestionFunc} getSuggestionFunc={getSuggestionFunc} initialData={selectedItem} onSelectItem={this._handleOnSelectItem}/>
            </Field>
        );
    }
}

module.exports = ComboField;
