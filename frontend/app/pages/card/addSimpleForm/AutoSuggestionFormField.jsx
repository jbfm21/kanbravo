'use strict';

import * as airflux from 'airflux';
import Immutable from 'immutable';
import React from 'react';
import ReactSelectize from 'react-selectize';
import preludeExtension from 'prelude-extension';

import {injectIntl} from 'react-intl';

import {Content} from '../../../components';
import {FunctionHelper} from '../../../commons';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../decorators';
import {default as AutoSuggestionFormFieldStore} from './AutoSuggestionFormFieldStore';

let SimpleSelect = ReactSelectize.SimpleSelect;
let HighlightedText = ReactSelectize.HighlightedText;
let partitionString = preludeExtension.partitionString;
let StateRecord = Immutable.Record({dataStore: null, searchText: '', suggestions: [], selectedItem: null});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class AutoSuggestionFormField extends React.Component
{
    static displayName = 'AutoSuggestionFormField';

    static propTypes =
    {
        boardId: React.PropTypes.string.isRequired,
        getSuggestionFunc: React.PropTypes.object.isRequired,
        filterSuggestionFunc: React.PropTypes.func,
        placeHolder: React.PropTypes.string.isRequired,
        onSelectItem: React.PropTypes.func.isRequired,
        style: React.PropTypes.object,
        initialData: React.PropTypes.object
    };

    constructor(props)
    {
        super();
        this.state = {data: new StateRecord({dataStore: new AutoSuggestionFormFieldStore(props.getSuggestionFunc, props.filterSuggestionFunc)})};
    }

    componentWillMount()
    {
        const initialValue = (this.props.initialData) ? {label: this.props.initialData.title, value: this.props.initialData} : null;
        this.setImmutableState({selectedItem: initialValue});
    }
    componentDidMount()
    {
        this.listenTo(this.state.data.dataStore, this._listenToSuggestionStore);
    }

    componentWillReceiveProps(nextProps)
    {
        const initialValue = (nextProps.initialData) ? {label: nextProps.initialData.title, value: nextProps.initialData} : null;
        this.setImmutableState({selectedItem: initialValue});
    }

    componentWillUnMount()
    {
        this.clearState();
    }

    //Metodo usado externamente
    clearState = () =>
    {
        this.setImmutableState({suggestions: [], searchText: '', selectedItem: null});
    }

    _listenToSuggestionStore(store)
    {
        const that = this;
        switch (store.actionState)
        {
            case this.state.data.dataStore.getSuggestionFunction().completed:
                let suggestions = store.state.suggestions.map((item) =>
                {
                    return {label: item.title, value: item, labelPartitions: partitionString(item.title.toLowerCase(), that.state.data.searchText.toLowerCase())};
                });
                this.setImmutableState({suggestions: suggestions});
                break;
            default: break;
        }
    }

    _handleOptionSelected = (item) => //eslint-disable-line no-unused-vars
    {
        const itemValue = FunctionHelper.isDefined(item) ? item.value : null;
        this.setImmutableState({selectedItem: item});
        this.props.onSelectItem(itemValue);
    };

    _handleSearchChange = (search) =>
    {
        this.setImmutableState({searchText: search});
        if (!this.state.data.suggestions.length)
        {
            this.state.data.dataStore.getSuggestionFunction().asFunction(this.props.boardId, '[searchAll]');
            return;
        }
        let suggestions = this.state.data.suggestions.map(function(item)
        {
            return {label: item.label, value: item.value, labelPartitions: partitionString(item.label.toLowerCase(), search.toLowerCase())};
        });
        this.setImmutableState({suggestions: suggestions});
    };

    _handleOpenChange = (isOpen) =>
    {
        if (isOpen && !this.state.data.suggestions.length)
        {
            this._handleSearchChange(this.state.data.searchText);
        }
    };

    _renderOptions(item)
    {
        let {title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                <div style={{marginLeft: '10px'}}>
                    <HighlightedText partitions={item.labelPartitions} text={title} highlightStyle={{backgroundColor: 'rgba(255,255,0,0.4)', fontWeight: 'bold'}}/>
                </div>
            </div>
        );
    }

    _renderValue(item)
    {
        let {title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginLeft: '10px', verticalAlign: 'middle'}}>{title}</span>
            </div>
        );
    }
    _createUid = (item) =>
    {
        return item.label + this.state.data.searchText;
    };

    render() //eslint-disable-line no-unused-vars
    {
        let {searchText, suggestions, selectedItem} = this.state.data;
        let {placeHolder, style} = this.props;
        return (
            <div className={'itemContainer'}>
                <Content>
                    <SimpleSelect
                        style={style}
                        options={suggestions}
                        placeholder={placeHolder}
                        value={selectedItem}
                        search={searchText}
                        onOpenChange={this._handleOpenChange}
                        onSearchChange={this._handleSearchChange}
                        onValueChange={this._handleOptionSelected}
                        renderOption={this._renderOptions}
                        renderValue={this._renderValue}
                        renderNoResultsFound={function(value, search) { return <div className="no-results-found" style={{fontSize: 13}}>Nenhum resultado encontrado</div>;}} //eslint-disable-line
                    />
                </Content>
            </div>
       );
    }
}

module.exports = injectIntl(AutoSuggestionFormField, {withRef: true});
