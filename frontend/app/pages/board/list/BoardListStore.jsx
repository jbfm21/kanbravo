'use strict';

import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';
import {BoardAddStore} from '../../../stores';


class BoardListStore extends ExtendedStore
{
    state: { boardList: [], isLoading: false};

    constructor()
    {
        super();
        this.listenToAsyncFnAutoBind(KanbanActions.board.list, this);
        this.listenTo(BoardAddStore, this.board_add_change);
        //isLoading comeca como verdadeiro, pois assim que o usuário se loga a api já chama a ação de carregar a lista de quadros
        //evitando que esta ação seja chamada duas vezes consecutivas, uma em KanbanApp e outra em BoardListPage
        this.state = {boardList: [], isLoading: true};

    }

    getState()
    {
        return this.state;
    }

    board_add_change(store)
    {
        if (store.actionState === KanbanActions.board.add.completed)
        {
            const board = store.state.board;
            let boardList = this.state.boardList;
            boardList.push(board);
            this.setState({boardList});
        }
    }

    board_list_progressed(actionState, response) //eslint-disable-line
    {
        this.setState({isLoading: true});
        this.triggerEmpty();
    }

	board_list_completed(actionState, response)
	{
        let boardList = response.body.data;
        this.setState({boardList: boardList, isLoading: false});
        this.triggerWithActionState(actionState, this.state);
	}

    board_list_failed(actionState, response)
	{
        this.setState({boardList: [], isLoading: false});
        this.goToErrorPage(actionState, response, this.state);
	}
}

module.exports = new BoardListStore();
