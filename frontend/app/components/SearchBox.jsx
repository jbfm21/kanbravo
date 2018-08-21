'use strict';

import React from 'react';
import {Icon, Input} from 'react-semantify';

export default class SearchBox extends React.Component
{
    static propTypes =
    {
        onSearch: React.PropTypes.func.isRequired,
        query: React.PropTypes.string,
        placeHolder: React.PropTypes.string
    };

    _handleDoSearch = () =>
    {
        this.props.onSearch(this.searchInput.value);
    }

    render()
    {
         const {onSearch, query, placeHolder, className, ...others} = this.props; //eslint-disable-line
         let classNameToSet = (className) ? className : 'mini icon';
         return (
             <Input className={classNameToSet} {...others} >
                 <input type="text" ref={(c) => {this.searchInput = c;}} placeholder={placeHolder} value={query} onChange={this._handleDoSearch}/>
                 <Icon className="search"/>
             </Input>
         );
    }
}

