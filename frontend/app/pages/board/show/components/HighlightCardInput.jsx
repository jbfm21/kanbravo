'use strict';

import React from 'react';
import * as airflux from 'airflux';
import classNames from 'classnames';
import {defineMessages, intlShape, injectIntl, FormattedMessage} from 'react-intl';

import ReactSelectize from 'react-selectize';
import preludeExtension from 'prelude-extension';
import Immutable from 'immutable';
import _ from 'lodash';

import {UIActions} from '../../../../actions';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {Content, Avatar} from '../../../../components';
import {FunctionHelper} from '../../../../commons';
import {default as HighlightCardSuggestionStore} from './HighlightCardSuggestionStore';
import {Checkbox} from 'react-semantify';

import {default as HighlightCardStore} from './HighlightCardStore';

const messages = defineMessages(
{
    placeHolder: {id: 'board.highlightCardInput.placeholder', description: 'Highlight Card Input placeholder', defaultMessage: 'Destacar cartões'},
    hideCards: {id: 'board.highlightCardInput.hideCards', description: '', defaultMessage: 'Não exibir cartão filtrado no quadro'}
});

var MultiSelect = ReactSelectize.MultiSelect;
var HighlightedText = ReactSelectize.HighlightedText;
var partitionString = preludeExtension.partitionString;
var StateRecord = Immutable.Record({isLoading: false, searchText: '', groups: [], suggestions: []});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
export default class HighlightCardInput extends React.Component
{
    static displayName = 'HighlightCardInput';

    static propTypes =
    {
        intl: intlShape.isRequired,
        boardId: React.PropTypes.string.isRequired
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord({})};
        this.listenTo(HighlightCardSuggestionStore, this._listenToSuggestionStore);
        this.listenTo(HighlightCardStore, this._listenToHighlightCardStoreChange);
    }

    clear()
    {
        this.setImmutableState({searchText: '', groups: [], suggestions: []});
        HighlightCardStore.clearState();
    }

    _listenToHighlightCardStoreChange() //eslint-disable-line
    {
        this.forceUpdate();
    }

    componentWillMount()
    {
        const storeState = HighlightCardSuggestionStore.getState();
        if (FunctionHelper.isDefined(storeState) && storeState.suggestions.length > 0)
        {
            //TODO: codigo repetido com: _handleSearchChange
            let suggestions = storeState.suggestions.map(function(item)
            {
                return {groupId: item.groupId, label: item.title, value: item, labelPartitions: partitionString(item.title.toLowerCase(), '')};
            });
            this.setImmutableState({groups: storeState.groups, suggestions: suggestions});
        }
    }

    _listenToSuggestionStore(store)
    {
        let that = this;
        let suggestions = store.state.suggestions.map((item) =>
        {
            return {label: item.title, value: item, labelPartitions: partitionString(item.title.toLowerCase(), that.state.data.searchText.toLowerCase())};
        });
        this.setImmutableState({isLoading: false, groups: store.state.groups, suggestions: suggestions});
    }

    _handleToogleIsToHideCards = () =>
    {
        UIActions.highlightCard.asFunction(HighlightCardStore.getState().selectedItems, !HighlightCardStore.getState().isToHideFilterCards);
    }

    _handleValueChange = (items) => //eslint-disable-line no-unused-vars
    {
        this.setImmutableState({searchText: ''});
        if (FunctionHelper.isUndefined(items))
        {
            items = [];
        }
        _(items).forEach((value) => {value['key'] = FunctionHelper.uuid();}); //eslint-disable-line
        UIActions.highlightCard.asFunction(items, HighlightCardStore.getState().isToHideFilterCards);
    };

    _handleSearchChange = (search) =>
    {
        this.setImmutableState({searchText: search});
        let suggestions = this.state.data.suggestions.map(function(item)
        {
            return {groupId: item.value.groupId, label: item.label, value: item.value, labelPartitions: partitionString(item.label.toLowerCase(), search.toLowerCase())};
        });
        this.setImmutableState({suggestions: suggestions});
    };

    _renderOptions(item)
    {
        let {avatar, title} = item.value;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center', fontSize: '10px'}}>
                {
                    avatar &&
                        <div className={'centeredContainer'} style={{width: '20px', height: '20px', lineHeight: 1}}><Avatar isToShowBackGroundColor avatar={avatar} style={{width: '24px', height: '24px', lineHeight: 2}}/></div>
                }
                <div style={{marginLeft: '5px'}}>
                    <HighlightedText partitions={item.labelPartitions} text={title} highlightStyle={{backgroundColor: 'rgba(255,255,0,0.4)', fontWeight: 'bold'}}/>
                </div>
            </div>
        );
    }

    _renderValue(item)
    {
        let {title} = item.value;
        let backgroundColor = (item.groupId === 'orOperator') ? 'rgb(193, 239, 252)' : 'lightgray';
        return (
            <div style={{display: 'flex'}}>
                <span style={{marginLeft: '5px', verticalAlign: 'middle', backgroundColor: backgroundColor, padding: '2px'}}>{title}</span>
            </div>
        );
    }

    _filterOptions(options, values, search) //eslint-disable-line
    {
        return _.filter(options, (it) => (FunctionHelper.isNullOrEmpty(search)) ? true : it.label.toLowerCase().trim().indexOf(search.toLowerCase().trim()) > -1);
    }

    render()
	{
        let {searchText, groups, suggestions, isLoading} = this.state.data;
        let {selectedItems, isToHideFilterCards} = HighlightCardStore.getState();
        let {intl} = this.props;
        let style = {marginLeft: '5px', width: '900px', zIndex: '3', fontSize: '10px'};
        return (
            <div className={'itemContainer highlightCardInput'}>
                <Content style={{display: 'flex'}}>
                    <MultiSelect
                        delimiters={[188]}
                        style={style}
                        groups={groups}
                        groupsAsColumns={true}
                        disabled={isLoading}
                        options={suggestions}
                        values={selectedItems}
                        closeOnSelect={true}
                        filterOptions={this._filterOptions}
                        placeholder={intl.formatMessage(messages.placeHolder)}
                        search={searchText}
                        onSearchChange={this._handleSearchChange}
                        onValuesChange={this._handleValueChange}
                        renderOption={this._renderOptions}
                        renderValue={this._renderValue}
                        renderNoResultsFound={function(value, search) { return <div className="no-results-found" style={{fontSize: 13}}>Nenhum resultado encontrado</div>;}} //eslint-disable-line
                    />
                    <Checkbox style={{marginLeft: '5px', marginTop: '10px', height: '12px', minHeight: '12px'}} init={{onChange: this._handleToogleIsToHideCards}} className={classNames({'ui tiny': true, checked: isToHideFilterCards})}>
                        <input type="checkbox" defaultChecked={isToHideFilterCards} /><span style={{marginLeft: '20px'}}><FormattedMessage {...messages.hideCards}/></span>
                    </Checkbox>
                </Content>
            </div>
       );
    }
}

module.exports = injectIntl(HighlightCardInput, {withRef: true});
