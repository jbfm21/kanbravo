import React from 'react';
import {Paginator} from '../../../commons';
import Page from './Page.jsx';

export default class Pagination extends React.Component
{
    static displayName = 'Pagination';

    static propTypes =
    {
        totalItemsCount: React.PropTypes.number.isRequired,
        onChange: React.PropTypes.func.isRequired,
        style: React.PropTypes.object,
        activePage: React.PropTypes.number,
        pageRangeDisplayed: React.PropTypes.number,
        itemsCountPerPage: React.PropTypes.number,
        prevPageText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        nextPageText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        lastPageText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        firstPageText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element])
    };

    static defaultProps =
    {
        itemsCountPerPage: 10,
        pageRangeDisplayed: 5,
        activePage: 1,
        prevPageText: '<',
        nextPageText: '>',
        firstPageText: '<<',
        lastPageText: '>>'
    };

    _buildPage()
    {
        let pages = [];

        let {
            itemsCountPerPage,
            pageRangeDisplayed,
            activePage,
            prevPageText,
            nextPageText,
            firstPageText,
            lastPageText,
            totalItemsCount
        } = this.props;

        let paginationInfo = new Paginator(itemsCountPerPage, pageRangeDisplayed).build(totalItemsCount, activePage);

        if (paginationInfo.first_page !== paginationInfo.last_page)
        {
            for (let i = paginationInfo.first_page; i <= paginationInfo.last_page; i++)
            {
                pages.push(<Page isActive={i === activePage} key={i} pageNumber={i} onClick={this._handleSelectPage} />);
            }
        }
        else
        {
            let i = 1;
            pages.push(<Page isActive={i === activePage} key={i} pageNumber={i} onClick={this._handleSelectPage} />);
        }

        pages.unshift(
            <Page
                isActive={false}
                key={'prev' + paginationInfo.previous_page}
                pageNumber={paginationInfo.previous_page}
                onClick={this._handleSelectPage}
                pageText={prevPageText}
                disabled={!paginationInfo.has_previous_page}
            />
        );

        pages.unshift(
            <Page
                isActive={false}
                key={'firstPage'}
                pageNumber={1}
                onClick={this._handleSelectPage}
                pageText={firstPageText}
                disabled={!(paginationInfo.first_page > 1)}
            />
        );

        pages.push(
            <Page
                isActive={false}
                key={'next' + paginationInfo.next_page}
                pageNumber={paginationInfo.next_page}
                onClick={this._handleSelectPage}
                pageText={nextPageText}
                disabled={!(paginationInfo.has_next_page)}
            />
        );

        pages.push(
            <Page
                isActive={false}
                key={'lastPage'}
                pageNumber={paginationInfo.total_pages}
                onClick={this._handleSelectPage}
                pageText={lastPageText}
                disabled={!(paginationInfo.last_page !== paginationInfo.total_pages)}
            />
        );

        return pages;
    }

    _handleSelectPage = (e) =>
    {
        e.preventDefault();
        this.props.onChange(e.target.value);
    };

    render()
    {
        let pages = this._buildPage();
        return (
            <div className="ui right floated pagination borderless menu" style={this.props.style}>{pages}</div>
        );
    }
}
