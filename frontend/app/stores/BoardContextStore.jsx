'use strict';
import _ from 'lodash';
import {KanbanActions, UIActions} from '../actions';
import {ExtendedStore, FunctionHelper} from '../commons';
import {BoardShowStore} from '../stores';

class BoardContextStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.state = {selectedBoardAllConfig: null, selectedBoard: null};
        this.listenTo(BoardShowStore, this._listenToBoardShowStoreChange);
        this.listenTo(BoardShowStore, this._listenToBoardShowStoreChange);

        this.listenTo(UIActions.contextUpdated, this.contextUpdated);
        this.listenTo(UIActions.refreshCacheBoardAllConfiguration, this._onRefreshCacheBoardAllConfiguration);

        this.listenTo(KanbanActions.cache.cacheBoardAllConfiguration.completed, this._onLoadCacheBoardAllConfigurationCompleted);
    }

    getState()
    {
        return this.state;
    }

    getSelectedBoard()
    {
        return this.state.selectedBoard;
    }

    getBoardList()
    {
        return this.state.boardList;
    }

    setBoardList(boardList)
    {
        this.setState({boardList: boardList});
    }

    getSelectedBoardAllConfig()
    {
        return this.state.selectedBoardAllConfig;
    }

    _onLoadCacheBoardAllConfigurationCompleted = (response) =>
    {
        let selectedBoardAllConfig = response.body.data;
        selectedBoardAllConfig.agings = _.sortBy(selectedBoardAllConfig.agings, ['numberOfDays']).reverse();
        selectedBoardAllConfig.customFieldConfigs = _.sortBy(selectedBoardAllConfig.customFieldConfigs, ['order']);
        this.setState({selectedBoardAllConfig: selectedBoardAllConfig});
        UIActions.contextUpdated.asFunction();
    }

    _onRefreshCacheBoardAllConfiguration = () =>
    {
        if (this.state.selectedBoard)
        {
            KanbanActions.cache.cacheBoardAllConfiguration.asFunction(this.state.selectedBoard._id, '[searchAll]');
        }
    }

    _listenToBoardShowStoreChange = (store) =>
    {
        if (store.actionState === KanbanActions.board.get.completed)
        {
            let isSameBoard = (FunctionHelper.isDefined(this.state.selectedBoard) && this.state.selectedBoard._id === store.state.board._id);
            if (isSameBoard)
            {
                return;
            }
            let board = store.state.board;
            this.setState({selectedBoard: board});
            KanbanActions.cache.cacheBoardAllConfiguration.asFunction(board._id, '[searchAll]');
            this.trigger({forceApplicationUpdate: true});
        }
    }

    clearState = () =>
    {
        this.setState({selectedBoardAllConfig: null, selectedBoard: null});
    };

    contextUpdated()
	{
        this.trigger({forceApplicationUpdate: false});
	}
}

module.exports = new BoardContextStore();
