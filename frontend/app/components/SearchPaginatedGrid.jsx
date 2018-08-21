'use strict';

import React from 'react';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {Grid, Icon, Search, Input} from 'react-semantify';

import {ImmutableState} from '../decorators';
import {Container, Pagination} from '../components';

const messages = defineMessages(
{
    searchPlaceHolder: {id: 'searchPaginatedGrid.searchPlaceHolder', description: 'Search place holder', defaultMessage: 'Pesquisar...'}
});

var StateRecord = Immutable.Record({
    provider: null,
    searchText: '',
    activeGridPage: 1,
    paginatedItems: null
});

@ImmutableState
class SearchPaginatedGrid extends React.Component
{
    static displayName = 'SearchPaginatedGrid';

    static propTypes =
    {
        intl: intlShape.isRequired,
        className: React.PropTypes.string,
        selectedItem: React.PropTypes.string,
        provider: React.PropTypes.object,
        itemsPerPage: React.PropTypes.number,
        onRenderItem: React.PropTypes.func.isRequired,
        children: React.PropTypes.node
    };

    static defaultProps =
    {
        itemsPerPage: 20,
        className: 'seven column withScrollBar text'
    };

    constructor()
    {
        super();
        this.state = {data: new StateRecord({})};
    }

    componentWillMount()
    {
        let {searchText, activeGridPage} = this.state.data;
        this._setPageData(activeGridPage, searchText);
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return (this.state.data !== nextState.data || this.props.selectedItem !== nextProps.selectedItem);
    }

    _handleChangeSearchText = (e) =>
    {
        let searchText = e.target.value;
        let pageNumber = 1;
        this._setPageData(pageNumber, searchText);
    };

    _setPageData(pageNumber, searchText)
    {
        let paginatedItems = this.props.provider.getPaginatedItems(pageNumber, this.props.itemsPerPage, searchText);
        this.setImmutableState({searchText: searchText, activeGridPage: parseInt(pageNumber, 0), paginatedItems: paginatedItems});
    }

    _handlePageChange = (pageNumber) =>
    {
        this._setPageData(pageNumber, this.state.data.searchText);
    };

    render()
    {
        let that = this;
        const {formatMessage} = this.props.intl;
        let {className, itemsPerPage} = this.props;
        let {searchText, activeGridPage, paginatedItems} = this.state.data;
        let searchPlaceholder = formatMessage(messages.searchPlaceHolder);
        return (
            <Container className="ui fluid gridContainer">
                <Search>
                    <Input className="fluid icon">
                        <input className="prompt" type="text" placeholder={searchPlaceholder} value={searchText} onChange={this._handleChangeSearchText} / >
                        <Icon className="search" />
                    </Input>
                </Search>
                <Grid className={className}>
                    {
                        this.state.data.paginatedItems.data.map(function(item)
                        {
                            return that.props.onRenderItem(item);
                        })
                    }
                </Grid>
                <Pagination activePage={activeGridPage} itemsCountPerPage={itemsPerPage} totalItemsCount={paginatedItems.total} onChange={this._handlePageChange}/>
            </Container>
       );
    }
}

module.exports = injectIntl(SearchPaginatedGrid);
