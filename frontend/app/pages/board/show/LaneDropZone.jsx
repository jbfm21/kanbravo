'use strict';

import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';
import {DropTarget} from 'react-dnd';

import {default as constants} from '../../../commons/Constants';
import {UIActions, KanbanActions} from '../../../actions';
import {FunctionHelper, BoardLayoutHelper} from '../../../commons';
import {ImmutableState} from '../../../decorators';
import {AgingType, SwimLaneType} from '../../../enums';

import {default as DraggableCard} from './DraggableCard.jsx';
import {default as BoardShowStore} from './BoardShowStore.jsx';

const dropSpec = {
    drop(props, monitor, component) //eslint-disable-line
    {
        return {targetLane: props.lane};
    }
};

var dropCollect = (connect, monitor) =>
{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        dropMonitor: monitor
    };
};

//@ImmutableShouldUpdateComponent //(TODO: Ver como fazer isso também com propriedades)
@DropTarget(constants.itemTypes.CARD, dropSpec, dropCollect)
@ImmutableState
@airflux.FluxComponent
export default class LaneDropZone extends React.Component
{
    static displayName = 'LaneDropZone';

    static propTypes =
    {
        lane: React.PropTypes.object,
        visualStyle: React.PropTypes.object,
        agingExhibitionMode: React.PropTypes.string,
        swimLane: React.PropTypes.object,
        connectDropTarget: React.PropTypes.func,
        isOver: React.PropTypes.bool,
        cardFilterFunction: React.PropTypes.func,
        dropMonitor: React.PropTypes.object
    };

    static defaultProps =
    {
        visualStyle: BoardLayoutHelper.defaultVisualStyle(),
        agingExhibitionMode: AgingType.none.name
    }


    constructor(props)
    {
        super(props);
        this.listenTo(BoardShowStore, this._listenToBoardShowStoreChange);
    }

    componentWillReceiveProps(nextProps)
    {
        if (!this.props.isOver && nextProps.isOver)
        {
            const dragginCard = this.props.dropMonitor.getItem();
            let dropLane = this.props.lane;
            UIActions.attachCardToLaneUI.asFunction(dropLane, dragginCard);
            return;
       }
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
         return nextProps.visualStyle !== this.props.visualStyle || nextProps.agingExhibitionMode !== this.props.agingExhibitionMode;
    }

    _listenToBoardShowStoreChange(store) //eslint-disable-line
    {
        switch (store.actionState)
        {
            case UIActions.refreshAllLanes:
            {
                this.forceUpdate();
                break;
            }
            case KanbanActions.card.addInFirstLeafLane.completed:
            {
                let {laneId} = store.state;
                if (laneId === this.props.lane._id)
                {
                    UIActions.refreshHeaderWip.asFunction(this.props.lane);
                    this.forceUpdate();
                }
                break;
            }
            case KanbanActions.card.update.completed:
            {
                //atualiza somente a raia do cartao
                if (this.props.lane._id === store.state.lane._id)
                {
                    this.forceUpdate();
                }
                break;
            }
            case UIActions.moveCardUI:
            {
                if (this.props.lane._id === store.state.fromLane._id || this.props.lane._id === store.state.toLane._id)
                {
                    this.forceUpdate();
                }
                break;
            }
            case KanbanActions.card.delete.completed:
            case KanbanActions.card.cancel.completed:
            case KanbanActions.card.archiveList.completed:
            {
                let laneCardIds = store.state.laneToUpdateList[this.props.lane._id];
                if (FunctionHelper.isDefined(laneCardIds))
                {
                    _.pullAllWith(this.props.lane.cards, laneCardIds, (a, b) => a._id === b);
                    /*for (let cardId of laneCardIds)
                    {
                        _.remove(this.props.lane.cards, (item) => item._id === cardId);
                    }*/
                    UIActions.refreshHeaderWip.asFunction();
                    this.forceUpdate();
                }
                break;
            }
            case KanbanActions.card.archive.completed:
            {
                if (this.props.lane._id === store.state.lane._id)
                {
                    _.remove(this.props.lane.cards, (item) => item._id === store.state.cardId);
                    UIActions.refreshHeaderWip.asFunction();
                    this.forceUpdate();
                }
                break;
            }
            default: break;
        }
    }

    render()
	{
        const {lane, connectDropTarget, maxWidth, visualStyle, agingExhibitionMode, cardFilterFunction, swimLane} = this.props;  //eslint-disable-line
        let cards = lane.cards;  //eslint-disable-line
        if (cardFilterFunction)
        {
            cards = cardFilterFunction(cards);
        }
        const dropZoneWidth = (lane.cardsWide * constants.CARD_WIDTH);
        //TODO: por enquanto só exibe quadro vertical quando não tiver swimlane
        let style = (visualStyle && visualStyle.orientation && visualStyle.orientation === 'vertical' && swimLane._id === SwimLaneType.none.name) ? {border: '0px solid black'} : {border: '0px solid black', width: dropZoneWidth + 'px', maxWidth: dropZoneWidth + 'px', height: 'inherit'};

        return connectDropTarget(
            <div className="cards dropzone" style={style}>
                <ul className={`ui ${FunctionHelper.toWords(lane.cardsWide)} specials cards laneContent`} style={{border: '0px solid yellow', height: 'inherit'}}>
                    {
                        FunctionHelper.isDefined(cards) &&
                            cards.map(function(card, cardIndex)
                            {
                                return (
                                    <DraggableCard key={`${swimLane._id}_${lane._id}_${cardIndex}_${card._id}`} card={card} lane={lane} agingExhibitionMode={agingExhibitionMode} visualStyle={visualStyle}/>
                                );
                            })
                    }
                </ul>
            </div>
        );
    }
}
