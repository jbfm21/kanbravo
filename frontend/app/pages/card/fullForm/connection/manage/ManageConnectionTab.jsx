import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import _ from 'lodash';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Content} from 'react-semantify';

import {KanbanActions} from '../../../../../actions';
import {ImmutableState} from '../../../../../decorators';
//import {Avatar} from '../../../../../components';
import {FunctionHelper} from '../../../../../commons';

import {EmptyConnection, ErrorWidged, StatisticManager} from '../components';

import {default as ManageConnectionStore} from './ManageConnectionStore';
import {default as CardRow} from './CardRow.jsx';
import {default as HeaderRow} from './HeaderRow.jsx';


const messages = defineMessages(
{
    selectBoardComboboxAllBoardOption: {id: 'modal.cardForm.ManageConnectionTab.selectBoardComboboxAllBoardOption', description: '', defaultMessage: 'Todos os quadros'},
    selectProjectComboboxAllProjectOption: {id: 'modal.cardForm.ManageConnectionTab.selectProjectComboboxAllProjectOption', description: '', defaultMessage: 'Todos projetos'},
    searchCardTitlePlaceHolder: {id: 'modal.cardForm.ManageConnectionTab.searchCardTitlePlaceHolder', description: '', defaultMessage: 'Pesquisar pelo título do cartão'},
    cardLabel: {id: 'modal.cardForm.ManageConnectionTab.cardLabel', description: '', defaultMessage: 'Cartão'},
    priorityabel: {id: 'modal.cardForm.ManageConnectionTab.priorityabel', description: '', defaultMessage: 'Prior.'},
    sizeLabel: {id: 'modal.cardForm.ManageConnectionTab.sizeLabel', description: '', defaultMessage: 'Tam.'},
    metricLabel: {id: 'modal.cardForm.ManageConnectionTab.metricLabel', description: '', defaultMessage: 'Métrica.'},
    metricValueLabel: {id: 'modal.cardForm.ManageConnectionTab.metricValueLabel', description: '', defaultMessage: 'Valor'},
    metricTypeLabel: {id: 'modal.cardForm.ManageConnectionTab.metricTypeLabel', description: '', defaultMessage: 'Unidade'},
    planningLabel: {id: 'modal.cardForm.ManageConnectionTab.planningLabel', description: '', defaultMessage: 'Planejado'},
    durationLabel: {id: 'modal.cardForm.ManageConnectionTab.duration', description: '', defaultMessage: 'Duração'},
    executionLabel: {id: 'modal.cardForm.ManageConnectionTab.executionLabel', description: '', defaultMessage: 'Realizado'},
    startDateLabel: {id: 'modal.cardForm.ManageConnectionTab.startDateLabel', description: '', defaultMessage: 'Início'},
    endDateLabel: {id: 'modal.cardForm.ManageConnectionTab.endDateLabel', description: '', defaultMessage: 'Término'},
    ratingTypeLabel: {id: 'modal.cardForm.ManageConnectionTab.ratingTypeLabel', description: '', defaultMessage: 'Classificação'},
    parameterLabel: {id: 'modal.cardForm.ManageConnectionTab.parameterLabel', description: '', defaultMessage: 'Parâmetros'},
    childrenMetricLabel: {id: 'modal.cardForm.ManageConnectionTab.childrenMetricLabel', description: '', defaultMessage: 'Métrica'},
    childrenMetricValueLabel: {id: 'modal.cardForm.ManageConnectionTab.childrenMetricValueLabel', description: '', defaultMessage: 'Tamanho'},
    grandChildrenCardsBasedCalculationLabel: {id: 'modal.cardForm.ManageConnectionTab.grandChildrenCardsBasedCalculationLabel', description: '', defaultMessage: 'Anal. 3° Nível'}
});

//TODO: iniciar com selectedBoardId = do cartao

var StateRecord = Immutable.Record({isLoadingCards: false, actionMessage: true});

@ImmutableState
@airflux.FluxComponent
class ManageConnectionTab extends Component
{
    static displayName = 'ManageConnectionTab';

    static propTypes =
    {
        intl: intlShape.isRequired,
        card: PropTypes.object.isRequired,
        cardForm: PropTypes.object.isRequired,
        onChangeCardData: PropTypes.func.isRequired,
        connections: PropTypes.any.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ManageConnectionStore, this._listenToManageConnectionStore);
       this.state = {data: new StateRecord()};
    }

    _listenToManageConnectionStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardConnection.updateCard.progressed:
                this.setImmutableState({isLoadingCards: true});
                break;

            case KanbanActions.cardConnection.updateCard.failed:
                this.setImmutableState({isLoadingCards: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardConnection.updateCard.completed:
            {
                let {card} = store.state;
                //TODO: simplificar essa logica centralizando na classe pai a adicao onAddConnection, onRemoconnection
                let isCardDisconnected = FunctionHelper.isUndefined(card.parent);
                if (isCardDisconnected)
                {
                    _.remove(this.props.connections, (o) => {return o._id === card._id;});
                }
                else
                {
                    FunctionHelper.mergeIfMatch(this.props.connections, card, '_id');
                }
                this.forceUpdate();
                break;
            }
            default: break;
        }
    }

    _renderRatingTypes = () =>
    {
        return null;
        /*const {ratingTypes} = this.state.data;
        if (FunctionHelper.isArrayNullOrEmpty(ratingTypes))
        {
            return null;
        }
        return ratingTypes.map((ratingType) =>
            <th key={`connectRatingType_${ratingType._id}`} className="center aligned" style={{padding: '0px'}} title={ratingType.title}>
                <Avatar isToShowBackGroundColor isSquareImageDimension avatar={ratingType.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
            </th>
        );*/
    }

    _handleUpdateMainCard = (card, dataToUpdate) =>
    {
        this.props.onChangeCardData(dataToUpdate);
    }

    _handleUpdateCard = (card, dataToUpdate) =>
    {
        let boardId = FunctionHelper.getId(card.board);
        dataToUpdate.board = boardId;
        dataToUpdate._id = card._id;
        dataToUpdate.nonce = card.nonce;
        KanbanActions.cardConnection.updateCard.asFunction(dataToUpdate);
    }

    _handleSetParentCard = (card, e) =>
    {
        e.preventDefault();
        let isToDisconnectCard = FunctionHelper.isDefined(card.parent);
        let parentId = (isToDisconnectCard) ? null : this.props.card._id;
        let boardId = FunctionHelper.getId(card.board);
        let cardToUpdate = {_id: card._id, board: boardId, nonce: card.nonce, parent: parentId};
        KanbanActions.cardConnection.updateCard.asFunction(cardToUpdate);
    }

    _getNumberOfRatingTypes = () =>
    {
        const {ratingTypes} = this.state.data;
        if (FunctionHelper.isArrayNullOrEmpty(ratingTypes))
        {
            return 0;
        }
        return ratingTypes.length;
    }

    _getConnectionStatistic = (connections) => //eslint-disable-line
    {
        return new StatisticManager(this.props.card, this.props.connections);
    }

    _renderChildrenRows = (statisticManager, connections) =>
    {
        let sortedCard = _.sortBy(connections, ['startPlanningDate', 'endPlanningDate']);
        let rowsToRender = [];

        let cardStatistic = statisticManager.getCurrentStatistic();

        rowsToRender.push(<HeaderRow key="manageConnection_HeaderRow" cardStatistic={cardStatistic}/>);

        let cardsToRender = (FunctionHelper.isArrayNotEmpty(sortedCard)) ? sortedCard.map(item => <CardRow onSetParent={this._handleSetParentCard} onUpdateCard={this._handleUpdateCard} key={`lst_${item._id}`} card={item}/>) : [];
        rowsToRender.push(...cardsToRender);
        return rowsToRender;
    }

    render()
    {
        let {card, connections} = this.props; //eslint-disable-line
        let statisticManager = this._getConnectionStatistic();

        if (FunctionHelper.isArrayNullOrEmpty(connections))
        {
            return (<EmptyConnection/>);
        }

        const numberOfRatingTypes = this._getNumberOfRatingTypes();

        return (
            <div style={{marginTop: '10px'}}>
                <Content className="k-new-setting" style={{marginBottom: '5px'}}>
                    <ErrorWidged statisticManager={statisticManager}/>
                    <table className="ui compact selectable stripped celled table listCardsToConnectTable" style={{fontFamily: 'monospace', fontSize: '11px'}}>
                        <thead>
                            <tr>
                                <th rowSpan="2" className="center aligned one wide" style={{maxWidth: '20px'}}></th>
                                <th rowSpan="2" className="center aligned six wide" style={{padding: '0px', minWidth: '50%'}}><FormattedMessage {...messages.cardLabel}/></th>
                                <th rowSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.priorityabel}/></th>
                                <th rowSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.sizeLabel}/></th>
                                <th colSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.metricLabel}/></th>
                                <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.planningLabel}/></th>
                                <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.executionLabel}/></th>
                                <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.parameterLabel}/></th>
                                {numberOfRatingTypes > 0 && <th colSpan={numberOfRatingTypes} className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.ratingTypeLabel}/></th>}
                            </tr>
                            <tr>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.metricValueLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.metricTypeLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.startDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.endDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.durationLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.startDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.endDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.durationLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.childrenMetricValueLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.childrenMetricLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.grandChildrenCardsBasedCalculationLabel}/></th>
                               {this._renderRatingTypes()}
                            </tr>
                        </thead>
                        <tbody>
                            <CardRow columnStyle={{borderBottom: '1px solid black'}} key={this.props.card._id} card={this.props.card} cardForm={this.props.cardForm} onUpdateCard={this._handleUpdateMainCard}/>
                            {this._renderChildrenRows(statisticManager, connections)}
                        </tbody>
                    </table>
                </Content>
            </div>
        );
    }
}

module.exports = injectIntl(ManageConnectionTab, {withRef: true});


