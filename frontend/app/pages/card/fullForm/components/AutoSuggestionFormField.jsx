'use strict';

import * as airflux from 'airflux';
import Immutable from 'immutable';
import React from 'react';
import ReactSelectize from 'react-selectize';
import preludeExtension from 'prelude-extension';

import {injectIntl} from 'react-intl';


import {Content, Avatar} from '../../../../components';
import {FunctionHelper} from '../../../../commons';


import {ImmutableState} from '../../../../decorators';
import {default as AutoSuggestionFormFieldStore} from './AutoSuggestionFormFieldStore';


var SimpleSelect = ReactSelectize.SimpleSelect;
var HighlightedText = ReactSelectize.HighlightedText;
var partitionString = preludeExtension.partitionString;
var StateRecord = Immutable.Record({dataStore: null, searchText: '', suggestions: [], selectedItem: null});

@airflux.FluxComponent
@ImmutableState
//@ImmutableShouldUpdateComponent
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
        contentClassName: React.PropTypes.string,
        style: React.PropTypes.object,
        showAvatar: React.PropTypes.bool,
        initialData: React.PropTypes.object,
        isValueLocked: React.PropTypes.bool
    };

    static defaultProps =
    {
        showAvatar: true,
        isValueLocked: false
    };

    constructor(props)
    {
        super();
        this.state = {data: new StateRecord({dataStore: new AutoSuggestionFormFieldStore(props.getSuggestionFunc, props.filterSuggestionFunc)})};
    }

    componentWillMount()
    {
        let initialValue = (this.props.initialData) ? {label: this.props.initialData.title, value: this.props.initialData} : null;
        this.setImmutableState({selectedItem: initialValue});
    }
    componentDidMount()
    {
        this.listenTo(this.state.data.dataStore, this._listenToSuggestionStore);
    }

    componentWillReceiveProps(nextProps)
    {
        let initialValue = (nextProps.initialData) ? {label: nextProps.initialData.title, value: nextProps.initialData} : null;
        if (this.props.boardId !== nextProps.boardId)
        {
            this.setImmutableState({suggestions: [], searchText: ''});
        }
        this.setImmutableState({selectedItem: initialValue});
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (this.props.boardId !== nextProps.boardId) ||
                (this.props.getSuggestionFunc !== nextProps.getSuggestionFunc) ||
                (this.props.filterSuggestionFunc !== nextProps.filterSuggestionFunc) ||
                (this.props.placeHolder !== nextProps.placeHolder) ||
                (this.props.onSelectItems !== nextProps.onSelectItems) ||
                (this.props.style !== nextProps.style) ||
                (this.props.initialData !== nextProps.initialData) || this.state !== nextState;
    }

    componentWillUnMount()
    {
        this.clearState();
    }

    //Metodo usado externamente
    clearState = () =>
    {
        this.state = {data: new StateRecord()};
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
        let itemValue = FunctionHelper.isDefined(item) ? item.value : null;
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
        let {avatar, title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar &&
                        <div className={'centeredContainer'} style={{width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 1.7}}/></div>
                }
                <div style={{marginLeft: '10px'}}>
                    <HighlightedText partitions={item.labelPartitions} text={title} highlightStyle={{backgroundColor: 'rgba(255,255,0,0.4)', fontWeight: 'bold'}}/>
                </div>
            </div>
        );
    }

    _renderValue = (item) =>
    {
        let {showAvatar} = this.props;
        let {avatar, title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar && showAvatar &&
                        <span style={{verticalAlign: 'middle', width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 2}}/></span>
                }
                <span style={{marginLeft: (showAvatar) ? '10px' : '0px', verticalAlign: 'middle'}}>{title}</span>
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

        let {placeHolder, style, contentClassName, isValueLocked} = this.props;
        return (
            <div className={'itemContainer'}>
                <Content className={contentClassName}>
                    <SimpleSelect
                        style={style}
                        disabled={isValueLocked}
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

module.exports = injectIntl(AutoSuggestionFormField);
