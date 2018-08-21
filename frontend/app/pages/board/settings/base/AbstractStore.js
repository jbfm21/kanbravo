'use strict';

import Immutable from 'immutable';

import {ExtendedStore} from '../../../../commons';
import {UIActions} from '../../../../actions';


var StateRecord = Immutable.Record({boardId: null, entities: null});

export default class AbstractStore extends ExtendedStore
{
    constructor(entityActions)
    {
        super();
        this.state = new StateRecord();
        this._entityActions = entityActions;


        this.listenToAsyncFnAutoBind(entityActions.list, this, {progressed: this.triggerEmpty, completed: this.onListCompleted, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(entityActions.add, this, {progressed: this.triggerEmpty, completed: this.onAddCompleted, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(entityActions.update, this, {progressed: this.triggerEmpty, completed: this.onUpdateCompleted, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(entityActions.delete, this, {progressed: this.triggerEmpty, completed: this.onDeleteCompleted, failed: this.showErrorMessage});
    }

    getActions()
    {
        return this._entityActions;
    }

	onListCompleted(actionState, response) //eslint-disable-line no-unused-vars
	{
        this.state = new StateRecord({boardId: response.body.boardId, entities: response.body.data});
        this.triggerWithActionState(actionState, this.state);
	}

    updateList()
    {
        UIActions.refreshCacheBoardAllConfiguration.asFunction();
        this._entityActions.list.asFunction(this.state.boardId);
    }

    onAddCompleted(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
        this.updateList();
    }

    onUpdateCompleted(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
        this.updateList();
    }

    onDeleteCompleted(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerEmpty(actionState);
        this.updateList();
    }

}
