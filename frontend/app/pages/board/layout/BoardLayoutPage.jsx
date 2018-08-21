//TODO: Intercionalizar
'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {Icon} from 'react-semantify';
import {defineMessages, FormattedMessage} from 'react-intl';

import {KanbanActions, UIActions} from '../../../actions';
import {BoardLayoutStore} from '../../../stores';
import {LoadServerContent} from '../../../components';
import {FunctionHelper} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {default as Lane} from './Lane.jsx';

const messages = defineMessages(
{
    cantExecuteBecauseHaveCards: {id: 'boardLayout.cantExecuteBecauseHaveCards', description: 'Cant remove lane, because this lane have cards', defaultMessage: 'Não foi possível executar a ação desejada. Para executá-la, é necessário retirar todos os cartões da raia.'},
    addNewLaneLabel: {id: 'boardLayout.addNewLane.button', description: 'Add new lane button', defaultMessage: 'Adicionar nova raia'}
});

const StateRecord = Immutable.Record({board: null, boardLane: null, isLoading: false, cards: null, cardAllocation: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
export default class BoardLayoutPage extends React.Component
{
    static displayName = 'BoardLayoutPage';

    static propTypes =
    {
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardLayoutStore, this._listenToBoardLayoutStoreChange);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
	{
        if (!this.state.data.board)
		{
            this.setImmutableState({board: null, boardLane: null, cards: null, cardAllocation: null});
			KanbanActions.board.get.asFunction(this.props.params.boardId);
        }
    }

    componentDidMount()
    {
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.params.boardId !== nextProps.params.boardId)
        {
            KanbanActions.board.get.asFunction(nextProps.params.boardId);
        }
    }

    shouldComponentUpdate(nextProps, nextState) //<eslint-disable-line></eslint-disable-line>
    {
        if (this.state.isLoading === false && nextState.isLoading === true)
        {
            return false;
        }
        return true;
    }

	componentWillUnmount()
	{
		this.ignoreLastFetch = true;
        this.setImmutableState({board: null, boardLane: null, isLoading: false, cards: null, cardAllocation: null});
	}

    _listenToBoardLayoutStoreChange = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.board.get.progressed:
            case KanbanActions.boardLayout.updateBoardLayout.progressed:
            case KanbanActions.boardLayout.updateBoardLayout.progressed:
            case KanbanActions.boardLayout.laneAddTopLaneAtTheEnd.progressed:
            case KanbanActions.boardLayout.laneDelete.progressed:
            case KanbanActions.boardLayout.laneMoveLeft.progressed:
            case KanbanActions.boardLayout.laneMoveRight.progressed:
            case KanbanActions.boardLayout.laneAddChild.progressed:
            case KanbanActions.boardLayout.laneClone.progressed:
            case KanbanActions.boardLayout.laneSplitHorizontal.progressed:
            case KanbanActions.boardLayout.laneSplitVertical.progressed:
            case KanbanActions.boardLayout.laneIncreaseCardWide.progressed:
            case KanbanActions.boardLayout.laneSplitDecreaseCardWide.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.board.get.completed:
                this.setImmutableState({isLoading: false, board: store.state.board, boardLane: store.state.board.layout});
                break;
            case KanbanActions.board.get.failed:
                this.setImmutableState({isLoading: false, board: null, boardLane: null});
                break;
            case KanbanActions.boardLayout.updateBoardLayout.completed:
            case KanbanActions.boardLayout.updateBoardLayout.completed:
            case KanbanActions.boardLayout.laneAddTopLaneAtTheEnd.completed:
            case KanbanActions.boardLayout.laneDelete.completed:
            case KanbanActions.boardLayout.laneMoveLeft.completed:
            case KanbanActions.boardLayout.laneMoveRight.completed:
            case KanbanActions.boardLayout.laneAddChild.completed:
            case KanbanActions.boardLayout.laneClone.completed:
            case KanbanActions.boardLayout.laneSplitHorizontal.completed:
            case KanbanActions.boardLayout.laneSplitVertical.completed:
            case KanbanActions.boardLayout.laneIncreaseCardWide.completed:
            case KanbanActions.boardLayout.laneSplitDecreaseCardWide.completed:
                this.setImmutableState({isLoading: false, boardLane: store.state.boardLane});
                break;
            case KanbanActions.boardLayout.updateBoardLayout.failed:
            case KanbanActions.boardLayout.updateBoardLayout.failed:
            case KanbanActions.boardLayout.laneAddTopLaneAtTheEnd.failed:
            case KanbanActions.boardLayout.laneDelete.failed:
            case KanbanActions.boardLayout.laneMoveLeft.failed:
            case KanbanActions.boardLayout.laneMoveRight.failed:
            case KanbanActions.boardLayout.laneAddChild.failed:
            case KanbanActions.boardLayout.laneClone.failed:
            case KanbanActions.boardLayout.laneSplitHorizontal.failed:
            case KanbanActions.boardLayout.laneSplitVertical.failed:
            case KanbanActions.boardLayout.laneIncreaseCardWide.failed:
            case KanbanActions.boardLayout.laneSplitDecreaseCardWide.failed:
                KanbanActions.board.get.asFunction(this.props.params.boardId); //recarrega o quadro
                break;
            default:
                break;
        }

    };

    _canExecuteAction = (lane, blockIfHaveCards) =>
    {
        if (this.state.data.isLoading)
        {
            return false;
        }
        if (blockIfHaveCards)
        {
            let cards = lane.cards;  //eslint-disable-line
            if (FunctionHelper.isDefined(cards) && cards.length > 0)
            {
                UIActions.showClientErrorMessage.asFunction(messages.cantExecuteBecauseHaveCards);
                return false;
            }
        }
        this.setImmutableState({isLoading: true});
        return true;
    }

    _handleAddTopLane = () =>
    {
        if (!this._canExecuteAction(false))
        {
            return;
        }
        KanbanActions.boardLayout.laneAddTopLaneAtTheEnd.asFunction(this.state.data.boardLane);
    }

    _handleMoveLeft = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneMoveLeft.asFunction(this.state.data.boardLane, lane);

    }

    _handleMoveRight = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneMoveRight.asFunction(this.state.data.boardLane, lane);
    }

    _handleAddChildLane = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneAddChild.asFunction(this.state.data.boardLane, lane);
    }

    _handleCloneLane = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneClone.asFunction(this.state.data.boardLane, lane);
    }

    _handleRemoveLane = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneDelete.asFunction(this.state.data.boardLane, lane);
    }

    _handleSplitLaneHorizontal = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneSplitHorizontal.asFunction(this.state.data.boardLane, lane);
    }

    _handleSplitLaneVertical = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneSplitVertical.asFunction(this.state.data.boardLane, lane);
    }

    _handleIncreaseCardWide = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneIncreaseCardWide.asFunction(this.state.data.boardLane, lane);
    }

    _handleDecreaseCardWide = (lane) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        KanbanActions.boardLayout.laneSplitDecreaseCardWide.asFunction(this.state.data.boardLane, lane);
    }

    _handleChangeTitle = (lane, newTitle) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        if (lane.title !== newTitle)
        {
            lane.title = newTitle;
            KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
        }
    }

    _handleChangeActivity = (lane, newActivity) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        if (lane.activity !== newActivity)
        {
            lane.activity = newActivity;
            KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
        }
    }

    _handleChangeLaneType = (lane, newLaneType) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        if (lane.laneType !== newLaneType)
        {
            lane.laneType = newLaneType;
            KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
        }
    }

    _handleChangePolicy = (lane, newPolicy) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        if (lane.policy !== newPolicy)
        {
            lane.policy = newPolicy;
            KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
        }
    }

    _handleChangeWipLimit = (lane, newWipLimit) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        if (lane.wipLimit !== parseInt(newWipLimit, 0)) //eslint-disabe-line
        {
            lane.wipLimit = newWipLimit;
            KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
        }
    }

    _handleToggleDataMetric = (lane, dataMetricPropertyName) =>
    {
        if (!this._canExecuteAction(lane, false))
        {
            return;
        }
        lane.dateMetricConfig[dataMetricPropertyName] = !lane.dateMetricConfig[dataMetricPropertyName];
        KanbanActions.boardLayout.updateBoardLayout.asFunction(this.state.data.boardLane);
    }

	//TODO: Verificar se o quadro é nulo, em caso de erro. caso tenha retornado erro, mostrar mensagem amigavel //eslint-disable-line no-warning-comments
    render()
	{
        const that = this;
        const {isLoading, board, boardLane} = this.state.data;
        const validBoard = FunctionHelper.isDefined(board) && FunctionHelper.isDefined(boardLane);
        if (!validBoard)
        {
            return null;
        }
        return (
            <div className="kboard" key={'editboardLayout'}>
                <LoadServerContent isLoading={isLoading}/>
                {
                    boardLane.rootNode.children.map(function(lane, index)
                    {
                        return (
                            <Lane
                                isLoading={isLoading}
                                key={`${lane._id}`} lane={lane}
                                index={index} numberOfSlibingLanes={boardLane.rootNode.children.length}
                                onMoveLeft={that._handleMoveLeft} onMoveRight={that._handleMoveRight}
                                onIncreaseCardWide={that._handleIncreaseCardWide} onDecreaseCardWide={that._handleDecreaseCardWide}
                                onRemoveLane={that._handleRemoveLane} onAddChildLane={that._handleAddChildLane}
                                onCloneLane={that._handleCloneLane}
                                onSplitLaneHorizontal={that._handleSplitLaneHorizontal} onSplitLaneVertical={that._handleSplitLaneVertical}
                                onChangeTitle={that._handleChangeTitle} onChangeWipLimit={that._handleChangeWipLimit}
                                onChangeActivity={that._handleChangeActivity} onChangePolicy={that._handleChangePolicy}
                                onChangeLaneType={that._handleChangeLaneType}
                                onToggleDataMetric={that._handleToggleDataMetric}
                            />);
                    })
                }
                <div className="top horizontal lanes" style={{cursor: 'pointer', verticalAlign: 'middle', backgroundColor: '#888', border: '2px dashed black'}} onClick={that._handleAddTopLane}>
                    <div style={{minWidth: '70px', width: '70px'}}>
                        <div className="level1 horizontal expandable lane" style={{minWidth: '70px', width: '70px'}}>
                            <Icon className="huge plus"/>
                            <div className="rotate text" style={{fontSize: '30px', height: '40px', width: '350px'}}><FormattedMessage {...messages.addNewLaneLabel} /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
