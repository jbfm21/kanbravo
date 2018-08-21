'use strict';

import Immutable from 'Immutable';
import _ from 'lodash';

import {KanbanActions, UIActions} from '../../../../actions';
import {FunctionHelper, ExtendedStore} from '../../../../commons';
import {ImmutableState} from '../../../../decorators';


var StateRecord = Immutable.Record({card: null, oldComments: [], newComments: [], after: null, before: null, limit: 0, totalOfCommentsInDb: 0});

@ImmutableState
class CardCommentStore extends ExtendedStore
{
    static startLimit = 10;

    constructor()
    {
        super();
        this.listenTo(UIActions.showCardCommentModal, this._onCardCommentModalShow);

        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.list, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.listOldComment, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.listNewComment, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.add, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.delete, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.cardSetting.comment.update, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});

        this.state = {data: new StateRecord({})};
    }

    clearState()
    {
        this.state = {data: new StateRecord({})};
    }

    getState()
    {
        return this.state.data;
    }

    _onCardCommentModalShow(card) //eslint-disable-line
	{
        this.state = {data: new StateRecord({card: card})};
        this.triggerWithActionState(UIActions.showCardCommentModal);
        KanbanActions.cardSetting.comment.listOldComment.asFunction(card, '', CardCommentStore.startLimit);
	}

    cardSetting_comment_list_completed(actionState, response)
    {
        const {data} = response.body;
        let comments = _.sortBy(data, (o) => o['_id']); //eslint-disable-line
        const lastCommentId = comments[comments.length - 1]._id;
        this.setImmutableState({before: null, after: lastCommentId, totalOfCommentsInDb: comments.length, oldComments: comments, newComments: []});
        this.triggerWithActionState(actionState);
    }

    cardSetting_comment_listOldComment_completed(actionState, response)
    {
        let {before, after, limit, total, data} = response.body;
        if (FunctionHelper.isDefined(this.state.data.after))
        {
            after = this.state.data.after;
        }
        //TODO: colocar lodashd flow aqui
        let oldComments = this.state.data.oldComments;
        oldComments = data.concat(oldComments);
        oldComments = _.sortBy(oldComments, (o) => o['_id']); //eslint-disable-line

        this.setImmutableState({before: before, after: after, limit: limit, totalOfCommentsInDb: total, oldComments: oldComments});
        this.triggerWithActionState(actionState);
    }

    cardSetting_comment_listNewComment_completed(actionState, response)
    {
        let {after, limit, total, data} = response.body;
        if (FunctionHelper.isUndefined(after))
        {
            after = this.state.data.after;
        }

        let newComments = this.state.data.newComments;
        newComments = data.concat(newComments);

        this.setImmutableState({after: after, limit: limit, totalOfCommentsInDb: total, newComments: newComments});
        this.triggerWithActionState(actionState);
    }

    cardSetting_comment_add_completed(actionState, response) //eslint-disable-line
    {
        const comment = response.body.data;
        let newComments = this.state.data.newComments.concat(comment);
        this.setImmutableState({newComments: newComments});
        this.triggerWithActionState(actionState);
    }

    cardSetting_comment_delete_completed(actionState, response)
    {
        const deletedCommentId = response.body.deletedId;
        let oldComments = this.state.data.oldComments.filter(function (candidate)
        {
            return candidate._id !== deletedCommentId;
		});

        let newComments = this.state.data.newComments.filter(function (candidate)
        {
			return candidate._id !== deletedCommentId;
		});

        const totalOfCommentsInDb = this.state.data.totalOfCommentsInDb - 1;

        this.setImmutableState({oldComments: oldComments, newComments: newComments, totalOfCommentsInDb: totalOfCommentsInDb});

        this.triggerWithActionState(actionState);
    }

     cardSetting_comment_update_completed(actionState, response) //eslint-disable-line
    {
        const savedComment = response.body.data;
        let comment = _.find(this.state.data.newComments, function(o) { return o._id === savedComment._id; });
        if (comment)
        {
            _.assign(comment, savedComment);
        }

        comment = _.find(this.state.data.oldComments, function(o) { return o._id === savedComment._id; });
        if (comment)
        {
            _.assign(comment, savedComment);
        }

        this.triggerWithActionState(actionState);
    }

}

module.exports = new CardCommentStore();


