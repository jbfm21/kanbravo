'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore, FunctionHelper} from '../../../../commons';
import _ from 'lodash';

class ArchiveReportStore extends ExtendedStore
{

    state: {cardList: [], after: 0, before: 0, totalInDb: 0};

    constructor()
    {
        super();
        this.state = {cardList: [], after: 0, before: 0, totalInDb: 0};
        this.listenToAsyncFnAutoBind(KanbanActions.card.listInArchive, this, {progressed: this.triggerEmpty});
        this.listenToAsyncFnAutoBind(KanbanActions.card.update, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    clearState()
    {
        this.state = {cardList: [], after: 0, before: 0, totalInDb: 0};
    }

    card_listInArchive_progressed(actionState, response) //eslint-disable-line
    {
        this.triggerEmpty();
    }

    card_listInArchive_completed(actionState, response) //eslint-disable-line no-unused-vars
    {
        let {after, before, total, data} = response.body;
        if (FunctionHelper.isArrayNotEmpty(data))
        {
            this.setState({cardList: data, after: after, before: before, totalInDb: total});
        }
        this.triggerWithActionState(actionState, this.state);
    }

    card_listInArchive_failed(actionState, response)
    {
        this.setState({cardList: [], after: 0, before: 0, totalInDb: 0});
        this.goToErrorPage(actionState, response);
    }

    card_update_completed(actionState, response) //eslint-disable-line
    {
        const savedCard = response.body.data;
        let {cardList} = this.state;
        const savedCardIndex = _.findIndex(cardList, {_id: savedCard._id});
        if (savedCardIndex >= 0)
        {
            cardList[savedCardIndex] = savedCard;
            this.setState({cardList: cardList});
        }
        this.triggerWithActionState(actionState, this.state);
    }
}

module.exports = new ArchiveReportStore();

