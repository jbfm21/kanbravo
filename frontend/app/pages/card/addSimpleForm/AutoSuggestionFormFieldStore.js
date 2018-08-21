'use strict';
import _ from 'lodash';
import {ExtendedStore} from '../../../commons';

export default class AutoSuggestionFormFieldStore extends ExtendedStore
{
    constructor(getSuggestionFunction, filterSuggestionFunction)
    {
        super();
        this._getSuggestionFunction = getSuggestionFunction;
        this._filterSuggestionFunction = filterSuggestionFunction;
        this.listenToAsyncFnAutoBind(getSuggestionFunction, this, {progressed: null, completed: this.onSearchCompleted, failed: this.showErrorMessage});
    }

    getSuggestionFunction()
    {
        return this._getSuggestionFunction;
    }

    onSearchCompleted(actionState, response)
	{
        let suggestions = response.body.data;
        if (this._filterSuggestionFunction)
        {
            suggestions = _(suggestions).filter(this._filterSuggestionFunction).value();
        }
        suggestions.unshift({title: '<em branco>', ratings: [], attachments: []});
        this.triggerWithActionState(actionState, {suggestions: suggestions});
    }

}
