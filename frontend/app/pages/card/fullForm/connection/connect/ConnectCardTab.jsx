import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import _ from 'lodash';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Content} from 'react-semantify';

import {KanbanActions} from '../../../../../actions';
import {ImmutableState} from '../../../../../decorators';
import {StaticComboField, SearchBox, Avatar} from '../../../../../components';
import {FunctionHelper} from '../../../../../commons';
import {BoardContextStore} from '../../../../../stores';
import {default as ConnectCardStore} from './ConnectCardStore';
import {default as CardRow} from './CardRow.jsx';
import {ResumeTableWidged} from '../components';

const messages = defineMessages(
{
    selectBoardComboboxAllBoardOption: {id: 'modal.cardForm.connectCardTab.selectBoardComboboxAllBoardOption', description: '', defaultMessage: 'Todos os quadros'},
    selectProjectComboboxAllProjectOption: {id: 'modal.cardForm.connectCardTab.selectProjectComboboxAllProjectOption', description: '', defaultMessage: 'Todos projetos'},
    searchCardTitlePlaceHolder: {id: 'modal.cardForm.connectCardTab.searchCardTitlePlaceHolder', description: '', defaultMessage: 'Pesquisar pelo título do cartão'},
    cardLabel: {id: 'modal.cardForm.connectCardTab.cardLabel', description: '', defaultMessage: 'Cartão'},
    priorityabel: {id: 'modal.cardForm.connectCardTab.priorityabel', description: '', defaultMessage: 'Prior.'},
    sizeLabel: {id: 'modal.cardForm.connectCardTab.sizeLabel', description: '', defaultMessage: 'Tam.'},
    metricLabel: {id: 'modal.cardForm.connectCardTab.metricLabel', description: '', defaultMessage: 'Métrica.'},
    planningLabel: {id: 'modal.cardForm.connectCardTab.planningLabel', description: '', defaultMessage: 'Planej.'},
    startPlanningDateLabel: {id: 'modal.cardForm.connectCardTab.startPlanningDateLabel', description: '', defaultMessage: 'Início'},
    endPlanningDateLabel: {id: 'modal.cardForm.connectCardTab.endPlanningDateLabel', description: '', defaultMessage: 'Término'},
    ratingTypeLabel: {id: 'modal.cardForm.connectCardTab.ratingTypeLabel', description: '', defaultMessage: 'Classificação'},
    parameterLabel: {id: 'modal.cardForm.connectCardTab.parameterLabel', description: '', defaultMessage: 'Parâmetros'},
    childrenMetricLabel: {id: 'modal.cardForm.connectCardTab.childrenMetricLabel', description: '', defaultMessage: 'Métrica'},
    childrenMetricValueLabel: {id: 'modal.cardForm.connectCardTab.childrenMetricValueLabel', description: '', defaultMessage: 'Tamanho'},
    grandChildrenCardsBasedCalculationLabel: {id: 'modal.cardForm.connectCardTab.grandChildrenCardsBasedCalculationLabel', description: '', defaultMessage: 'Anal. 3° Nível'}
});

//TODO: iniciar com selectedBoardId = do cartao

var StateRecord = Immutable.Record({selectedBoardId: null, selectedProject: '', projects: [], cards: [], ratingTypes: [], isLoadingCards: false, isLoadingProjects: false, actionMessage: '', searchCardTitleText: ''});

@ImmutableState
@airflux.FluxComponent
class ConnectCardTab extends Component
{
    static displayName = 'ConnectCardTab';

    static propTypes =
    {
        intl: intlShape.isRequired,
        card: PropTypes.object.isRequired,
        connections: PropTypes.any.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ConnectCardStore, this._listenToConnectCardStore);
       this.state = {data: new StateRecord()};
    }

    componentDidMount()
    {
        let projects = BoardContextStore.getSelectedBoardAllConfig().projects;
        const selectedProject = this._getDefaultSelectedProject(projects);
        const selectedBoardId = this.props.card.board;
        this.setImmutableState({isLoadingProjects: false, projects: projects, selectedProject: selectedProject, selectedBoardId: selectedBoardId});
        this._refreshCardList(selectedBoardId, selectedProject, null);
    }

    _getDefaultSelectedProject = (projects) =>
    {
        const parentCard = this.props.card;
        const cardProjectTitle = FunctionHelper.isDefined(parentCard.project) ? parentCard.project.title : '';
        const projectWithSameTitle = _.find(projects, (p) => {return p.title === cardProjectTitle;});
        return FunctionHelper.isDefined(projectWithSameTitle) ? projectWithSameTitle._id : '';
    }

    _listenToConnectCardStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.boardSetting.project.list.progressed:
                this.setImmutableState({isLoadingProjects: true, actionMessage: '', searchCardTitleText: '', projects: []});
                break;

            case KanbanActions.boardSetting.project.list.failed:
                this.setImmutableState({isLoadingProjects: false, actionMessage: store.actionMessage, searchCardTitleText: '', projects: []});
                break;

            case KanbanActions.boardSetting.project.list.completed:
            {
                let {projects} = store.state;
                const selectedProject = this._getDefaultSelectedProject(projects);
                this.setImmutableState({isLoadingProjects: false, projects: store.state.projects, selectedProject: selectedProject});
                let {selectedBoardId, searchCardTitlePlaceHolder} = this.state.data;
                this._refreshCardList(selectedBoardId, selectedProject, searchCardTitlePlaceHolder);
                break;
            }
            case KanbanActions.card.searchCardToConnect.progressed:
                this.setImmutableState({isLoadingCards: true, actionMessage: '', cards: [], ratingTypes: []});
                break;

            case KanbanActions.card.searchCardToConnect.failed:
                this.setImmutableState({isLoadingCards: false, actionMessage: store.actionMessage, cards: [], ratingTypes: []});
                break;

            case KanbanActions.card.searchCardToConnect.completed:
                this.setImmutableState({isLoadingCards: false, cards: store.state.cards, ratingTypes: store.state.ratingTypes});
                break;


            case KanbanActions.cardConnection.updateCard.progressed:
                this.setImmutableState({isLoadingCards: true});
                break;

            case KanbanActions.cardConnection.updateCard.failed:
                this.setImmutableState({isLoadingCards: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardConnection.updateCard.completed:
            {
                //TODO: simplificar essa logica centralizando na classe pai a adicao onAddConnection, onRemoconnection
                let {card} = store.state;
                FunctionHelper.mergeIfMatch(this.state.data.cards, card, '_id');
                let isCardConnected = FunctionHelper.isDefined(card.parent);
                let match = _.find(this.props.connections, {_id: card._id});
                if (isCardConnected && !match)
                {
                    this.props.connections.push(card);
                }
                else if (!isCardConnected && match)
                {
                    this.props.connections.pop(match);
                }
                this.forceUpdate();
                break;
            }
            default: break;
        }
    }

    _getProjectSuggestions = () =>
    {
        const {formatMessage} = this.props.intl;
        let suggestions = this.state.data.projects.map(item => { return {value: item._id, label: item.title};});
        suggestions.unshift({label: formatMessage(messages.selectProjectComboboxAllProjectOption), value: ''});
        return suggestions;
    }

    _getBoardDropDownSuggestions = () =>
    {
        if (FunctionHelper.isArrayNullOrEmpty(BoardContextStore.getBoardList()))
        {
            return null;
        }
        return BoardContextStore.getBoardList().map(item => { return {value: item._id, label: item.title};});
    }

    _refreshCardList = (selectedBoardId, selectedProject, searchCardTitleText) =>
    {
        if (FunctionHelper.isNullOrEmpty(selectedBoardId))
        {
            selectedBoardId = this.props.card.board;
        }
        KanbanActions.card.searchCardToConnect.asFunction(selectedBoardId, selectedProject, searchCardTitleText);
    }

    _handleChangeSelectedBoard = (newData) =>
    {
        let boardId = newData.value;
        if (FunctionHelper.isUndefined(boardId))
        {
            return;
        }
        this.setImmutableState({selectedBoardId: boardId, selectedProject: '', searchCardTitleText: '', projects: [], cards: []});
        KanbanActions.boardSetting.project.list.asFunction(boardId);
    }

    _handleChangeSelectProject = (newData) =>
    {
        let projectId = newData.value;
        let {selectedBoardId} = this.state.data;
        if (FunctionHelper.isUndefined(projectId) || FunctionHelper.isUndefined(selectedBoardId))
        {
            return;
        }
        this.setImmutableState({selectedProject: projectId, searchCardTitleText: '', cards: []});
        this._refreshCardList(selectedBoardId, projectId, null);
    }

    _handleDoSearchCardTitle = (searchCardTitleText) =>
    {
        let {selectedBoardId, selectedProject} = this.state.data;
        if (FunctionHelper.isUndefined(selectedBoardId) || FunctionHelper.isUndefined(selectedBoardId))
        {
            return;
        }
        this.setImmutableState({searchCardTitleText: searchCardTitleText});
        this._refreshCardList(selectedBoardId, selectedProject, searchCardTitleText);
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

    _renderRatingTypes = () =>
    {
        const {ratingTypes} = this.state.data;
        if (FunctionHelper.isArrayNullOrEmpty(ratingTypes))
        {
            return null;
        }
        return ratingTypes.map((ratingType) =>
            <th key={`connectRatingType_${ratingType._id}`} className="center aligned" style={{padding: '0px'}} title={ratingType.title}>
                <Avatar isToShowBackGroundColor isSquareImageDimension avatar={ratingType.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
            </th>
        );
    }

    _handleSetParentCard = (card, e) =>
    {
        e.preventDefault();
        let isToDisconnectCard = FunctionHelper.isDefined(card.parent);
        let parentId = (isToDisconnectCard) ? null : this.props.card._id;
        let boardId = FunctionHelper.getId(card.board);
        let cardToUpdate = {_id: card._id, parent: parentId, board: boardId, nonce: card.nonce};
        KanbanActions.cardConnection.updateCard.asFunction(cardToUpdate);
    }

    render()
    {
        const {formatMessage} = this.props.intl;
        let {card, connections} = this.props;
        let {selectedBoardId, selectedProject, cards, searchCardTitleText, ratingTypes} = this.state.data; //eslint-disable-line
        if (FunctionHelper.isNullOrEmpty(selectedBoardId))
        {
            selectedBoardId = this.props.card.board;
        }

        let filteredCard = (FunctionHelper.isArrayNotEmpty(cards)) ? _.filter(cards, (item) => { return item._id !== this.props.card._id;}) : [];
        let sortedCard = _.sortBy(filteredCard, ['startPlanningDate', 'endPlanningDate']);
        let cardsToRender = (FunctionHelper.isArrayNotEmpty(sortedCard)) ? sortedCard.map(item => <CardRow onSetParent={this._handleSetParentCard} key={item._id} card={item} ratingTypes={ratingTypes}/>) : [];
        const numberOfRatingTypes = this._getNumberOfRatingTypes();
        return (
            <div className="connectExistingCard" style={{marginTop: '10px'}}>
                <Content className="k-new-setting" style={{marginBottom: '5px'}}>
                    <ResumeTableWidged card={card} connections={connections} />
                    <div style={{display: 'inline-flex'}} className="smallSelect">
                        <StaticComboField
                            initialValue={selectedBoardId}
                            propName="value"
                            showValueInLabelIfDistinct={false}
                            onChangeData={this._handleChangeSelectedBoard}
                            getSuggestions={this._getBoardDropDownSuggestions}
                        />
                    </div>
                    <div style={{display: 'inline-flex', marginLeft: '5px'}} className="smallSelect">
                        <StaticComboField
                            initialValue={selectedProject}
                            propName="value"
                            showValueInLabelIfDistinct={false}
                            onChangeData={this._handleChangeSelectProject}
                            getSuggestions={this._getProjectSuggestions}
                        />
                    </div>
                    <div style={{display: 'inline-flex', marginLeft: '5px'}}>
                        <SearchBox query={searchCardTitleText} className={'icon'} style={{width: '300px', display: 'flex', height: '25px'}} placeHolder={formatMessage(messages.searchCardTitlePlaceHolder)} onSearch={this._handleDoSearchCardTitle}/>
                    </div>
                    <table className="ui compact selectable stripped celled table listCardsToConnectTable" style={{fontFamily: 'monospace', fontSize: '12px'}}>
                        <thead>
                            <tr>
                                <th rowSpan="2" className="center aligned one wide" style={{maxWidth: '20px'}}></th>
                                <th rowSpan="2" className="center aligned six wide" style={{padding: '0px', minWidth: '50%'}}><FormattedMessage {...messages.cardLabel}/></th>
                                <th rowSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.priorityabel}/></th>
                                <th rowSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.sizeLabel}/></th>
                                <th rowSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.metricLabel}/></th>
                                <th colSpan="2" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.planningLabel}/></th>
                                <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.parameterLabel}/></th>
                                {numberOfRatingTypes > 0 && <th colSpan={numberOfRatingTypes} className="center aligned one wide" style={{padding: '0px'}}><FormattedMessage {...messages.ratingTypeLabel}/></th>}
                            </tr>
                            <tr>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.startPlanningDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.endPlanningDateLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.childrenMetricValueLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.childrenMetricLabel}/></th>
                                <th className="center aligned one wide" style={{padding: '0px', whiteSpace: 'nowrap'}}><FormattedMessage {...messages.grandChildrenCardsBasedCalculationLabel}/></th>
                               {this._renderRatingTypes()}
                            </tr>
                        </thead>
                        <tbody>
                            {cardsToRender}
                        </tbody>
                    </table>
                </Content>
            </div>
        );
    }
}

module.exports = injectIntl(ConnectCardTab, {withRef: true});
