'use strict';

import React from 'react';
import _ from 'lodash';
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import {Header, Segment, Grid, Column} from 'react-semantify';
import Immutable from 'immutable';
import * as airflux from 'airflux';

import {Container, Content, Meta, SearchBox, FaIcon, Avatar, StaticComboField} from '../../../../components';
import {KanbanActions, UIActions} from '../../../../actions';
import {FunctionHelper} from '../../../../commons';
import {BoardContextStore} from '../../../../stores';
import {default as ArchiveReportStore} from './ArchiveReportStore';
import {default as ArchiveListNavigator} from './ArchiveListNavigator.jsx';
import Loader from 'react-loader';

import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../../decorators';

const LIMIT = 20;

var StateRecord = Immutable.Record({isLoadingProjects: false, isLoading: false, cardList: null, cursorBeforeValue: null, cursorAfterValue: null, limit: LIMIT, totalInDb: 0, filterQueryValue: '', selectedProject: '', projects: []});

const messages = defineMessages(
{
    searchPlaceHolder: {id: 'archivereportpage.listItem.search', description: 'Search item', defaultMessage: 'Pesquisar...'},
    title: {id: 'archivereportpage.title', description: '', defaultMessage: 'Descrição'},
    subtitle: {id: 'archivereportpage.subtitle', description: '', defaultMessage: 'Lista de cartões arquivados'},
    emptyList: {id: 'archivereportpage.emptyList', description: '', defaultMessage: 'Nenhum cartão arquivo até o momento'},
    selectProjectComboboxAllProjectOption: {id: 'modal.cardForm.ManageConnectionTab.selectProjectComboboxAllProjectOption', description: '', defaultMessage: 'Todos projetos'}
});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class ArchiveReportPage extends React.Component
{
    static displayName = 'ArchiveReportEmpty';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };


    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord({})};
        this.listenTo(ArchiveReportStore, this._listenToBoardBacklogStoreChange);
        this.listenTo(BoardContextStore, this._listenToContextStoreChange);
    }

    _listenToContextStoreChange = () =>
    {
        //TODO: codigo repetido
        let allConfig = BoardContextStore.getSelectedBoardAllConfig();
        if (allConfig)
        {
            let projects = BoardContextStore.getSelectedBoardAllConfig().projects;
            this.setImmutableState({projects: projects, selectedProject: ''});
        }
        this.forceUpdate();
}


    componentWillMount()
    {
        //TODO: tirar magic numbers
        KanbanActions.card.listInArchive.asFunction(this.props.params.boardId, null, null, LIMIT, '', '');
    }

    componentDidMount()
    {
        let allConfig = BoardContextStore.getSelectedBoardAllConfig();
        if (allConfig)
        {
            let projects = BoardContextStore.getSelectedBoardAllConfig().projects;
            this.setImmutableState({projects: projects, selectedProject: ''});
        }
    }

    componentWillUnmount()
    {
        ArchiveReportStore.clearState();
        this.setImmutableState({projects: [], selectedProject: ''});
    }

    _listenToBoardBacklogStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.card.listInArchive.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case KanbanActions.card.listInArchive.completed:
                this.setImmutableState({isLoading: false, cardList: store.state.cardList, cursorAfterValue: store.state.after, cursorBeforeValue: store.state.before, totalInDb: store.state.totalInDb});
                break;

            case KanbanActions.card.listInArchive.failed:
                this.setImmutableState({isLoading: false, cardList: []});
                break;

            case KanbanActions.card.update.completed:
                this.setImmutableState({isLoading: false, cardList: store.state.cardList});
                this.forceUpdate();
                break;

            case KanbanActions.card.update.failed:
                this.setImmutableState({isLoading: false});
                break;

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


    _handleCardFormModalShow = (card, e) =>
    {
        if (e) {e.preventDefault();}
        let cloneCard = _.assign({}, card);
        UIActions.showCardFormModal.asFunction(card.board, cloneCard);
    };

    _handleDoSearch = (query) => //eslint-disable-line
    {
        this.setImmutableState({filterQueryValue: query});
        ArchiveReportStore.clearState();
        KanbanActions.card.listInArchive.asFunction(this.props.params.boardId, null, null, this.state.data.limit, query, this.state.data.selectedProject);
    }

    _handleChangeSelectProject = (newData) =>
    {
        let selectedProjectId = newData.value;
        this.setImmutableState({selectedProject: selectedProjectId});
        ArchiveReportStore.clearState();
        KanbanActions.card.listInArchive.asFunction(this.props.params.boardId, null, null, this.state.data.limit, this.state.data.filterQueryValue, selectedProjectId);
    }

    _handleOnPrevious = () =>
    {
        KanbanActions.card.listInArchive.asFunction(this.props.params.boardId, 'before', this.state.data.cursorBeforeValue, this.state.data.limit, this.state.data.filterQueryValue, this.state.data.selectedProject);
    }

    _handleOnNext = () =>
    {
        KanbanActions.card.listInArchive.asFunction(this.props.params.boardId, 'after', this.state.data.cursorAfterValue, this.state.data.limit, this.state.data.filterQueryValue, this.state.data.selectedProject);
    }

    //TODO: codigo duplicado em kcard
    _hasAvatar = (avatar) =>
    {
        return FunctionHelper.isDefined(avatar) && (FunctionHelper.isDefined(avatar.icon) || FunctionHelper.isDefined(avatar.letter) || FunctionHelper.isDefined(avatar.imageSrc));
    }


    _renderInformation(card)
    {
        const avatarFontSize = null;

        let metricTitle = FunctionHelper.isDefined(card.metric) ? card.metric.title : '';

        const parentBoardTitle = FunctionHelper.isDefined(card.parent) && FunctionHelper.isDefined(card.parent.board) ? card.parent.board.title : '';
        return (
            <div style={{display: 'flex', border: '0px', width: '99%', marginTop: '0px'}} >
                {FunctionHelper.isDefined(card.parent) &&
                    <div title={`Conectado ao cartão: ${card.parent.title} (Quadro: ${parentBoardTitle})`} className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'fa-plug'}} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.parent) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.metricValue) &&
                    <div title={`Métrica: ${card.metricValue}  ${metricTitle}`} className="not padding item iconInfo" style={{fontSize: '11px'}}>
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{letter: card.metricValue, borderRadius: 10, borderWidth: '1', borderColor: 'brown'}} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.metricValue) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.priority) && this._hasAvatar(card.priority.avatar) &&
                    <div title={`Prioridade: ${card.priority.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.priority.avatar} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.priority) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.priorityNumberValue) &&
                    <div title={`Prioridade numérica: ${card.priorityNumberValue}`} className="not padding item iconInfo" style={{fontSize: '11px'}}>
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{letter: card.priorityNumberValue, borderRadius: 10, borderWidth: '1', borderColor: 'black'}} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.priorityNumberValue) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.classOfService) && this._hasAvatar(card.classOfService.avatar) &&
                    <div title={`Classe de serviço: ${card.classOfService.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.classOfService.avatar} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.classOfService) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.itemType) && this._hasAvatar(card.itemType.avatar) &&
                    <div title={`Tipo de item: ${card.itemType.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.itemType.avatar} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.itemType) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.itemSize) && this._hasAvatar(card.itemSize.avatar) &&
                    <div title={`Tamanho: ${card.itemSize.title}`} className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.itemSize.avatar} style={{marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}
                {FunctionHelper.isUndefined(card.itemSize) &&
                    <div className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'aaa'}} style={{opacity: 0, marginLeft: '15px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

            </div>
        );
    }

    render()
    {
        let {cardList, isLoading, cursorBeforeValue, cursorAfterValue, limit, totalInDb, selectedProject} = this.state.data;
        let that = this;

        const {formatMessage} = this.props.intl;

        const isCardListEmpty = FunctionHelper.isArrayNullOrEmpty(cardList);

        return (
            <Container className={`setting segments ${this.pageName}`}>
                <Loader loaded={!isLoading} />
                <Segment>
                    <Header><FormattedMessage {...messages.title} /></Header>
                    <Meta>
                        <FormattedMessage {...messages.subtitle} />
                    </Meta>
                </Segment>
                <Segment className="blue">
                    <Header style={{display: 'inline-flex', width: '80%'}}>
                        <div style={{display: 'inline-flex', marginLeft: '15px'}} className="smallSelect">
                            <StaticComboField
                                initialValue={selectedProject}
                                propName="value"
                                showValueInLabelIfDistinct={false}
                                onChangeData={this._handleChangeSelectProject}
                                getSuggestions={this._getProjectSuggestions}
                            />
                        </div>
                        <SearchBox placeHolder={formatMessage(messages.searchPlaceHolder)} onSearch={this._handleDoSearch} style={{marginLeft: '10px', display: 'flex', width: '80%'}}/>
                    </Header>
                    {isCardListEmpty &&
                        <Content className="k-edit-setting k-text">
                            <div style={{marginTop: '10px', fontSize: '14px'}}><FormattedMessage {...messages.emptyList}/></div>
                        </Content>
                    }
                    {!isCardListEmpty &&
                        <Content className="k-edit-setting k-text">
                            <ArchiveListNavigator onPrevious={this._handleOnPrevious} onNext={this._handleOnNext} cursorBeforeValue={cursorBeforeValue} cursorAfterValue={cursorAfterValue} limit={limit} totalInDb={totalInDb}/>
                            <ul className="k-card-list-edit-title">
                                <li className={'listHeader'}>
                                    <Grid style={{width: '100%'}}>
                                        <Column style={{width: '1%', lineHeight: 2}}></Column>
                                        <Column className="five wide">Título</Column>
                                        <Column className="three wide">Projeto</Column>
                                        <Column className="two wide ">Arquivamento</Column>
                                        <Column className="one wide ">Conclusão</Column>
                                        <Column className="four wide" style={{textAlign: 'center'}}>Atributos</Column>
                                    </Grid>
                                </li>
                            </ul>
                            <ul className="k-card-list-edit-without-height">
                                {cardList.map(card =>
                                {
                                   const cardAvatar = FunctionHelper.isDefined(card.project) && FunctionHelper.isDefined(card.project.avatar) ? <Avatar hostStyle={{marginRight: '2px'}} isToShowBackGroundColor isSquareImageDimension avatar={card.project.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} /> : null;

                                    return (
                                        <li key={`arq_${card._id}`} style={{fontSize: '12px'}}>
                                            <Grid style={{width: '100%'}} >
                                                <Column style={{width: '1%', lineHeight: 2}}>
                                                    <div onClick={that._handleCardFormModalShow.bind(this, card)}><FaIcon className="fa-pencil"/></div>
                                                </Column>
                                                <Column className="five wide" >
                                                    <div>{card.title}</div>
                                                </Column>
                                                <Column className="three wide" >
                                                    {FunctionHelper.isDefined(card.project) && <div style={{display: 'inline-flex'}}>{cardAvatar} {card.project.title}</div>}
                                                </Column>
                                                <Column className="two wide" >
                                                    <div>{FunctionHelper.formatDate(card.archivedDate, 'DD/MM/YYYY', '--/--/----')}</div>
                                                </Column>
                                                <Column className="one wide" >
                                                    <div>{FunctionHelper.formatDate(card.endExecutionDate, 'DD/MM/YYYY', '--/--/----')}</div>
                                                </Column>
                                                <Column className="four wide">
                                                    {this._renderInformation(card)}
                                                </Column>
                                            </Grid>
                                        </li>
                                    );
                                })}
                            </ul>
                            <ArchiveListNavigator onPrevious={this._handleOnPrevious} onNext={this._handleOnNext} cursorBeforeValue={cursorBeforeValue} cursorAfterValue={cursorAfterValue} limit={limit} totalInDb={totalInDb}/>
                        </Content>
                    }
                </Segment>
            </Container>
        );
    }
}

module.exports = injectIntl(ArchiveReportPage);
