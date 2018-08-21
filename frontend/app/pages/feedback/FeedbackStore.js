'use strict';

import {KanbanActions} from '../../actions';
import {ExtendedStore} from '../../commons';

class FeedBackStore extends ExtendedStore
{

    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.feedback.add, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    feedback_add_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        this.triggerWithActionState(actionState);
    }
}

module.exports = new FeedBackStore();
