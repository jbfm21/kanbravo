'use strict';

import * as airflux from 'airflux';
import Immutable from 'immutable';
import React from 'react';
import ReactSelectize from 'react-selectize';
import preludeExtension from 'prelude-extension';

import {injectIntl} from 'react-intl';


import {Content, Avatar} from '../../../../components';
import {FunctionHelper} from '../../../../commons';


import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {default as AutoSuggestionFormFieldStore} from './AutoSuggestionFormFieldStore';


var MultiSelect = ReactSelectize.MultiSelect;
var HighlightedText = ReactSelectize.HighlightedText;
var partitionString = preludeExtension.partitionString;
var StateRecord = Immutable.Record({dataStore: null, searchText: '', suggestions: [], selectedItems: null});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class AutoMultiSuggestionFormField extends React.Component
{
    static displayName = 'AutoMultiSuggestionFormField';

    static propTypes =
    {
        boardId: React.PropTypes.string.isRequired,
        getSuggestionFunc: React.PropTypes.object.isRequired,
        filterSuggestionFunc: React.PropTypes.func,
        placeHolder: React.PropTypes.string.isRequired,
        onSelectItems: React.PropTypes.func.isRequired,
        style: React.PropTypes.object,
        contentClassName: React.PropTypes.string,
        initialData: React.PropTypes.array,
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
        this.setImmutableState({selectedItems: this._createInitialValues(this.props)});
    }
    componentDidMount()
    {
        this.listenTo(this.state.data.dataStore, this._listenToSuggestionStore);
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.boardId !== nextProps.boardId)
        {
            this.setImmutableState({suggestions: [], searchText: ''});
        }
        this.setImmutableState({selectedItems: this._createInitialValues(nextProps)});
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
        this.state = {data: new StateRecord()};
        this.setImmutableState({suggestions: [], searchText: '', selectedItems: null});
    }

    _createInitialValues(props)
    {
        return (props.initialData) ? props.initialData.map(function(item) {return {label: item.title, value: item};}) : [];
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

    _handleValueChange = (items) => //eslint-disable-line no-unused-vars
    {
        if (FunctionHelper.isUndefined(items))
        {
            this.setImmutableState({selectedItems: null});
            this.props.onSelectItems(null);
            return;
        }
        this.setImmutableState({selectedItems: items});
        let selectedItemValues = items.map(i => i.value);
        this.props.onSelectItems(selectedItemValues);
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
        const {avatar, title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar &&
                        <div className={'centeredContainer'} style={{width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 2}}/></div>
                }
                <div style={{marginLeft: '10px'}}>
                    <HighlightedText partitions={item.labelPartitions} text={title} highlightStyle={{backgroundColor: 'rgba(255,255,0,0.4)', fontWeight: 'bold'}}/>
                </div>
            </div>
        );
    }

    _renderValue(item)
    {
        const {avatar, title} = item.value;
        const marginLeft = (avatar) ? '10px' : null;
        return (
            <div className="simple-value" style={{display: 'flex', alignItems: 'center'}}>
                {
                    avatar &&
                        <span style={{verticalAlign: 'middle', width: '24px', height: '24px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 2}}/></span>
                }
                <span style={{marginLeft: marginLeft, verticalAlign: 'middle'}}>{title}</span>
            </div>
        );
    }

    render() //eslint-disable-line no-unused-vars
    {
        const {searchText, suggestions, selectedItems} = this.state.data;
        const {placeHolder, style, contentClassName, isValueLocked} = this.props;
        return (
            <div className={'itemContainer'}>
                <Content className={contentClassName}>
                    <MultiSelect
                        delimiters={[188]}
                        disabled={isValueLocked}
                        style={style}
                        options={suggestions}
                        placeholder={placeHolder}
                        values={selectedItems}
                        closeOnSelect={true}
                        search={searchText}
                        onOpenChange={this._handleOpenChange}
                        onSearchChange={this._handleSearchChange}
                        onValuesChange={this._handleValueChange}
                        renderOption={this._renderOptions}
                        renderValue={this._renderValue}
                        renderNoResultsFound={function(value, search) { return <div className="no-results-found" style={{fontSize: 13}}>Nenhum resultado encontrado</div>;}} //eslint-disable-line
                    />
                </Content>
            </div>
       );
    }
}

module.exports = injectIntl(AutoMultiSuggestionFormField);
