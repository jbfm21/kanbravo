'use strict';

import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';

import {BoardContextStore} from '../../../stores';
import {FunctionHelper, BoardLayoutHelper} from '../../../commons';
import {KanbanActions, UIActions} from '../../../actions';

import {SwimLaneType} from '../../../enums';
import {UserEntity} from '../../../entities';
import {default as SwimLane} from './SwimLane.jsx';
import {default as BoardShowStore} from './BoardShowStore.jsx';

import {default as LaneHelper} from './LaneHelper';

import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

const messages = defineMessages(
{
    showingLaneBy: {id: 'swimlaneBoard.showingLaneBy', description: '', defaultMessage: 'Exibindo raias por: '}
});

@airflux.FluxComponent
class SwimLaneBoard extends React.Component
{
    static displayName = 'SwimLaneBoard';

    static propTypes =
    {
        board: React.PropTypes.object,
        selectedVisualStyle: React.PropTypes.object,
        selectedAgingExhibitionMode: React.PropTypes.string,
        selectedSwimLaneStyle: React.PropTypes.object,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardShowStore, this._listenToBoardShowStore);
        this.listenTo(UIActions.contextUpdated, this.contextUpdated_completed);
    }

    _listenToBoardShowStore(store)
    {
        if (FunctionHelper.isUndefined(store))
        {
            return;
        }
        switch (store.actionState)
        {
            //TODO: Otimizar para atualizar somente as raias necessárias
            case UIActions.refreshAllLanes:
            case KanbanActions.card.delete.completed:
            case KanbanActions.card.cancel.completed:
            case KanbanActions.card.archive.completed:
            case KanbanActions.card.archiveList.completed:
            case KanbanActions.boardLayout.updateBoardLayoutCardAllocation.completed:
            case KanbanActions.card.update.completed:
            case KanbanActions.card.addInFirstLeafLane.completed:
            {
                this.forceUpdate();
                return;
            }
            default: break;
        }
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


    notClassifiedCardFilterFunction = (swimLane, cards) => //eslint-disable-line
    {
        const property = this.props.selectedSwimLaneStyle.property;
        const {selectedSwimLaneStyle} = this.props;
        const swimLanes = LaneHelper.getSwimLanes(selectedSwimLaneStyle);
        if (FunctionHelper.isUndefined(swimLanes) || swimLanes.length === 0)
        {
            return cards;
        }
        return _.filter(cards, (card) =>
        {
            if (!_.has(card, property)) {return true;}
            if (_.isArray(card[property]))
            {
                if (FunctionHelper.isArrayNullOrEmpty(card[property])) {return true;}
                return _.every(card[property], (item) => !_.find(swimLanes, {_id: item._id}));
            }
            return FunctionHelper.isUndefined(card[property]);
        });
    };

    cardFilterFunction = (swimLane, cards) =>
    {
        const property = this.props.selectedSwimLaneStyle.property;
        return _.filter(cards, (card) =>
        {
            if (!_.has(card, property)) {return false;}
            if (_.isArray(card[property])) {return FunctionHelper.isDefined(card[property]) && _.some(card[property], item => item._id === swimLane._id);}
            return FunctionHelper.isDefined(card[property]) && card[property]._id === swimLane._id;
        });
    };

    _getselectedSwimLaneStyleCardMetric(swimLanes, swimLanesWips)
    {
        let wipCards = 0;
        let totalCards = 0;
        swimLanes.forEach(function(swimLane)
        {
            const swimLaneCardMetrics = swimLanesWips[swimLane._id];
            const isSwimLaneEmpty = (FunctionHelper.isUndefined(swimLaneCardMetrics) || swimLaneCardMetrics.totalCards === 0);
            if (!isSwimLaneEmpty)
            {
                wipCards += swimLanesWips[swimLane._id].wipCards;
                totalCards += swimLaneCardMetrics.totalCards;
            }
        });
        return {wipCards, totalCards};
    }

    _getSwimLaneList(swimLanes, swimLanesWips)
    {
        const that = this;
        const {board, selectedVisualStyle, selectedAgingExhibitionMode, selectedSwimLaneStyle} = this.props;
        const emptySwimLanes = [];
        const emptyCardMetrics = {wipCards: 0, totalCards: 0};
        let swimLaneUIList = swimLanes.map(function(swimLane, swimLaneIndex)
        {
            const swimLaneCardMetrics = swimLanesWips[swimLane._id];
            const isSwimLaneEmpty = (FunctionHelper.isUndefined(swimLaneCardMetrics) || swimLaneCardMetrics.totalCards === 0);

            if (isSwimLaneEmpty)
            {
                emptySwimLanes.push(<SwimLane isEmpty key={`sw_${swimLane._id}_${swimLaneIndex}`} cardMetrics={emptyCardMetrics} cardFilterFunction={that.cardFilterFunction} board={board} selectedAgingExhibitionMode={selectedAgingExhibitionMode} selectedVisualStyle={selectedVisualStyle} selectedSwimLaneStyle={selectedSwimLaneStyle} swimLane={swimLane} swimLaneIndex={swimLaneIndex}/>);
                return null;
            }
            return (<SwimLane key={`sw_${swimLane._id}_${swimLaneIndex}`} cardMetrics={swimLaneCardMetrics} cardFilterFunction={that.cardFilterFunction} board={board} selectedAgingExhibitionMode={selectedAgingExhibitionMode} selectedVisualStyle={selectedVisualStyle} selectedSwimLaneStyle={selectedSwimLaneStyle} swimLane={swimLane} swimLaneIndex={swimLaneIndex}/>);
        });

        let notClassfiedSwimLane = {_id: SwimLaneType.notClassified.name, title: 'Não classificado'}; //atenção, o _id é utilizando em SwimLaneHeader.jsx
        let notClassifiedSwimLaneCardMetrics = swimLanesWips[SwimLaneType.notClassified.name]; //eslint-disable-line
        const isNotClassifiedSwimLaneEmpty = (FunctionHelper.isUndefined(notClassifiedSwimLaneCardMetrics) || notClassifiedSwimLaneCardMetrics.totalCards === 0);
        if (isNotClassifiedSwimLaneEmpty)
        {
            emptySwimLanes.push(<SwimLane isEmpty cardMetrics={emptyCardMetrics} key={`swimlane_others_${selectedSwimLaneStyle.property}`} cardFilterFunction={that.notClassifiedCardFilterFunction} board={board} selectedAgingExhibitionMode={selectedAgingExhibitionMode} selectedVisualStyle={selectedVisualStyle} selectedSwimLaneStyle={selectedSwimLaneStyle} swimLane={notClassfiedSwimLane} swimLaneIndex={100}/>);
        }
        else
        {
            swimLaneUIList.push(<SwimLane cardMetrics={notClassifiedSwimLaneCardMetrics} cardFilterFunction={this.notClassifiedCardFilterFunction} key={`swimlane_others_${selectedSwimLaneStyle.property}`} board={board} selectedAgingExhibitionMode={selectedAgingExhibitionMode} selectedVisualStyle={selectedVisualStyle} selectedSwimLaneStyle={selectedSwimLaneStyle} swimLane={notClassfiedSwimLane} />);
        }
        return swimLaneUIList.concat(emptySwimLanes);
    }


     _getTitle = (swimLane, swimLaneStyle) =>
    {
        if (swimLane._id === SwimLaneType.notClassified.name) //valor configurado em SwimLaneBoard.jsx
        {
            return swimLane.title;
        }
        switch (swimLaneStyle.type)
        {
            case SwimLaneType.members.name: return new UserEntity(swimLane.user).nickname;
            default: return swimLane.title;
        }
    }

    _renderBoard(swimLanes, swimLanesWips)
    {
        if (FunctionHelper.isUndefined(BoardContextStore.getState().selectedBoardAllConfig))
        {
            return (null);
        }
        const swimLaneListToRender = this._getSwimLaneList(swimLanes, swimLanesWips);
        return swimLaneListToRender;
    }

    render()
    {
        const wipLimit = this.props.selectedSwimLaneStyle.wipLimit;
        const {selectedSwimLaneStyle} = this.props;
        const swimLanes = LaneHelper.getSwimLanes(selectedSwimLaneStyle);
        const swimLanesWips = LaneHelper.getAllSwimLanesWip(BoardShowStore.getSelectedBoard().layout, selectedSwimLaneStyle);
        let swimLaneStyleCardMetric = this._getselectedSwimLaneStyleCardMetric(swimLanes, swimLanesWips);
        const isToShowWipLimitValue = FunctionHelper.isDefined(wipLimit) && wipLimit > 0;
        const wipOverflowColor = BoardLayoutHelper.getWipOverFlowColor(swimLaneStyleCardMetric.wipCards, wipLimit || 0);
        return (
            <div>
                <div style={{margin: '5px', color: 'white'}}>
                    <FormattedMessage {...messages.showingLaneBy}/>
                    <span style={{fontWeight: 'bold'}}>{this.props.selectedSwimLaneStyle.title}</span>
                    <div className={`ui circular tiny label numberOfCardInLane ${wipOverflowColor}`} style={{marginLeft: '10px'}}>
                        {swimLaneStyleCardMetric.wipCards}
                        {isToShowWipLimitValue && <span>{`/${this.props.selectedSwimLaneStyle.wipLimit}`}</span>}
                    </div>
                    <span style={{fontWeight: 'bold', marginLeft: '10px'}}> | Não iniciados: {swimLaneStyleCardMetric.totalCards - swimLaneStyleCardMetric.wipCards}</span>
                </div>
                {this._renderBoard(swimLanes, swimLanesWips)}
            </div>
        );
    }
}

module.exports = injectIntl(SwimLaneBoard);
