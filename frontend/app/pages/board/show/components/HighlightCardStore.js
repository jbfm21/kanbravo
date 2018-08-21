'use strict';

import * as airflux from 'airflux';
import _ from 'lodash';

import {UIActions} from '../../../../actions';

class HighlightCardStore extends airflux.Store
{
    static display = 'HighlightCardStore';

    constructor()
    {
        super();
        this.state = {filterQuery: '', selectedItems: [], isToHideFilterCards: false};
        this.listenTo(UIActions.highlightCard, this._onHighlightCard);
    }

    getState()
	{
		return this.state;
	}

    clearState()
    {
        this.state = {filterQuery: '', selectedItems: [], isToHideFilterCards: false};
    }

	_onHighlightCard(selectedItems, isToHideFilterCards) //eslint-disable-line
	{
        this.state = {filterQuery: this._createFilterQuery(selectedItems), selectedItems: selectedItems, isToHideFilterCards: isToHideFilterCards};
        this.trigger({state: this.state});
	}

    _createFilterQuery = (selectedItems) =>
    {
        let orOperator = '|';
        let transformedText = _(selectedItems).map('value').map((item) =>
        {
            if ((item.title === orOperator) || (item.title.toLowerCase() === 'or') || (item.title.toLowerCase() === 'ou'))
            {
                return orOperator;
            }
            if (item._id === null)
            {
                //não contém a propriedade (vazio)
                return `(^((?!\"${item.property}\").)*$|(?=.*\"${item.property}\":null)|(?=.*\"${item.property}\":\\[\\]))`;
            }
            //contem a propriedade
            return `(?=.*\"_id\":\"${item._id}\")`; //permite pesquisa fora de ordem em uma string
        }).join('');

        transformedText = _.trimEnd(transformedText, orOperator);
        transformedText = _.trimStart(transformedText, orOperator);
        return transformedText;
    }
}

module.exports = new HighlightCardStore();
