'use strict';
import React from 'react';

import {Field} from 'react-semantify';
import {default as AutoSuggestionFormField} from './AutoSuggestionFormField.jsx';


class ComboField extends React.Component
{
    static displayName = 'ComboField';

    static propTypes =
    {
        boardId: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        selectedItem: React.PropTypes.object,
        style: React.PropTypes.object,
        placeHolder: React.PropTypes.string.isRequired,
        getSuggestionFunc: React.PropTypes.object.isRequired,
        filterSuggestionFunc: React.PropTypes.func,
        onSelectItem: React.PropTypes.func.isRequired
    };

    constructor()
    {
        super();
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (this.props.boardId !== nextProps.boardId) ||
                (this.props.label !== nextProps.label) ||
                (this.props.selectedItem !== nextProps.selectedItem) ||
                (this.props.style !== nextProps.style) ||
                (this.props.placeHolder !== nextProps.placeHolder) ||
                (this.props.getSuggestionFunc !== nextProps.getSuggestionFunc) ||
                (this.props.filterSuggestionFunc !== nextProps.filterSuggestionFunc) ||
                (this.props.onSelectItem !== nextProps.onSelectItem);
    }

    _handleOnSelectItem = (item) =>
    {
        this.props.onSelectItem(item);
        this.forceUpdate();
    }

    clearState = () =>
    {
        this.autoSuggestionFormField.getWrappedInstance().clearState();
    }

    render() //eslint-disable-line no-unused-vars
    {
        let {style, label, boardId, selectedItem, placeHolder, getSuggestionFunc, filterSuggestionFunc} = this.props;
        return (
            <Field>
                <label>{label}</label>
                <AutoSuggestionFormField ref={(c) => {this.autoSuggestionFormField = c;}} filterSuggestionFunc={filterSuggestionFunc} style={style} boardId={boardId} placeHolder={placeHolder} getSuggestionFunc={getSuggestionFunc} initialData={selectedItem} onSelectItem={this._handleOnSelectItem}/>
            </Field>
        );
    }
}

module.exports = ComboField;
