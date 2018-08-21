'use strict';

import React from 'react';
import _ from 'lodash';
import * as airflux from 'airflux';
import {withRouter} from 'react-router';
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import {Icon, Menu, Dropdown, Divider, Item, Popup} from 'react-semantify';
import Immutable from 'immutable';

import {default as constants} from '../../commons/Constants';
import {FaIcon, NavLink, MenuItems, Avatar} from '../../components';
import {SwimLaneType, AgingType} from '../../enums';
import {FunctionHelper, LocalStorageManager} from '../../commons';
import {UIActions, KanbanActions} from '../../actions';
import {BoardShowStore, BoardContextStore} from '../../stores';
import {ImmutableState} from '../../decorators';

import {default as AddSimpleCardFormUI} from '../card/addSimpleForm/AddSimpleCardForm.jsx';
import {default as AddFeedBackFormUI} from '../feedback/FeedBackForm.jsx';


const messages = defineMessages(
{
    appName: {id: 'navbar.appName', description: 'Application name', defaultMessage: 'KanBravo'},
    register: {id: 'navbar.register', description: 'Register Link', defaultMessage: 'Registrar'},
    login: {id: 'navbar.login', description: 'Login Link', defaultMessage: 'Login'},
    logout: {id: 'navbar.logout', description: 'Logout Link', defaultMessage: 'Logout'},
    boardsTitle: {id: 'navbar.boardsTitle', description: 'Boards Title', defaultMessage: 'Quadros'},
    createBoard: {id: 'navbar.createBoard', description: 'Create Board Button', defaultMessage: 'Criar quadro'},
    userTimesheet: {id: 'navbar.userTimesheet', description: 'User Timesheet Button', defaultMessage: 'Timesheet'},
    userProfile: {id: 'navbar.userProfile', description: 'User Profile Button', defaultMessage: 'Perfil'},

    changeBoardLayout: {id: 'navbar.changeBoardLayout', description: 'Change Board Layout Button', defaultMessage: 'Layout'},
    calendar: {id: 'navbar.calendar', description: 'View Board Calendar', defaultMessage: 'Calendário'},
    backlog: {id: 'navbar.backlog', description: 'View Board BackLog', defaultMessage: 'Backlog'},
    settings: {id: 'navbar.settings', description: 'Change Board Settings', defaultMessage: 'Configurações'},
    reports: {id: 'navbar.reports', description: 'View Board Reports', defaultMessage: 'Relatórios'},
    addCard: {id: 'navbar.addCard', description: 'Add card', defaultMessage: 'Novo cartão'},
    exhibitionMode: {id: 'navbar.exhibitionMode', description: 'Exhibition Mode', defaultMessage: 'Exibição'},

    showInFullMode: {id: 'navbar.exhibitionMode.full', description: 'Full Exhibition Mode', defaultMessage: 'Completo'},
    showInCompactMode: {id: 'navbar.exhibitionMode.compact', description: 'Compact Exhibition Mode', defaultMessage: 'Compacto'},
    legendMenu: {id: 'navbar.exhibitionMode.legendMenu', description: 'Compact Exhibition Mode', defaultMessage: 'Legendas'},
    legendMenuProjectLegend: {id: 'navbar.exhibitionMode.legend.projectLegend', description: '', defaultMessage: 'Projetos'},
    legendMenuMemberWipPanel: {id: 'navbar.exhibitionMode.legend.memberWipPanel', description: '', defaultMessage: 'Wip de Executores'},

    swimLaneMode: {id: 'navbar.swimLaneMode', description: 'SwimLaneMode Mode', defaultMessage: 'Raias dinâmicas'},

    showBoardTitle: {id: 'navbar.showBoard.menuTItle', description: 'Show Board Menu Title', defaultMessage: 'Exibir quadro'},
    addSimpleCardMenuItemTitle: {id: 'navbar.addSimpleCard.menuTitle', description: 'Add Simple Card Menu Title', defaultMessage: 'Adicionar cartão'},
    feedbackMenuItemTitle: {id: 'navbar.feedback.menuTitle', description: 'Add feedback Menu Title', defaultMessage: 'Enviar feedback'},
    editLayoutMenuItemTitle: {id: 'navbar.editLayout.menuTitle', description: 'Edit layout Menu Item Title', defaultMessage: 'Alterar layout do quadro'},
    boardConfigMenuItemTitle: {id: 'navbar.boardConfig.menuTitle', description: 'Board Config Menu Item Title', defaultMessage: 'Configurar quadro'},
    calendarMenuItemTitle: {id: 'navbar.boardCalendar.menuTitle', description: 'Board Calendar Menu Item Title', defaultMessage: 'Calendário do quadro'},
    backlogMenuItemTitle: {id: 'navbar.boardBacklog.menuTitle', description: 'Board Backlog Menu Item Title', defaultMessage: 'Gestão de backlog do quadro'},
    boardReportsItemTitle: {id: 'navbar.boardReport.menuTitle', description: 'Board Report Menu Item Title', defaultMessage: 'Relatórios do quadro'},
    tagCategorySwimlaneMenu: {id: 'navbar.swimlanes.tagCategoryMenu', description: 'navbar.swimlanes.tagCategoryMenu', defaultMessage: 'Cat. Tags'},
    tagCategorySwimlaneEmptyMenu: {id: 'navbar.swimlanes.tagCategorySwimlaneEmptyMenu', description: 'navbar.swimlanes.tagCategorySwimlaneEmptyMenu', defaultMessage: 'Nenhuma categoria cadastrada'},
    agingSwimlaneMenu: {id: 'navbar.swimlanes.agingMenu', description: 'navbar.swimlanes.agingMenu', defaultMessage: 'Envelhecimento'},
    agingSwimlaneEmptyMenu: {id: 'navbar.swimlanes.agingEmptyMenu', description: 'navbar.swimlanes.agingEptyMenu', defaultMessage: 'Nenhum envelhecimento cadastrado'},

    noAging: {id: 'navbar.swimlanes.noAging', description: 'navbar.swimlanes.noAging', defaultMessage: 'Nenhum'},
    createdDateAging: {id: 'navbar.swimlanes.createdDateAging', description: 'navbar.swimlanes.createdDateAging', defaultMessage: 'Desde a Data de criação'},
    startLeadTimeAging: {id: 'navbar.swimlanes.startLeadTimeAging', description: 'navbar.swimlanes.startLeadTimeAging', defaultMessage: 'Desde o Início do LeadTime'},
    startCycleTimeAging: {id: 'navbar.swimlanes.startCycleTimeAging', description: 'navbar.swimlanes.startCycleTimeAging', defaultMessage: 'Desde o Início do CycleTime'},
    lastTransactionLaneAging: {id: 'navbar.swimlanes.lastTransactionLaneAging', description: 'navbar.swimlanes.lastTransactionLaneAging', defaultMessage: 'Desde a Última movimentação'}
});


var StateRecord = Immutable.Record({selectedAgingExhibitionMode: null, selectedVisualStyle: null, selectedSwimLaneStyle: null, showProjectLegend: true, showMemberWipPanel: true});

@airflux.FluxComponent
@ImmutableState
class TopNavBar extends React.Component
{

    static displayName = 'TopNavBar';

    static propTypes =
    {
        selectedBoard: React.PropTypes.object,
        intl: intlShape.isRequired,
        boardList: React.PropTypes.array,
        onLogout: React.PropTypes.func.isRequired
    };

    static contextTypes =
    {
        loggedUser: React.PropTypes.any,
        router: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardShowStore, this._listenToBoardShowStore);
        this.listenTo(BoardContextStore, this._listenToBoardContextStore);

        this.state = {data: new StateRecord()};
    }

    _listenToBoardContextStore(store) //eslint-disable-line
    {
        this.forceUpdate();
    }

    componentDidUpdate()
    {
        window.$('.item.addSimpleCardMenuItem').popup({popup: window.$('.ui.popup.addCardPopup'), on: 'click', delay: {show: 100, hide: 800}}); //eslint-disable-line
        window.$('.item.feedbackMenuItem').popup({popup: window.$('.ui.popup.feedBackPopup'), on: 'click', delay: {show: 100, hide: 800}}); //eslint-disable-line
    }

    _handleChangeExhibitionMode = (visualStyle, e) => //eslint-disable-line
    {
        //e.preventDefault();
        UIActions.setBoardVisualStyle.asFunction(visualStyle);
    };

    _handleChangeAgingExhibitionMode = (agingType, e) =>  //eslint-disable-line
    {
        UIActions.setBoardAgingExhibitionMode.asFunction(agingType.name);
    }

    _handleChangeShowProjectLegend = (e) =>  //eslint-disable-line
    {
        UIActions.setShowProjectLegend.asFunction(!this.state.data.showProjectLegend);
    }

    _handleChangeShowMemberWipPanel = (e) =>  //eslint-disable-line
    {
        UIActions.setShowMemberWipPanel.asFunction(!this.state.data.showMemberWipPanel);
    }

    _handleChangeSwimLaneStyle = (swimLaneStyle, e) => //eslint-disable-line
    {
        //e.preventDefault();
        UIActions.setBoardSwimLaneStyle.asFunction(swimLaneStyle);
    };

    _handleShowAddCardPopup = (e) =>
    {
        if (e) {e.preventDefault();}
        window.$('.item.addSimpleCardMenuItem').popup('show'); //eslint-disable-line
    };

    _handleShowFeedbackPopup = (e) =>
    {
        if (e) {e.preventDefault();}
        window.$('.item.feedbackMenuItem').popup('show'); //eslint-disable-line
    };

    _listenToBoardShowStore(store)
    {
        switch (store.actionState)
        {
            case UIActions.setBoardVisualStyle:
                this.setImmutableState({selectedVisualStyle: store.state.selectedVisualStyle});
                break;
            case UIActions.setBoardAgingExhibitionMode:
                this.setImmutableState({selectedAgingExhibitionMode: store.state.selectedAgingExhibitionMode});
                break;
            case UIActions.setBoardSwimLaneStyle:
                this.setImmutableState({selectedSwimLaneStyle: store.state.selectedSwimLaneStyle});
                break;
            case UIActions.setShowProjectLegend:
            {
                this.setImmutableState({showProjectLegend: store.state.showProjectLegend});
                break;
            }
            case UIActions.setShowMemberWipPanel:
            {
                this.setImmutableState({showMemberWipPanel: store.state.showMemberWipPanel});
                break;
            }

            case KanbanActions.board.get.completed:
                //TODO: Codigo duplibaco em boardshowpage
                let boardProfile = LocalStorageManager.getBoardProfile(store.state.board._id);
                let selectedSwimLaneStyle = (FunctionHelper.isDefined(this.state.data.selectedSwimLaneStyle)) ? this.state.data.selectedSwimLaneStyle : store.state.selectedSwimLaneStyle;
                selectedSwimLaneStyle = boardProfile.selectedSwimLaneStyle || selectedSwimLaneStyle;
                let selectedVisualStyle = boardProfile.selectedVisualStyle || store.state.selectedVisualStyle;
                let selectedAgingExhibitionMode = boardProfile.selectedAgingExhibitionMode || store.state.selectedAgingExhibitionMode;
                let showProjectLegend = boardProfile.showProjectLegend || store.state.showProjectLegend;
                let showMemberWipPanel = boardProfile.showMemberWipPanel || store.state.showMemberWipPanel;

                this.setImmutableState({showProjectLegend: showProjectLegend, showMemberWipPanel: showMemberWipPanel, selectedAgingExhibitionMode: selectedAgingExhibitionMode, selectedVisualStyle: selectedVisualStyle, selectedSwimLaneStyle: selectedSwimLaneStyle});
                break;
            default:
                break;
        }
    }

    _renderTagCategorySwimLanes = () =>
    {
        const _getTagSwimLanes = () =>
        {
            const allConfigs = BoardContextStore.getSelectedBoardAllConfig();
            if (FunctionHelper.isUndefined(allConfigs))
            {
                return null;
            }
            let swimLaneStyles = allConfigs.tagCategories.map(tagCategory =>
            {
                const avatar = (tagCategory.avatar) ? tagCategory.avatar : {icon: 'tag'};
                return ({icon: avatar, title: tagCategory.title, type: SwimLaneType.tagCategory.name, property: constants.CARD_TAGS_PROPERTY, id: tagCategory._id, wipLimit: tagCategory.wipLimit});
            });
            return _.filter(swimLaneStyles, (item) => item.type === SwimLaneType.tagCategory.name);
        };

        const _renderEmptyTagCategorySwimLane = () =>
        {
            return (
                <Item>
                    <Icon className="check circle outline" style={{opacity: 0}}/>
                    <Icon className="tags"/>
                    <FormattedMessage {...messages.tagCategorySwimlaneMenu}/>
                    <Icon className="dropdown"/>
                    <MenuItems>
                        <Item key={FunctionHelper.uuid()}>
                            <FormattedMessage {...messages.tagCategorySwimlaneEmptyMenu}/>
                        </Item>
                    </MenuItems>
                </Item>
            );
        };

        const {selectedSwimLaneStyle} = this.state.data;
        let tagSwimLanes = _getTagSwimLanes();
        if (FunctionHelper.isArrayNullOrEmpty(tagSwimLanes))
        {
            return _renderEmptyTagCategorySwimLane();
        }
        const isTagCategorySwimLaneStyleSelected = FunctionHelper.isDefined(selectedSwimLaneStyle) && selectedSwimLaneStyle.type === SwimLaneType.tagCategory.name;
        return (
            <Item>
                <Icon className="check circle outline" style={{opacity: isTagCategorySwimLaneStyleSelected ? 1 : 0}}/>
                <Icon className="tags"/>
                <FormattedMessage {...messages.tagCategorySwimlaneMenu}/>
                <Icon className="dropdown"/>
                <MenuItems>
                {
                    tagSwimLanes.map((swimLaneStyle) =>
                    {
                        const isTagSwimlaneSelected = FunctionHelper.isDefined(selectedSwimLaneStyle) && selectedSwimLaneStyle.title === swimLaneStyle.title;
                        return (<Item key={FunctionHelper.uuid()} onClick={this._handleChangeSwimLaneStyle.bind(this, swimLaneStyle)} >
                            <Icon className="check circle outline" style={{opacity: isTagSwimlaneSelected ? 1 : 0}}/>
                            <Avatar isToShowBackGroundColor={false} avatar={swimLaneStyle.icon} hostStyle={{width: null, height: null, display: 'inline-flex'}} style={{width: '20px', height: '20px', lineHeight: 1.5}} />
                            {`${swimLaneStyle.title}`}
                        </Item>);
                    })
                }
                </MenuItems>
            </Item>
        );
    }

    _renderAddCardPopupMenu = () =>
    {
        const {formatMessage} = this.props.intl;
        return (
            <Item className="addSimpleCardMenuItem" style={{cursor: 'pointer'}} onClick={this._handleShowAddCardPopup} title={formatMessage(messages.addSimpleCardMenuItemTitle)}>
                <Icon className="payment"/>
                <span><FormattedMessage {...messages.addCard} /></span>
            </Item>
        );
    }

    _renderSwimLaneMenu = () =>
    {
        const {selectedBoard} = this.props;
        const {selectedSwimLaneStyle} = this.state.data; //eslint-disable-line
        //Exibe todos os tipos, exceto o de categorias de tag e de envelhecimento, pois sao renderizados a parte
        const swilaneList = FunctionHelper.isDefined(selectedBoard) && FunctionHelper.isDefined(selectedBoard.swimLaneStyles) ? _.filter(selectedBoard.swimLaneStyles, (item) => (item.type !== SwimLaneType.tagCategory.name && item.type !== SwimLaneType.agings.name)) : [];
        return (
            <Dropdown className="item" init>
                <FaIcon className="fa-1 fa-bars" style={{marginRight: '5px'}}/>
                <span style={{minWidth: '110px'}}><FormattedMessage {...messages.swimLaneMode} style={{whiteSpace: 'no-wrap'}} /></span>
                <Icon className="dropdown"/>
                <MenuItems>
                    {
                        swilaneList.map((swimLaneStyle) =>
                        {
                            let isSelected = FunctionHelper.isDefined(selectedSwimLaneStyle) && selectedSwimLaneStyle.type === swimLaneStyle.type;
                            return (<Item key={FunctionHelper.uuid()} onClick={this._handleChangeSwimLaneStyle.bind(this, swimLaneStyle)}>
                                <Icon className="check circle outline" style={{opacity: isSelected ? 1 : 0}}/>
                                <Icon className={swimLaneStyle.icon}/>
                                {`${swimLaneStyle.title}`}
                            </Item>);
                        })
                    }
                    {this._renderTagCategorySwimLanes()}
                </MenuItems>
            </Dropdown>
        );
    }

    _renderExibhtionModeMenu = () =>
    {
        const {selectedBoard} = this.props;
        const {selectedAgingExhibitionMode, selectedVisualStyle, showProjectLegend, showMemberWipPanel} = this.state.data; //eslint-disable-line

        return (
            <Dropdown className="item" init>
                <Icon className="unhide"/>
                <span style={{minWidth: '105px'}}><FormattedMessage {...messages.exhibitionMode} /></span>
                <Icon className="dropdown"/>
                <MenuItems>
                    {
                        selectedBoard.visualStyles &&
                            selectedBoard.visualStyles.map((visualStyle) =>
                            {
                                const isSelected = FunctionHelper.isDefined(visualStyle) && FunctionHelper.isDefined(selectedVisualStyle) && visualStyle.type === selectedVisualStyle.type && visualStyle.orientation === selectedVisualStyle.orientation;
                                return (<Item key={FunctionHelper.uuid()} onClick={this._handleChangeExhibitionMode.bind(this, visualStyle)} >
                                    <Icon className="check circle outline" style={{opacity: isSelected ? 1 : 0}}/>
                                    {`${visualStyle.title}`}
                                </Item>);
                            })
                    }
                    <Divider/>
                    <Item>
                        <Icon className="birthday"/>
                        <FormattedMessage {...messages.agingSwimlaneMenu}/>
                        <Icon className="dropdown"/>
                        <MenuItems>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeAgingExhibitionMode.bind(this, AgingType.none)} >
                                <Icon className="check circle outline" style={{opacity: selectedAgingExhibitionMode === AgingType.none.name ? 1 : 0}}/>
                                <FormattedMessage {...messages.noAging}/>
                            </Item>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeAgingExhibitionMode.bind(this, AgingType.createdDate)} >
                                <Icon className="check circle outline" style={{opacity: selectedAgingExhibitionMode === AgingType.createdDate.name ? 1 : 0}}/>
                                <FormattedMessage {...messages.createdDateAging}/>
                            </Item>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeAgingExhibitionMode.bind(this, AgingType.startLeadTimeDate)}>
                                <Icon className="check circle outline" style={{opacity: selectedAgingExhibitionMode === AgingType.startLeadTimeDate.name ? 1 : 0}}/>
                                <FormattedMessage {...messages.startLeadTimeAging}/>
                            </Item>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeAgingExhibitionMode.bind(this, AgingType.startCycleTimeDate)}>
                                <Icon className="check circle outline" style={{opacity: selectedAgingExhibitionMode === AgingType.startCycleTimeDate.name ? 1 : 0}}/>
                                <FormattedMessage {...messages.startCycleTimeAging}/>
                            </Item>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeAgingExhibitionMode.bind(this, AgingType.lastLaneTransactionDate)}>
                                <Icon className="check circle outline" style={{opacity: selectedAgingExhibitionMode === AgingType.lastLaneTransactionDate.name ? 1 : 0}}/>
                                <FormattedMessage {...messages.lastTransactionLaneAging}/>
                            </Item>
                        </MenuItems>
                    </Item>
                    <Item>
                        <Icon className="paw"/>
                        <FormattedMessage {...messages.legendMenu}/>
                        <Icon className="dropdown"/>
                        <MenuItems>
                            <Item key={FunctionHelper.uuid()} onClick={this._handleChangeShowMemberWipPanel} >
                                <Icon className="check circle outline" style={{opacity: showMemberWipPanel ? 1 : 0}}/>
                                <FormattedMessage {...messages.legendMenuMemberWipPanel}/>
                            </Item>
                        </MenuItems>
                    </Item>
                </MenuItems>
            </Dropdown>
        );
    }

    _renderNotLoggedInUserMenu = () =>
    {
        return (
            <MenuItems className="right">
                <NavLink to="/login" className="item"><Icon className="sign in"/><FormattedMessage {...messages.login} /></NavLink>
                <NavLink to="/signup" className="item"><Icon className="add user"/><FormattedMessage {...messages.register} /></NavLink>
            </MenuItems>
        );
    }

    _renderBoardListMenu = () =>
    {
        const {boardList} = this.props;
        const listOfBoardsIsMemberOf = (boardList) ? _.filter(boardList, (item) => item.isMemberOf) : [];
        return (
            <Dropdown className="item" init>
                <FormattedMessage {...messages.boardsTitle} />
                <Icon className="dropdown"/>
                <MenuItems style={{maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', padding: '10px'}}>
                    <NavLink to="/boards/add" className="ui item"><Icon className="tiny add"/><FormattedMessage {...messages.createBoard} /></NavLink>
                    <Divider/>
                    {
                        listOfBoardsIsMemberOf.map((board, i) => (<NavLink key={FunctionHelper.uuid()} to={`/boards/${board._id}`} className="item">{`${i + 1} - ${board.title}`}</NavLink>))
                    }
                </MenuItems>
            </Dropdown>
        );
    }

    _renderUserMenu = () =>
    {
        const loggedUser = this.context.loggedUser;
        return (
            <Dropdown className="item" init>
                {loggedUser.nickname}
                <Icon className="dropdown"/>
                <MenuItems style={{maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', padding: '10px'}}>
                    <NavLink to="/user/timesheet" className="ui item"><Icon className="tiny list"/><FormattedMessage {...messages.userTimesheet} /></NavLink>
                    <NavLink to="/user/profile" className="ui item"><Icon className="tiny user"/><FormattedMessage {...messages.userProfile} /></NavLink>
                    <Divider/>
                    <Item type="link" onClick={this.props.onLogout}><Icon className="sign out"/><FormattedMessage {...messages.logout} /></Item>
                </MenuItems>
            </Dropdown>
        );
    }

    _renderFeedbackMenu = () =>
    {
        const {formatMessage} = this.props.intl;
        return (
            <Item className="feedbackMenuItem" style={{cursor: 'pointer'}} onClick={this._handleShowFeedbackPopup} title={formatMessage(messages.feedbackMenuItemTitle)}>
                <Icon className="announcement "/>
            </Item>
        );
    }

    render()
    {
        const {selectedBoard} = this.props;
        const {formatMessage} = this.props.intl;
        const loggedUser = this.context.loggedUser;
        const isShowingBoardShowPage = (this.props.selectedBoard && this.props.router.isActive('/boards/' + this.props.selectedBoard._id));
        const isUserLoggedIn = FunctionHelper.isDefined(loggedUser);
        const isBoardSelected = FunctionHelper.isDefined(selectedBoard);

        return (
            <Menu className="fixed stackable blue pointing app topbar no-print">
                <NavLink to={'/boards'} className="item"><Icon className="home"/><FormattedMessage {...messages.appName} /></NavLink>
                {
                    isUserLoggedIn && isBoardSelected &&
                        <MenuItems>
                            <NavLink to={`/boards/${selectedBoard._id}`} className="item" title={formatMessage(messages.showBoardTitle)}>
                                <Icon className="grid layout"/> {selectedBoard.title}
                            </NavLink>
                            {isShowingBoardShowPage && this._renderAddCardPopupMenu()}
                            {isShowingBoardShowPage && this._renderSwimLaneMenu()}
                            {isShowingBoardShowPage && this._renderExibhtionModeMenu()}
                            <NavLink to={`/boards/${selectedBoard._id}/calendar`} className="item" title={formatMessage(messages.calendarMenuItemTitle)}><Icon className="calendar"/><FormattedMessage {...messages.calendar} /></NavLink>
                            <NavLink to={`/boards/${selectedBoard._id}/backlog`} className="item" title={formatMessage(messages.backlogMenuItemTitle)}><Icon className="calculator"/><FormattedMessage {...messages.backlog} /></NavLink>
                            <NavLink to={`/boards/${selectedBoard._id}/edit/layout`} className="item" title={formatMessage(messages.editLayoutMenuItemTitle)}><Icon className="columns"/><FormattedMessage {...messages.changeBoardLayout} /></NavLink>
                            <NavLink to={`/boards/${selectedBoard._id}/settings`} className="item" title={formatMessage(messages.boardConfigMenuItemTitle)}><Icon className="settings"/><FormattedMessage {...messages.settings} /></NavLink>
                            <NavLink to={`/boards/${selectedBoard._id}/reports`} className="item" title={formatMessage(messages.boardReportsItemTitle)}><Icon className="pie chart"/><FormattedMessage {...messages.reports} /></NavLink>
                        </MenuItems>
                }
                {
                    (isUserLoggedIn) &&
                        <MenuItems className="right">
                            {this._renderFeedbackMenu()}
                            {this._renderBoardListMenu()}
                            {this._renderUserMenu()}
                        </MenuItems>
                }
                {(!isUserLoggedIn) && this._renderNotLoggedInUserMenu()}

                <Popup className="addCardPopup" style={{minWidth: '615px'}}>
                    <AddSimpleCardFormUI board={selectedBoard}/>
                </Popup>
                <Popup className="feedBackPopup" style={{minWidth: '615px'}}>
                    <AddFeedBackFormUI/>
                </Popup>
            </Menu>
        );
    }
}

module.exports = withRouter(injectIntl(TopNavBar));
