'use strict';

import update from 'react-addons-update';
import _ from 'lodash';

import {KanbanActions, UIActions} from '../../../actions';
import {ExtendedStore, FunctionHelper} from '../../../commons';
import {AgingType, AddCardPosition} from '../../../enums';
import {default as LaneHelper} from './LaneHelper';


class BoardShowStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.state = {board: null,
            selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null,
            showProjectLegend: true, showMemberWipPanel: true,
            isUpdatingUI: false, isSavingMovementInDatabase: false};

        this.listenTo(UIActions.setBoardVisualStyle, this.setBoardVisualStyle_completed);
        this.listenTo(UIActions.setBoardAgingExhibitionMode, this.setBoardAgingExhibitionMode_completed);
        this.listenTo(UIActions.setShowProjectLegend, this.setShowProjectLegend_completed);
        this.listenTo(UIActions.setShowMemberWipPanel, this.setShowMemberWipPanel_completed);
        this.listenTo(UIActions.setBoardSwimLaneStyle, this.setBoardSwimLaneStyle_completed);
        this.listenTo(UIActions.moveCardUI, this.moveCardUI_completed);
        this.listenTo(UIActions.attachCardToLaneUI, this.attachCardToLaneUI_completed);
        this.listenTo(UIActions.endDragCardUI, this.endDragCardUI_completed);
        this.listenTo(UIActions.refreshAllLanes, this.refreshAllLanes_completed);

        this.listenToAsyncFnAutoBind(KanbanActions.board.get, this, {progressed: this.triggerEmpty});

        this.listenToAsyncFnAutoBind(KanbanActions.card.addInFirstLeafLane, this, {});
        this.listenToAsyncFnAutoBind(KanbanActions.card.update, this, {});
        this.listenToAsyncFnAutoBind(KanbanActions.card.delete, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.cancel, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.archive, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.card.archiveList, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});

        this.listenToAsyncFnAutoBind(KanbanActions.boardLayout.updateBoardLayoutCardAllocation, this, {});


        this.listenToAsyncFnAutoBind(KanbanActions.boardActions.getProjectCardStatistic, this, {progressed: this.triggerEmpty, failed: this.showErrorMessage});

        /************/
    }

	getState()
	{
		return this.state;
	}

    getSelectedBoard()
    {
        return this.state.board;
    }

    board_get_completed(actionState, response)
	{
        this.setState({board: response.body.data, selectedAgingExhibitionMode: AgingType.none.name, selectedVisualStyle: response.body.data.visualStyles[0], selectedSwimLaneStyle: response.body.data.swimLaneStyles[0], isUpdatingUI: false, isSavingMovementInDatabase: false});
        this.triggerWithActionState(actionState, this.state);
	}

	board_get_failed(actionState, response)
	{
        this.setState({board: null, selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null, isUpdatingUI: false, isSavingMovementInDatabase: false});
        this.showErrorMessage(actionState, response, this.state);
	}

    _removeCardFromUI(actionState, response)
    {
        const entityId = response.body.data.entityId;
        const laneCard = LaneHelper.getLaneCard(this.state.board.layout, entityId);
        const data = (FunctionHelper.isDefined(laneCard)) ? {lane: laneCard, cardId: entityId} : {};
        this.triggerWithActionState(actionState, data);
    }

    _removeCardListFromUI(actionState, response)
    {
        const changedCardStatusCardIds = response.body.data.changedCardStatusCardIds;
        const changedCardStatusErrors = response.body.data.changedCardStatusErrors;

        const getErrorMessage = (error) =>
        {
            if (error.restCode === 'FormError')
            {
                let messages = error.message;
                return _(messages).uniqBy('msg').map(message => message.msg).join(',');
            }
            return error.message.text;
        };

        if (FunctionHelper.isArrayNotEmpty(changedCardStatusErrors))
        {
            //TODO: intercionalizar
            let messageToShow = 'Alguns cartões não foram cancelados/removidos: ';
            for (let oError of changedCardStatusErrors)
            {
                messageToShow += `${oError.title} - ${getErrorMessage(oError.error)} || `;
            }
            UIActions.showClientErrorMessage.asFunction(messageToShow);
        }

        if (FunctionHelper.isArrayNullOrEmpty(changedCardStatusCardIds))
        {
            this.triggerWithActionState(actionState, {laneToUpdateList: []});
            return;
        }

        let laneToUpdate = [];
        for (let c of changedCardStatusCardIds)
        {
            const laneCard = LaneHelper.getLaneCard(this.state.board.layout, c);
            if (FunctionHelper.isDefined(laneCard))
            {
                if (!FunctionHelper.isDefined(laneToUpdate[laneCard._id]))
                {
                    laneToUpdate[laneCard._id] = [];
                }
                laneToUpdate[laneCard._id].push(c);
            }
        }
        this.triggerWithActionState(actionState, {laneToUpdateList: laneToUpdate});
    }


    /*_removeArchivedCardListFromUI(actionState, response)
    {
        const archivedCardIds = response.body.data.archivedCardIds;
        const archivedCardErrors = response.body.data.archivedCardErrors;

        const getErrorMessage = (error) =>
        {
            if (error.restCode === 'FormError')
            {
                let messages = error.message;
                return _(messages).uniqBy('msg').map(message => message.msg).join(',');
            }
            return error.message.text;
        };

        if (FunctionHelper.isArrayNotEmpty(archivedCardErrors))
        {
            //TODO: intercionalizar
            let messageToShow = 'Alguns cartões não foram arquivados: ';
            for (let notArchivedCardError of archivedCardErrors)
            {
                messageToShow += `${notArchivedCardError.title} - ${getErrorMessage(notArchivedCardError.error)} || `;
            }

            UIActions.showClientErrorMessage.asFunction(messageToShow);
        }

        if (FunctionHelper.isArrayNullOrEmpty(archivedCardIds))
        {
            this.triggerWithActionState(actionState, {lane: null, cardIdList: null});
            return;
        }

        const laneCard = LaneHelper.getLaneCard(this.state.board.layout, archivedCardIds[0]);
        const data = (FunctionHelper.isDefined(laneCard)) ? {lane: laneCard, cardIdList: archivedCardIds} : {};
        this.triggerWithActionState(actionState, data);
    }*/

    card_cancel_completed(actionState, response) //eslint-disable-line
	{
        this._removeCardListFromUI(actionState, response);
	}

    card_delete_completed(actionState, response) //eslint-disable-line
	{
        this._removeCardListFromUI(actionState, response);
	}

    card_archive_completed(actionState, response) //eslint-disable-line
	{
        this._removeCardFromUI(actionState, response);
	}

    card_archiveList_completed(actionState, response) //eslint-disable-line
	{
        this._removeCardListFromUI(actionState, response);
	}

	boardActions_getProjectCardStatistic_completed(actionState, response)
	{
        this.triggerWithActionState(actionState, {projectCardStatistic: response.body.data});
	}

    setBoardVisualStyle_completed(visualStyle)
    {
        this.setState({selectedVisualStyle: visualStyle});
        this.triggerWithActionState(UIActions.setBoardVisualStyle, {board: this.state.board, showProjectLegend: this.state.showProjectLegend, showMemberWipPanel: this.state.showMemberWipPanel, selectedAgingExhibitionMode: this.state.selectedAgingExhibitionMode, selectedVisualStyle: visualStyle, selectedSwimLaneStyle: this.state.selectedSwimLaneStyle});
    }

    setBoardSwimLaneStyle_completed(swimLaneStyle)
    {
        this.setState({selectedSwimLaneStyle: swimLaneStyle});
        this.triggerWithActionState(UIActions.setBoardSwimLaneStyle, {board: this.state.board, showProjectLegend: this.state.showProjectLegend, showMemberWipPanel: this.state.showMemberWipPanel, selectedAgingExhibitionMode: this.state.selectedAgingExhibitionMode, selectedVisualStyle: this.state.selectedVisualStyle, selectedSwimLaneStyle: swimLaneStyle});
    }


    setBoardAgingExhibitionMode_completed(agingExhibitionMode)
    {
        this.setState({selectedAgingExhibitionMode: agingExhibitionMode});
        this.triggerWithActionState(UIActions.setBoardAgingExhibitionMode, {board: this.state.board, showProjectLegend: this.state.showProjectLegend, showMemberWipPanel: this.state.showMemberWipPanel, selectedAgingExhibitionMode: agingExhibitionMode, selectedVisualStyle: this.state.selectedVisualStyle, selectedSwimLaneStyle: this.state.selectedSwimLaneStyle});
    }


    setShowMemberWipPanel_completed(showMemberWipPanel)
    {
        this.setState({showMemberWipPanel: showMemberWipPanel});
        this.triggerWithActionState(UIActions.setShowMemberWipPanel, {board: this.state.board, showProjectLegend: this.state.showProjectLegend, showMemberWipPanel: showMemberWipPanel, selectedAgingExhibitionMode: this.state.agingExhibitionMode, selectedVisualStyle: this.state.selectedVisualStyle, selectedSwimLaneStyle: this.state.selectedSwimLaneStyle});
    }


    setShowProjectLegend_completed(showProjectLegend)
    {
        this.setState({showProjectLegend: showProjectLegend});
        this.triggerWithActionState(UIActions.setShowProjectLegend, {board: this.state.board, showProjectLegend: showProjectLegend, showMemberWipPanel: this.state.showMemberWipPanel, selectedAgingExhibitionMode: this.state.agingExhibitionMode, selectedVisualStyle: this.state.selectedVisualStyle, selectedSwimLaneStyle: this.state.selectedSwimLaneStyle});
    }


    _printTree(node) //eslint-disable-line
    {
        let a = ' '; //eslint-disable-line
        for (let i = 0; i < node.depth; i++)
        {
            a += '     ';
        }
        for (var f in  node.children) //eslint-disable-line
        {
            this.printTree(node.children[f]);
        }
    }
    /**********************lane store */
    _setIsUpdatingUI (isUpdating) //eslint-disable-line
    {
        this.setState({isUpdatingUI: isUpdating});
    }

    _onBoardShowStoreChange(store) //eslint-disable-line
    {
        if (store.actionState === KanbanActions.board.get.completed)
        {
            this.setState({isUpdatingUI: false, isSavingMovementInDatabase: false});
            UIActions.refreshAllLanes.asFunction();
        }
    }

    refreshAllLanes_completed() //eslint-disable-line
    {
        this.setState({isUpdatingUI: false, isSavingMovementInDatabase: false});
        this.triggerWithActionState(UIActions.refreshAllLanes, {boardLane: this.getSelectedBoard().layout});
    }

    moveCardUI_completed(sourceCard, targetCard) //eslint-disable-line
    {
        if (this.state.isSavingMovementInDatabase)
        {
            return;
        }
        this._setIsUpdatingUI(true);
        const boardLane = this.getSelectedBoard().layout;
        const sourceLane = LaneHelper.getLaneCard(boardLane, sourceCard._id);
        const targetLane = LaneHelper.getLaneCard(boardLane, targetCard._id);

        const sourceCardIndex = _.findIndex(sourceLane.cards, {_id: sourceCard._id});
        const targetCardIndex = _.findIndex(targetLane.cards, {_id: targetCard._id});

        let isMovingToSamePosition = (sourceLane === targetLane) && (sourceCardIndex === targetCardIndex);
        if (isMovingToSamePosition)
        {
            this._setIsUpdatingUI(false);
            return;
        }

        let isMovingToSameLane = sourceLane === targetLane;
        if (isMovingToSameLane)
        {
            sourceLane.cards = update(sourceLane.cards, {$splice: [[sourceCardIndex, 1], [targetCardIndex, 0, sourceCard]]});
        }
        else
        {
            sourceLane.cards.splice(sourceCardIndex, 1);
            targetLane.cards.splice(targetCardIndex, 0, sourceCard);
        }
        this._setIsUpdatingUI(false);
        this.triggerWithActionState(UIActions.moveCardUI, {fromLane: sourceLane, toLane: targetLane});
    }

    attachCardToLaneUI_completed(targetLane, card) //eslint-disable-line
    {
        const boardLane = this.getSelectedBoard().layout;
        this._setIsUpdatingUI(true);
        const sourceLane = LaneHelper.getLaneCard(boardLane, card._id);

        let isMovingToSamePosition = sourceLane._id === targetLane._id;
        if (isMovingToSamePosition)
        {
            this._setIsUpdatingUI(false);
            return;
        }

        const sourceCardIndex = _.findIndex(sourceLane.cards, {_id: card._id});

        sourceLane.cards.splice(sourceCardIndex, 1);
        targetLane.cards.push(card);

        this._setIsUpdatingUI(false);
        this.triggerWithActionState(UIActions.moveCardUI, {fromLane: sourceLane, toLane: targetLane});

    }

    _waitFinishingUIOperationBeforeSaveInDataBase(movementAction)
    {
        if (this.state.isUpdatingUI)
        {
            //Aguarda a atualização da interface antes de salvar as alterações no banco de dados para evitar problema de concorrencia e dirty read
            window.setTimeout(this._waitFinishingUIOperationBeforeSaveInDataBase.bind(this), 100); //eslint-disable-line
            return;

        }
        this.triggerWithActionState(UIActions.endDragCardUI);
        const boardLane = this.getSelectedBoard().layout;
        KanbanActions.boardLayout.updateBoardLayoutCardAllocation.asFunction(boardLane, movementAction);
    }

    endDragCardUI_completed(movementAction)
    {
        this.setState({isSavingMovementInDatabase: true});
        UIActions.refreshHeaderWip.asFunction(movementAction);
        this._waitFinishingUIOperationBeforeSaveInDataBase(movementAction);
    }

    boardLayout_updateBoardLayoutCardAllocation_completed(actionState, response) //eslint-disable-line
    {
        //TODO: ver qual a melhgor forma de substituir o cartao salvo, atualmente estou substituindo somente
        //as informacoes de metricas que sao alteradas quando muda a alocacao do cartao,
        //mas o ideal e mudar todo o cartao, o problema que é preciso popular as entidades referneciadas (ClassOfService, itemType por exemplo antes de substitui o cartao)
        let newNonce = response.body.data.newNonce;
        let savedCardId = response.body.data.savedCardId;
        let savedDateMetrics = response.body.data.savedDateMetrics;


        const boardLane = this.getSelectedBoard().layout;
        const targetLane = LaneHelper.getLaneCard(boardLane, savedCardId);
        const targetCardIndex = _.findIndex(targetLane.cards, {_id: savedCardId});
        targetLane.cards[targetCardIndex].dateMetrics = savedDateMetrics;

        this.getSelectedBoard().layout.nonce = newNonce;
        this.setState({isSavingMovementInDatabase: false});

        this.triggerWithActionState(actionState);

        UIActions.refreshMemberWipPanel.asFunction();

    }

    boardLayout_updateBoardLayoutCardAllocation_failed(actionState, response) //eslint-disable-line
    {
        this.showErrorMessage(actionState, response);
        this.setState({isSavingMovementInDatabase: false});
        KanbanActions.board.get.asFunction(this.getSelectedBoard()._id);
    }

 	card_addInFirstLeafLane_completed(actionState, response) //eslint-disable-line
	{
        const {laneId, savedCard, position} = response.body.data;
        const boardLane = this.getSelectedBoard().layout;
        const targetLane = LaneHelper.getLaneById(boardLane, laneId);
        //TODO: Ver como melhorar esse trecho, quando esta configurado com swimlane, é adicionaid mais de uma vez, uma para cada raia
        if (!_.some(targetLane.cards, card => card._id === savedCard._id))
        {
            switch (position)
            {
                case AddCardPosition.firstLaneInit.name:
                    targetLane.cards.unshift(savedCard);
                    break;
                case AddCardPosition.firstLaneEnd.name:
                    targetLane.cards.push(savedCard);
                    break;
                default:
                    targetLane.cards.push(savedCard);
                    break;
            }
        }
        this.setState({isUpdatingUI: false, isSavingMovementInDatabase: false});
        this.triggerWithActionState(actionState, {laneId: laneId, savedCard: savedCard});
        UIActions.refreshHeaderWip.asFunction();
	}

    card_update_completed(actionState, response)
    {
        const boardLane = this.getSelectedBoard().layout;
        //TODO: enviar mensagem de sucesso ou fazer um spinner no cartão informando que ele está sendo salvo Otimizar;
        const savedCard = response.body.data;
        let lane = LaneHelper.getLaneCard(boardLane, savedCard._id);
        if (lane === null)
        {
            //Caso esteja atualizando cartões arquivados, estes não estão em nenhuma raia
            //TODO: criar uma ação especifica para atualizar cartao de arquivamneto que só é tratado pelo Store de arquivamento e não por card_update
            return;
        }
        const savedCardIndex = _.findIndex(lane.cards, {_id: savedCard._id});
        lane.cards[savedCardIndex] = savedCard;
        this.triggerWithActionState(actionState, {lane: lane, savedCard});
        UIActions.refreshMemberWipPanel.asFunction();
    }

    card_update_failed(actionState, response) //eslint-disable-line
    {
        //TODO:
        //this.showErrorMessage(actionState, response)
    }

}

module.exports = new BoardShowStore();
