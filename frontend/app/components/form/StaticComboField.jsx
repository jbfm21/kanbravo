//TODO: Intercionalizar
import React, {Component} from 'react';
import _ from 'lodash';

import ReactSelectize from 'react-selectize';
import preludeExtension from 'prelude-extension';

import Immutable from 'immutable';

import {ImmutableState} from '../../decorators';
import {FunctionHelper} from '../../commons';

let SimpleSelect = ReactSelectize.SimpleSelect;
let HighlightedText = ReactSelectize.HighlightedText;
let partitionString = preludeExtension.partitionString;

var StateRecord = Immutable.Record({selectedData: null, searchText: '', suggestions: []});

@ImmutableState
export default class StaticComboField extends Component
{
    static displayName = 'StaticComboField';

    static propTypes =
    {
        onChangeData: React.PropTypes.func.isRequired,
        getSuggestions: React.PropTypes.func.isRequired,
        propName: React.PropTypes.string.isRequired,
        showValueInLabelIfDistinct: React.PropTypes.bool,
        placeHolder: React.PropTypes.string,
        initialValue: React.PropTypes.any
    };

    static defaultProps =
    {
        showValueInLabelIfDistinct: false
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
    {
        this._setDropDownSuggestions(this.props);
    }

    componentWillReceiveProps(nextProps) //eslint-disable-line
    {
        this._setDropDownSuggestions(nextProps);
    }

    _setDropDownSuggestions(props)
    {
        let {initialValue} = props;
        let suggestions = this.props.getSuggestions();
        suggestions = _(suggestions).filter(item => FunctionHelper.isDefined(item.label)).value();
        let dropwDownList = suggestions.map(item =>
        {
            let label = (this.props.showValueInLabelIfDistinct && item.label !== item.value) ? `${item.label} (${item.value})` : item.label;
            return {label: label, value: item.value, labelPartitions: partitionString(label.toLowerCase(), this.state.data.searchText.toLowerCase())};
        });
        let selectedData = _.find(dropwDownList, {value: initialValue});
        this.setImmutableState({selectedData: selectedData, suggestions: dropwDownList});
    }

    _handleOptionSelected = (item) => //eslint-disable-line no-unused-vars
    {
       const itemValue = FunctionHelper.isDefined(item) ? item.value : null;
       this.props.onChangeData({[this.props.propName]: itemValue});
    };

    _handleSearchChange = (search) =>
    {
        this.setImmutableState({searchText: search});
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
        let {label} = item;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                <div style={{marginLeft: '10px'}}>
                    <HighlightedText partitions={item.labelPartitions} text={label} highlightStyle={{backgroundColor: 'rgba(255,255,0,0.4)', fontWeight: 'bold'}}/>
                </div>
            </div>
        );
    }

    _renderValue(item)
    {
        let {label} = item;
        return (
            <div className="simple-option" style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginLeft: '10px', verticalAlign: 'middle'}}>{label}</span>
            </div>
        );
    }

    render()
    {
        let {placeHolder, style} = this.props;
        let {suggestions, searchText, selectedData} = this.state.data;

        return (
            <SimpleSelect
                style={style}
                options={suggestions}
                placeHolder={placeHolder}
                value={selectedData}
                search={searchText}
                onOpenChange={this._handleOpenChange}
                onSearchChange={this._handleSearchChange}
                onValueChange={this._handleOptionSelected}
                renderOption={this._renderOptions}
                renderValue={this._renderValue}
                renderNoResultsFound={function(value, search) { return <div className="no-results-found" style={{fontSize: 13}}>Nenhum resultado encontrado</div>;}} //eslint-disable-line
            />
        );
    }

}

