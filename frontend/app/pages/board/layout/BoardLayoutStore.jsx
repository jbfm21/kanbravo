'use strict';


import {KanbanActions} from '../../../actions';
import {ExtendedStore} from '../../../commons';

class BoardLayoutStore extends ExtendedStore
{

    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.board.get, this, {progressed: this.triggerEmpty, failed: this.goToErrorPage});

        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.updateBoardLayout, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});

        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.updateBoardLayout, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneAddTopLaneAtTheEnd, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneDelete, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneMoveLeft, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneMoveRight, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneAddChild, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneClone, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneSplitHorizontal, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneSplitVertical, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneIncreaseCardWide, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.laneSplitDecreaseCardWide, this, {progressed: this.triggerEmpty, completed: this.boardLayout_update_completed, failed: this.boardLayout_update_failed});
    }

    getState()
    {
        return this.state;
    }

    board_get_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {board: response.body.data}); //retorna o quadro inteiro
    }

    boardLayout_update_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {boardLane: response.body.data}); //Repassa somente as informações da raia alterada
    }

    boardLayout_update_failed(actionState, response)
    {
        //Recarrega o quadro, pois o erro pode ter sido de concorrência na atualização
        this.showErrorMessage(actionState, response);
    }
}

module.exports = new BoardLayoutStore();
