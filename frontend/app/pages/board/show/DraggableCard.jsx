'use strict';
import React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import Immutable from 'immutable';
import classNames from 'classNames';

import {default as constants} from '../../../commons/Constants';
import * as airflux from 'airflux';
import {UIActions} from '../../../actions';
import {FunctionHelper} from '../../../commons';
import {ImmutableState} from '../../../decorators';
import {default as KCard} from './KCardWithContextMenu.jsx';
import {default as BoardShowStore} from './BoardShowStore.jsx';
import {HighlightCardStore, HighlightCardStatus} from './components';

const sourceSpec =
{
    beginDrag(props)
    {
        return props.card;
    },
    canDrag(props, monitor) //eslint-disable-line
    {
        if (props.card.isExternal)
        {
            return false;
        }
        return !BoardShowStore.getState().isSavingMovementInDatabase;
    },
    isDragging(props, monitor)
    {
        return props.card._id === monitor.getItem()._id;
    },
    endDrag(props, monitor, component) //eslint-disable-line
    {
        if (!monitor.didDrop())
        {
            return;
        }
        UIActions.endDragCardUI.asFunction({cardId: props.card._id, fromLane: props.lane._id, toLane: monitor.getDropResult().targetLane._id});
    }
};

const dropSpec =
{
    drop(props, monitor, component) //eslint-disable-line
    {
        return {targetLane: props.lane};
    }
};

var dropCollect = (connect, monitor) => //eslint-disable-line
{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        dropMonitor: monitor
    };
};

var StateRecord = Immutable.Record({searchFieldForHighlight: '', isToHighlight: null});

@DropTarget(constants.itemTypes.CARD, dropSpec, dropCollect)
@DragSource(constants.itemTypes.CARD, sourceSpec, (connect, monitor) => ({connectDragSource: connect.dragSource(), isDragging: monitor.isDragging()}))
@ImmutableState
@airflux.FluxComponent
export default class DraggableCard extends React.Component
{

    static displayName = 'DraggableCard';

    static propTypes = {
        card: React.PropTypes.object.isRequired,
        lane: React.PropTypes.object.isRequired,
        connectDragSource: React.PropTypes.func,
        connectDropTarget: React.PropTypes.func,
        visualStyle: React.PropTypes.object,
        agingExhibitionMode: React.PropTypes.string,
        isDragging: React.PropTypes.bool,
        isOver: React.PropTypes.bool,
        dropMonitor: React.PropTypes.object
        //draggedItem: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.listenTo(HighlightCardStore, this._listenToHighlightCardStoreChange);
        this.state = {data: new StateRecord({searchFieldForHighlight: '', isToHighlight: HighlightCardStatus.NONE})};
    }

    componentWillMount()
    {
       const searchFieldForHighlight = this._getSearchFieldForHighlightInState(this.props.card);
       this._setHighlightStatus(searchFieldForHighlight);
    }

    componentWillReceiveProps(nextProps)
    {
        const searchFieldForHighlight = this._getSearchFieldForHighlightInState(nextProps.card);
        this._setHighlightStatus(searchFieldForHighlight);
        if (!this.props.isOver && nextProps.isOver)
        {
            const sourceCard = this.props.dropMonitor.getItem();
            const targetCard = this.props.card;
            if (sourceCard._id !== targetCard._id)
            {
                UIActions.moveCardUI.asFunction(sourceCard, targetCard);
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (this.props.isDragging !== nextProps.isDragging) || (nextProps.card.nonce !== this.props.card.nonce) || (nextProps.visualStyle !== this.props.visualStyle || (nextProps.agingExhibitionMode !== this.props.agingExhibitionMode));
    }

    _getSearchFieldForHighlightInState = (card) =>
    {
       if (FunctionHelper.isNotNullOrEmpty(HighlightCardStore.getState().filterQuery))
       {
            return JSON.stringify(card).toLowerCase();
            //TODO: a otimizacao abaixo foi comentado pois quando o usuário altera algum dado do cartao e depois filtra, o nonce é o mesmo
            //nao atualiazndo o estado
            /*if ((this.props.card.nonce !== card.nonce) || !FunctionHelper.isNotNullOrEmpty(this.state.data.searchFieldForHighlight))
            {
                console.log('aaaaaaaaaaaaaaaa');
                let searchFieldForHighlight = JSON.stringify(card).toLowerCase();
                this.setImmutableState({searchFieldForHighlight: searchFieldForHighlight});
                return searchFieldForHighlight;

            }
            return this.state.data.searchFieldForHighlight;*/
       }
       return '';
    }

    _setHighlightStatus = (searchFieldForHighlight) =>
    {
        const filterQuery = HighlightCardStore.getState().filterQuery;
        const isToHideFilterCards = HighlightCardStore.getState().isToHideFilterCards;
        const {currentHighlightCardStatus} = this.state.data;
        if (FunctionHelper.isUndefined(filterQuery) || filterQuery.trim().length === 0)
        {
            this.setImmutableState({isToHighlight: HighlightCardStatus.NONE});
            return currentHighlightCardStatus !== this.state.data.isToHighlight;
        }
        if (searchFieldForHighlight.search(filterQuery.toLowerCase()) > -1)
        {
            this.setImmutableState({isToHighlight: HighlightCardStatus.YES});
            return currentHighlightCardStatus !== this.state.data.isToHighlight;
        }
        if (isToHideFilterCards)
        {
            this.setImmutableState({isToHighlight: HighlightCardStatus.HIDE});
            return currentHighlightCardStatus !== this.state.data.isToHighlight;
        }
        this.setImmutableState({isToHighlight: HighlightCardStatus.NO});
        return currentHighlightCardStatus !== this.state.data.isToHighlight;
    }

    _listenToHighlightCardStoreChange() //eslint-disable-line
    {
        const searchFieldForHighlight = this._getSearchFieldForHighlightInState(this.props.card);
        if (this._setHighlightStatus(searchFieldForHighlight))
        {
            this.forceUpdate();
        }
    }

    render()
	{
        const {card, visualStyle, agingExhibitionMode, connectDragSource, connectDropTarget, lane, isDragging} = this.props; //eslint-disable-line
        const isToHighlight = this.state.data.isToHighlight;
        if (isToHighlight === HighlightCardStatus.HIDE)
        {
            return null;
        }

        const className = classNames({highlightCard: isToHighlight === HighlightCardStatus.YES});
        const opacity = (isDragging) ? 0.5 : (isToHighlight === HighlightCardStatus.NO) ? 0.1 : 1;  //eslint-disable-line
        return connectDragSource(connectDropTarget(
            <li style={{opacity: opacity}} className={className}>
                <KCard key={`${card._id}`} card={card} isReadOnly={card.isExternal} lane={lane} visualStyle={visualStyle} agingExhibitionMode={agingExhibitionMode}/>
            </li>
        ));
    }
}
