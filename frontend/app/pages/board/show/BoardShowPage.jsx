'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import classnames from 'classnames';
import {List, Item, Icon} from 'react-semantify';
import {defineMessages, FormattedMessage} from 'react-intl';
import moment from 'moment';

import {KanbanActions, UIActions} from '../../../actions';
import {BoardShowStore, BoardContextStore} from '../../../stores';
import {SwimLaneType} from '../../../enums';


import {LoadServerContent, Button} from '../../../components';
import {FunctionHelper, LocalStorageManager} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {default as Lane} from './Lane.jsx';
import {default as HighlightCardInput} from './components/HighlightCardInput.jsx';
import {default as ProjectLane} from './projectLane/ProjectLane.jsx';
import {default as CardContextMenu} from './CardContextMenu.jsx';
import {default as SwimLaneBoard} from './SwimLaneBoard.jsx';

import {default as MemberWipPanel} from './memberWipPanel/MemberWipPanel.jsx';

//var io = require('socket.io-client');

const messages = defineMessages(
{
    showProjectLaneButton: {id: 'boardShow.projectLane.showButtom', description: 'Show Project Lane button', defaultMessage: 'Raia de Projeto'},
    lastUpdate: {id: 'boardShow.lastUpdte', description: 'lastUpdte', defaultMessage: 'Última atualização:'},
    //refreshBoard: {id: 'boardShow.refreshBoard', description: 'refreshBoard', defaultMessage: 'Atualizar quadro'},
    refreshBoard: {id: 'boardShow.refreshBoard', description: 'refreshBoard', defaultMessage: ' '},
    lastUpdate_sufix: {id: 'boardShow.lastUpdate_sufix', description: 'lastUpdte', defaultMessage: '- Em breve, atualização automática...'}
});

var StateRecord = Immutable.Record({isLoading: false, board: null, selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null, showProjectLegend: true, showMemberWipPanel: true, isToShowProjectLane: false, projectCardStatistic: null, socket: null, lastRefreshBoardInformation: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
export default class BoardShowPage extends React.Component
{
    static displayName = 'BoardShowPage';

    static propTypes =
    {
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardShowStore, this._listenToBoardShowStoreChange);
        this.listenTo(UIActions.contextUpdated, this.contextUpdated_completed);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
	{
        if (!this.state.data.board)
		{
            const boardId = this.props.params.boardId;
            this.setImmutableState({isLoading: true, board: null});
			KanbanActions.board.get.asFunction(boardId);
        }
    }

    /*componentDidMount()
    {
        let boardId = this.props.params.boardId;
        let socket = io('http://localhost:3000', {transports: ['websocket'], 'force new connection': true});
        this.setImmutableState({socket: socket});
        socket.on('connect', function()
        {
            // Connected, let's sign-up for to receive messages for this room
            socket.emit('room', boardId);
        });
        socket.on('refresh:board', function()
        {
            KanbanActions.board.get.asFunction(boardId);
        });
    }*/

    componentWillReceiveProps(nextProps)
    {
        if (this.props.params.boardId !== nextProps.params.boardId)
        {
            //this.state.data.socket.emit('room', nextProps.params.boardId);
            this.highlightCardInput.getWrappedInstance().clear();
            this.setImmutableState({isLoading: true, selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null});
            KanbanActions.board.get.asFunction(nextProps.params.boardId);
        }
    }

	componentWillUnmount()
	{
		this.ignoreLastFetch = true;
        //this.state.data.socket.disconnect();
        this.setImmutableState({isLoading: false, board: null, selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null, socket: null});
	}

    contextUpdated_completed()
    {
        //Colocado isso, pois para montar as raias é necessario que o contexto selectedBoardAllConfig esteja preenchido,
        //como a carga inicial do quadro é assincrono com o carregamento do contexto, pode ser que durante a exibicao das raias
        //o contexto nao tenha sido montado, fazendo com que todos os itens sejam colocados na raia NaoClassificado
        //depois ver uma forma melhor de resolver esse problema
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isDefined(boardAllConfig))
        {
            this.forceUpdate();
        }
    }

    _listenToBoardShowStoreChange = (store) =>
    {
        let isLoading = FunctionHelper.isUndefined(BoardShowStore.getSelectedBoard());

        switch (store.actionState)
        {

            case UIActions.setBoardVisualStyle:
            {
                LocalStorageManager.setBoardProfileVisualStyle(store.state.board._id, store.state.selectedVisualStyle);
                this.setImmutableState({isLoading: isLoading, board: store.state.board, selectedVisualStyle: store.state.selectedVisualStyle});
                break;
            }
            case UIActions.setBoardAgingExhibitionMode:
            {
                LocalStorageManager.setBoardAgingExhibitionMode(store.state.board._id, store.state.selectedAgingExhibitionMode);
                this.setImmutableState({isLoading: isLoading, board: store.state.board, selectedAgingExhibitionMode: store.state.selectedAgingExhibitionMode});
                break;
            }
            case UIActions.setBoardSwimLaneStyle:
            {
                LocalStorageManager.setBoardProfileSwimLane(store.state.board._id, store.state.selectedSwimLaneStyle);
                this.setImmutableState({isLoading: isLoading, board: store.state.board, selectedSwimLaneStyle: store.state.selectedSwimLaneStyle});
                break;
            }
            case UIActions.setShowProjectLegend:
            {
                LocalStorageManager.setShowProjectLegend(store.state.board._id, store.state.showProjectLegend);
                this.setImmutableState({isLoading: isLoading, board: store.state.board, showProjectLegend: store.state.showProjectLegend});
                break;
            }
            case UIActions.setShowMemberWipPanel:
            {
                LocalStorageManager.setShowMemberWipPanel(store.state.board._id, store.state.showMemberWipPanel);
                this.setImmutableState({isLoading: isLoading, board: store.state.board, showMemberWipPanel: store.state.showMemberWipPanel});
                break;
            }

            case KanbanActions.board.get.progressed:
            case KanbanActions.card.delete.progressed:
            case KanbanActions.card.cancel.progressed:
            case KanbanActions.card.archiveList.progressed:
            case KanbanActions.card.archive.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case KanbanActions.board.get.completed:
            {
                let boardProfile = LocalStorageManager.getBoardProfile(store.state.board._id);

                //Ao tentar fazer o mesmo para visualStyle o tooltip de timesheet nao é atualizado. Verificar o motivo
                let selectedSwimLaneStyle = (FunctionHelper.isDefined(this.state.data.selectedSwimLaneStyle)) ? this.state.data.selectedSwimLaneStyle : store.state.selectedSwimLaneStyle;

                selectedSwimLaneStyle = boardProfile.selectedSwimLaneStyle || selectedSwimLaneStyle;
                let selectedVisualStyle = boardProfile.selectedVisualStyle || store.state.selectedVisualStyle;
                let selectedAgingExhibitionMode = boardProfile.selectedAgingExhibitionMode || store.state.selectedAgingExhibitionMode;
                let showProjectLegend = boardProfile.showProjectLegend || store.state.showProjectLegend;
                let showMemberWipPanel = boardProfile.showMemberWipPanel || store.state.showMemberWipPanel;

                this.setImmutableState({isLoading: isLoading, board: store.state.board, showProjectLegend: showProjectLegend, showMemberWipPanel: showMemberWipPanel, selectedAgingExhibitionMode: selectedAgingExhibitionMode, selectedVisualStyle: selectedVisualStyle, selectedSwimLaneStyle: selectedSwimLaneStyle, lastRefreshBoardInformation: moment()});
                break;
            }

            case KanbanActions.boardActions.getProjectCardStatistic.completed:
            {
                this.setImmutableState({isToShowProjectLane: true, projectCardStatistic: store.state.projectCardStatistic});
                break;
            }

            case KanbanActions.boardActions.getProjectCardStatistic.failed:
            {
                this.setImmutableState({isToShowProjectLane: false, projectCardStatistic: null});
                break;
            }

            case KanbanActions.card.delete.completed:
            case KanbanActions.card.cancel.completed:
            case KanbanActions.card.archive.completed:
            case KanbanActions.card.archiveList.completed:
                this.setImmutableState({isLoading: false});
                break;

            case KanbanActions.card.delete.failed:
            case KanbanActions.card.cancel.failed:
            case KanbanActions.card.archive.failed:
            case KanbanActions.card.archiveList.failed:
                this.setImmutableState({isLoading: false});
                break;

            default: break;
        }

    };

    _handleShowProjectLane = (e) =>
    {
        e.preventDefault();
        let {isToShowProjectLane, board} = this.state.data;
        isToShowProjectLane = !isToShowProjectLane;
        this.setImmutableState({isToShowProjectLane: isToShowProjectLane});
        if (isToShowProjectLane)
        {
            KanbanActions.boardActions.getProjectCardStatistic.asFunction(board._id);
            return;
        }
    }

    _handleRemoveCard = (card, isToRemoveConnectedCardToo, e) => //eslint-disable-line
    {
        KanbanActions.card.delete.asFunction(card, isToRemoveConnectedCardToo);
    }

    _handleCancelCard = (card, isToCancelConnectedCardToo, e) => //eslint-disable-line
    {
        KanbanActions.card.cancel.asFunction(card, isToCancelConnectedCardToo);
    }

    _handleArchiveCard = (card, e) => //eslint-disable-line
    {
        KanbanActions.card.archive.asFunction(card);
    }

    _handleArchiveLane = (board, lane, e) => //eslint-disable-line
    {
        let cardIds = lane.cards.map(item => { return {cardId: item._id};});
        KanbanActions.card.archiveList.asFunction(FunctionHelper.getId(board), cardIds);
    }

    _handleRefreshBoardInfo = () =>
    {
       KanbanActions.board.get.asFunction(this.props.params.boardId);
    }

    _renderSwimLanes = () =>
    {
        let {board, selectedAgingExhibitionMode, selectedVisualStyle, selectedSwimLaneStyle, isToShowProjectLane, projectCardStatistic} = this.state.data;

        if (FunctionHelper.isDefined(selectedSwimLaneStyle) && selectedSwimLaneStyle.type !== SwimLaneType.none.name)
        {
            return (<SwimLaneBoard board={board} selectedVisualStyle={selectedVisualStyle} selectedAgingExhibitionMode={selectedAgingExhibitionMode} selectedSwimLaneStyle={selectedSwimLaneStyle}/>);
        }

        let style = (selectedVisualStyle && selectedVisualStyle.orientation && selectedVisualStyle.orientation === 'vertical') ? {display: 'block'} : {};

        return (
            <div className="kboard" key={board.title}>
                <div className="lanes top horizontal first parent wipLimitNotOverflowInTopLane expandable" style={style}>
                    {
                        isToShowProjectLane && FunctionHelper.isDefined(projectCardStatistic) &&
                            <ProjectLane key={'projectLane'} projectCardStatistic={projectCardStatistic} />
                    }
                    {
                        board.layout.rootNode.children.map(function(lane, index)
                        {
                            return <Lane key={`${lane._id}`} lane={lane} swimLane={{_id: SwimLaneType.none.name, title: SwimLaneType.none.name}} numberOfSlibingLanes={board.layout.rootNode.children.length} index={index} visualStyle={selectedVisualStyle} agingExhibitionMode={selectedAgingExhibitionMode}/>;
                        })
                    }
                </div>
            </div>
        );
    }

	//TODO: Verificar se o quadro é nulo, em caso de erro. caso tenha retornado erro, mostrar mensagem amigavel //eslint-disable-line no-warning-comments
    render()
	{
        //Colocado isso, pois para montar os cartoes (envelhecimentos) é necessario que o contexto selectedBoardAllConfig esteja preenchido,
        //como a carga inicial do quadro é assincrono com o carregamento do contexto, pode ser que durante a exibicao das raias
        //o contexto nao tenha sido montado, fazendo com que todos os itens sejam colocados na raia NaoClassificado
        //depois ver uma forma melhor de resolver esse problema
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return (<span style={{color: 'white'}}>Carregando...</span>);
        }
        const {isLoading, board, isToShowProjectLane, showMemberWipPanel, showProjectLegend, lastRefreshBoardInformation} = this.state.data; //eslint-disable-line
        const validBoard = FunctionHelper.isDefined(board);
        const showProjectLaneButtonClassname = classnames({tiny: true, blue: true, basic: !isToShowProjectLane});
        if (!validBoard)
        {
            return null;
        }
        return (
            <div>
                <div className="aui amenu avertical afixed aboardShowPageMenu" >
                    <List className="fixed horizontal no-print" style={{padding: '0px', display: 'inline-flex', width: '100%', backgroundColor: '#ddd'}}>
                        <Item style={{marginLeft: '5px'}}><Button className="icon" onClick={this._handleRefreshBoardInfo} alt="Refresh no quadro"><Icon className='refresh'/><FormattedMessage {...messages.refreshBoard}/></Button></Item>
                        {false && <Item style={{marginLeft: '5px'}}><Button className={showProjectLaneButtonClassname} onClick={this._handleShowProjectLane}><FormattedMessage {...messages.showProjectLaneButton} /></Button></Item>}
                        <Item><HighlightCardInput ref={c => {this.highlightCardInput = c; return;}} boardId={board._id} /></Item>
                    </List>
                    {showMemberWipPanel && <MemberWipPanel />}
                </div>
                <LoadServerContent isLoading={isLoading}/>
                {FunctionHelper.isDefined(lastRefreshBoardInformation) && <div style={{marginLeft: '5px', color: 'white', fontSize: '10px'}}><FormattedMessage {...messages.lastUpdate}/> {lastRefreshBoardInformation.format('DD/MM/YYYY HH:mm')} <FormattedMessage {...messages.lastUpdate_sufix}/> </div> }
                {this._renderSwimLanes()}
                <CardContextMenu
                    onRemoveCard={this._handleRemoveCard}
                    onArchiveCard={this._handleArchiveCard}
                    onArchiveLane={this._handleArchiveLane}
                    onCancelCard={this._handleCancelCard}
                />
            </div>
        );
    }
}
