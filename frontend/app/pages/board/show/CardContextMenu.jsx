//TODO: intercionalizar o role na lista de membros que podem ser designados
'use strict';
import _ from 'lodash';
import React from 'react';
import {Icon} from 'react-semantify';
import * as airflux from 'airflux';
import {ContextMenu, SubMenu, MenuItem, connect} from 'react-contextmenu';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import moment from 'moment';

import {BoardContextStore} from '../../../stores';
import {Avatar, Divider, FaIcon} from '../../../components';
import {FunctionHelper} from '../../../commons';
import {KanbanActions, UIActions} from '../../../actions';
import {LaneType} from '../../../enums';
import {UserEntity} from '../../../entities';

const messages = defineMessages(
{
    confirmCancel: {id: 'card.contextMenu.confirmCancel', description: '', defaultMessage: 'Confirmar cancelamento do cartão'},
    confirmCancelConnectedCardToo: {id: 'card.contextMenu.confirmCancelConnectedCardToo', description: '', defaultMessage: 'Confirmar cancelamento do cartão e de todos os cartões conectados a este cartão?'},

    confirmDelete: {id: 'card.contextMenu.confirmDelete', description: '', defaultMessage: 'Confirmar exclusão do cartão'},
    confirmDeleteConnectedCardToo: {id: 'card.contextMenu.confirmDeleteConnectedCardToo', description: '', defaultMessage: 'Confirmar exclusão do cartão e de todos os cartõews conectados a este cartão?'},

    confirmArchiveLane: {id: 'card.contextMenu.confirmArchiveLane', description: '', defaultMessage: 'Confirmar arquivamento de TODOS os cartões da raia'},
    loading: {id: 'card.contextMenu.loading', description: '', defaultMessage: 'Carregando...'},
    boardWithoutMembers: {id: 'card.contextMenu.loading', description: '', defaultMessage: 'Nenhum membro cadastrado'},
    allMembersIsAssigned: {id: 'card.contextMenu.allMembersIsAssigned', description: '', defaultMessage: 'Todos os membros já estão designados'},
    noMembersIsAssigned: {id: 'card.contextMenu.noMembersIsAssigned', description: '', defaultMessage: 'Nenhum membro designado'},
    menuAssignMember: {id: 'card.contextMenu.menuAssignMember', description: '', defaultMessage: 'Designar para'},
    menuRevokeMember: {id: 'card.contextMenu.menuRevokeMember', description: '', defaultMessage: 'Retirar designação de'},
    menuImpediment: {id: 'card.contextMenu.menuImpediment', description: '', defaultMessage: 'Impedimentos'},
    menuCustomField: {id: 'card.contextMenu.menuCustomField', description: '', defaultMessage: 'Campos customizados'},
    menuTasks: {id: 'card.contextMenu.menuTasks', description: '', defaultMessage: 'Tarefas'},
    menuComments: {id: 'card.contextMenu.menuComments', description: '', defaultMessage: 'Comentários'},
    menuImpediments: {id: 'card.contextMenu.menuImpediments', description: '', defaultMessage: 'Impedimentos'},
    menuArchiveCard: {id: 'card.contextMenu.menuArchiveCard', description: '', defaultMessage: 'Arquivar cartão'},
    menuArchiveLane: {id: 'card.contextMenu.menuArchiveLane', description: '', defaultMessage: 'Arquivar TODOS cartões'},
    menuCancelCard: {id: 'card.contextMenu.menuCancelCard', description: '', defaultMessage: 'Cancelar cartão'},
    menuCancelConnectedCardToo: {id: 'card.contextMenu.menuCancelConnectedCardToo', description: '', defaultMessage: 'Cancelar cartão e todos conectados'},
    menuDeleteCard: {id: 'card.contextMenu.menuDeleteCard', description: '', defaultMessage: 'Excluir cartão'},
    menuDeleteConnectedCardToo: {id: 'card.contextMenu.menuDeleteConnectedCardToo', description: '', defaultMessage: 'Excluir cartão e todos conectados'},
    menuShow: {id: 'card.contextMenu.menuShow', description: '', defaultMessage: 'Exibir'},
    menuQuickEdit: {id: 'card.contextMenu.menuQuickEdit', description: '', defaultMessage: 'Edição Rápida'},
    menuEdit: {id: 'card.contextMenu.menuEdit', description: '', defaultMessage: 'Abrir'},

    menuClassOfServices: {id: 'board.settings.navbar.classOfServices', description: 'Class of Services Config', defaultMessage: 'Classe de Serviço'},
    menuConnection: {id: 'board.settings.navbar.menuDisconnect', description: '', defaultMessage: 'Conexão'},
    menuItemSizes: {id: 'board.settings.navbar.itemSizes', description: 'Preferences config', defaultMessage: 'Tamanhos'},
    menuItemTypes: {id: 'board.settings.navbar.itemTypes', description: 'Item Types Config', defaultMessage: 'Tipos de Itens'},
    menuMetrics: {id: 'board.settings.navbar.metrics', description: 'Preferences config', defaultMessage: 'Metricas'},
    menuPriorities: {id: 'board.settings.navbar.priorities', description: 'Priorities Config', defaultMessage: 'Prioridade'},
    menuProjects: {id: 'board.settings.navbar.projects', description: 'Preferences config', defaultMessage: 'Projetos'},
    clearItem: {id: 'board.settings.navbar.clearItem', description: 'Preferences config', defaultMessage: 'Limpar'}
});

@airflux.FluxComponent
class CardContextMenu extends React.Component
{

    static displayName = 'CardContextMenu';

    static propTypes =
    {
        onRemoveCard: React.PropTypes.func.isRequired,
        onArchiveCard: React.PropTypes.func.isRequired,
        onArchiveLane: React.PropTypes.func.isRequired,
        onCancelCard: React.PropTypes.func.isRequired,
        intl: intlShape.isRequired
    }

    constructor(props)
    {
        super(props);
        this.listenTo(BoardContextStore, this._listenToContextStoreChange);
    }

    _listenToContextStoreChange = () =>
    {
        this.forceUpdate();
    }

    _handleAddImpediment = (impedimentType, e) =>
    {
        e.preventDefault();
        const card = this.props.item.name;
        const impediment = {board: card.board, card: card._id, type: impedimentType._id, reason: '', startDate: moment().utc().toDate()};
        KanbanActions.cardSetting.impediment.add.asFunction(card, impediment);
    }

    _handleArchiveLane = (e) =>
    {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        const card = this.props.item.name;
        const lane = this.props.item.lane;
        if (confirm(`${formatMessage(messages.confirmArchiveLane)} [${lane.title}] ?`)) //eslint-disable-line
        {
            this.props.onArchiveLane(card.board, lane);
        }
    }

    _handleAssignMember = (item) =>
    {
        const card = this.props.item.name;
        if (FunctionHelper.isUndefined(card.assignedMembers))
        {
            card.assignedMembers = [];
        }
        card.assignedMembers.push(item);
        return KanbanActions.card.update.asFunction(card);
    }

    _handleRevokeMember = (memberToRevoke) =>
    {
        const card = this.props.item.name;
        if (FunctionHelper.isArrayNullOrEmpty(card.assignedMembers))
        {
            return null;
        }
        card.assignedMembers = card.assignedMembers.filter(member => member._id !== memberToRevoke._id);
        return KanbanActions.card.update.asFunction(card);
    }

    _handleCancelCard = (e) =>
    {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        const card = this.props.item.name;
        if (confirm(`${formatMessage(messages.confirmCancel)} [${card.title}] ?`)) //eslint-disable-line
        {
            this.props.onCancelCard(card, false);
        }
    }

    _handleCancelConnectedCardToo = (e) =>
    {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        const card = this.props.item.name;
        if (confirm(`${formatMessage(messages.confirmCancelConnectedCardToo)} [${card.title}] ?`)) //eslint-disable-line
        {
            this.props.onCancelCard(card, true);
        }
    }

    _handleChangeCardInformation = (property, value) =>
    {
        let card = this.props.item.name;
        card[property] = value;
        return KanbanActions.card.update.asFunction(card);
    }

    _handleDeleteCard = (e) =>
    {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        const card = this.props.item.name;
        if (confirm(`${formatMessage(messages.confirmDeleteConnectedCardToo)} [${card.title}] ?`)) //eslint-disable-line
        {
            this.props.onRemoveCard(card, false);
        }
    }

    _handleDeleteConnectedCardToo = (e) =>
    {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        const card = this.props.item.name;
        if (confirm(`${formatMessage(messages.confirmDelete)} [${card.title}] ?`)) //eslint-disable-line
        {
            this.props.onRemoveCard(card, true);
        }
    }

    _handleEditCard = () =>
    {
        const card = this.props.item.name;
        UIActions.contextMenuEditCard.asFunction(card);
    }


    _handleEditExternalCard = () =>
    {
        const card = this.props.item.name;
        let {cardIdConfig, externalId, externalLink} = card;
        let url = null;
        if (cardIdConfig && externalId)
        {
            let prefix = cardIdConfig.prefix || '';
            if (externalId.startsWith(prefix))
            {
                prefix = '';

            }
            else
            {
                externalId = FunctionHelper.pad(externalId, cardIdConfig.paddingSize, cardIdConfig.paddingChar);
            }
            //todo: REPETIDO EM KCARD a linha de baixo, centralizar
            url = (FunctionHelper.isDefined(cardIdConfig.urlTemplate)) ? cardIdConfig.urlTemplate.replace('[PREFIX]', prefix).replace('[ID]', externalId) : '';
        }
        else if (externalLink)
        {
            url = externalLink;
        }
        if (url)
        {
            var win = window.open(url, '_blank'); //eslint-disable-line
            win.focus();
        }
    }


    _handleShowCustomField = () =>
    {
        const card = this.props.item.name;
        UIActions.contextMenuShowCardCustomFieldPopup.asFunction(card);
    }

    _handleShowMenuTasks = () =>
    {
        const card = this.props.item.name;
        UIActions.contextMenuShowCardTaskPopup.asFunction(card);
    }

    _handleShowMenuComments = () =>
    {
        const card = this.props.item.name;
        UIActions.contextMenuShowCardCommentPopup.asFunction(card);
    }

    _handleShowMenuImpediments = () =>
    {
        const card = this.props.item.name;
        UIActions.contextMenuShowCardImpedimentPopup.asFunction(card);
    }

    _handleNothing = () =>
    {

    }

    _renderAssignMember = () =>
    {
        const that = this;
        const card = this.props.item.name;
        const {formatMessage} = this.props.intl;
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;

        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_assignMemberMenu`} title={formatMessage(messages.menuAssignMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.loading}/></MenuItem>
                </SubMenu>
            );
        }

        if (FunctionHelper.isDefined(boardAllConfig) && FunctionHelper.isArrayNullOrEmpty(boardAllConfig.members))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_assignMemberMenu`} title={formatMessage(messages.menuAssignMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.boardWithoutMembers}/></MenuItem>
                </SubMenu>
            );
        }
        let listOfMembers = FunctionHelper.clone(boardAllConfig.members);
        let notAssignedMembers = _.map(_.differenceBy(listOfMembers, card.assignedMembers, '_id'), (item) => { item.user = new UserEntity(item.user); return item;});
        if (FunctionHelper.isArrayNullOrEmpty(notAssignedMembers))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_assignMemberMenu`} title={formatMessage(messages.menuAssignMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.allMembersIsAssigned}/></MenuItem>
                </SubMenu>
            );
        }

        return (
            <SubMenu key={`ctxtMenu_${card._id}_assignMemberMenu`} title={formatMessage(messages.menuAssignMember)}>
            {
                notAssignedMembers.map(item =>
                {
                    return (<MenuItem onClick={this._handleAssignMember.bind(that, item)} key={`ctxtMenu_assignMember_${item._id}`}>
                        <div style={{display: 'inline-flex'}}>
                            <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.user.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                            {`${item.user.fullname} (${item.role})`}
                        </div>
                    </MenuItem>);
                })
            }
            </SubMenu>
        );
    }

    _renderRevokeMember = () =>
    {
        const that = this;
        const card = this.props.item.name;
        if (FunctionHelper.isArrayNotEmpty(card.members))
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;

        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_revokeMemberMenu`} title={formatMessage(messages.menuRevokeMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.loading}/></MenuItem>
                </SubMenu>
            );
        }

        if (FunctionHelper.isDefined(boardAllConfig) && FunctionHelper.isArrayNullOrEmpty(boardAllConfig.members))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_revokeMemberMenu`} title={formatMessage(messages.menuRevokeMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.boardWithoutMembers}/></MenuItem>
                </SubMenu>
            );
        }

        let listOfMembers = FunctionHelper.clone(boardAllConfig.members);
        let assignedMembers = _.map(_.intersectionBy(listOfMembers, card.assignedMembers, '_id'), (item) => { item.user = new UserEntity(item.user); return item;});
        if (FunctionHelper.isArrayNullOrEmpty(assignedMembers))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_revokeMemberMenu`} title={formatMessage(messages.menuRevokeMember)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.noMembersIsAssigned}/></MenuItem>
                </SubMenu>
            );
        }

        return (
            <SubMenu key={`ctxtMenu_${card._id}_revokeMemberMenu`} title={formatMessage(messages.menuRevokeMember)}>
            {
                assignedMembers.map(item =>
                {
                    return (<MenuItem onClick={this._handleRevokeMember.bind(that, item)} key={`ctxtMenu_assignMember_${item._id}`}>
                        <div style={{display: 'inline-flex'}}>
                            <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.user.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                            {`${item.user.fullname} (${item.role})`}
                        </div>
                    </MenuItem>);
                })
            }
            </SubMenu>
        );
    }

    _renderImpedimentMenu()
    {
        const card = this.props.item.name;
        const lane = this.props.item.lane;
        if (lane.laneType === LaneType.completed.name)
        {
            return null;
        }
        const that = this;
        const {formatMessage} = this.props.intl;
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_impedimentCard`} title={formatMessage(messages.menuImpediment)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.loading}/></MenuItem>
                </SubMenu>
            );
        }
        const impedimentTypes = boardAllConfig.impedimentTypes;
        return (<SubMenu key={`ctxtMenu_${card._id}_impedimentCard`} title={formatMessage(messages.menuImpediment)}>
        {
            impedimentTypes.map(item =>
            {
                return (<MenuItem onClick={this._handleAddImpediment.bind(that, item)} key={`ctxtMenu_impediment_${item._id}`}><div style={{display: 'inline-flex'}}><Avatar avatar={item.avatar} hostStyle={{marginRight: '5px'}}/>{item.title}</div></MenuItem>);
            })
        }
        </SubMenu>);
    }

    _renderQuickEdit()
    {
        const that = this;
        const card = this.props.item.name;
        const {formatMessage} = this.props.intl;
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return (
                <SubMenu key={`ctxtMenu_${card._id}_quickEditMenu`} title={formatMessage(messages.menuQuickEdit)}>
                    <MenuItem onClick={this._handleNothing}><FormattedMessage {...messages.loading}/></MenuItem>
                </SubMenu>
            );
        }

        return (
            <SubMenu key={`ctxtMenu_${card._id}_quickEditMenu`} title={formatMessage(messages.menuQuickEdit)}>
                <SubMenu key={`ctxtMenu_${card._id}_menuClassOfServices`} title={formatMessage(messages.menuClassOfServices)}>
                    {
                        boardAllConfig.classOfServices.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'classOfService', item)} key={`ctxtMenu_classOfService_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.classOfService) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'ctxtMenu_classOfService_divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'classOfService', null)} key={'ctxtMenu_classOfService_clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_menuProjects`} title={formatMessage(messages.menuProjects)}>
                    {
                        boardAllConfig.projects.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'project', item)} key={`ctxtMenu_project_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.project) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'ctxtMenu_project_divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'project', null)} key={'ctxtMenu_project_clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_menuPriorities`} title={formatMessage(messages.menuPriorities)}>
                    {
                        boardAllConfig.priorities.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'priority', item)} key={`ctxtMenu_priorities_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.priority) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'ctxtMenu_priorities__divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'priority', null)} key={'ctxtMenu_priorities__clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_menuItemSizes`} title={formatMessage(messages.menuItemSizes)}>
                    {
                        boardAllConfig.itemSizes.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'itemSize', item)} key={`ctxtMenu_itemSizes_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.itemSize) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'ctxtMenu_itemSizes_divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'itemSize', null)} key={'ctxtMenu_itemSizes_clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_menuItemTypes`} title={formatMessage(messages.menuItemTypes)}>
                    {
                        boardAllConfig.itemTypes.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'itemType', item)} key={`ctxtMenu_itemTypes_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.itemType) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'ctxtMenu_itemTypes_divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'itemType', null)} key={'ctxtMenu_itemTypes_clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_menuMetrics`} title={formatMessage(messages.menuMetrics)}>
                    {
                        boardAllConfig.metrics.map(item =>
                        {
                            return (<MenuItem onClick={this._handleChangeCardInformation.bind(that, 'metric', item)} key={`ctxtMenu_metrics_${item._id}`}>
                                <div style={{display: 'inline-flex'}}>
                                    <Icon className="check circle outline" style={{fontSize: '12px', opacity: FunctionHelper.getId(card.metric) === FunctionHelper.getId(item) ? 1 : 0}}/>
                                    <Avatar isToShowBackGroundColor hostStyle={{marginRight: '5px'}} isSquareImageDimension avatar={item.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                                    {item.title}
                                </div>
                            </MenuItem>);
                        })
                    }
                    <Divider key={'txtMenu_metrics__divider'} />
                    <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'metric', null)} key={'ctxtMenu_metrics_clear'}>
                        <div style={{display: 'inline-flex'}}>
                            <FormattedMessage {...messages.clearItem}/>
                        </div>
                    </MenuItem>
                </SubMenu>
                <SubMenu key={`ctxtMenu_${card._id}_connections`} title={formatMessage(messages.menuConnection)}>
                    {
                        card.parent &&
                            <MenuItem onClick={this._handleChangeCardInformation.bind(that, 'parent', null)} key={'ctxtMenu_parent_clear'}>
                                <div style={{display: 'inline-flex'}}>
                                    <FormattedMessage {...messages.clearItem}/>
                                </div>
                            </MenuItem>
                    }
                </SubMenu>
            </SubMenu>
        );
    }

    _renderShowMenu()
    {
        const card = this.props.item.name;
        const {formatMessage} = this.props.intl;
        return (
            <SubMenu key={`ctxtMenu_${card._id}_showMenu`} title={formatMessage(messages.menuShow)}>
                { FunctionHelper.isDefined(card.taskStatistic) && card.taskStatistic.total > 0 &&
                    <MenuItem key={`ctxtMenu_${card._id}_showTaskCard`} onClick={this._handleShowMenuTasks.bind(this)}>
                        <Icon className="tasks"/>
                        <FormattedMessage {...messages.menuTasks}/>
                    </MenuItem>
                }
                <MenuItem key={`ctxtMenu_${card._id}_showImpedimentCard`} onClick={this._handleShowMenuImpediments.bind(this)}>
                    <Icon className="wait"/>
                    <FormattedMessage {...messages.menuImpediment}/>
                </MenuItem>
                <MenuItem key={`ctxtMenu_${card._id}_showCustomFieldCard`} onClick={this._handleShowCustomField.bind(this)}>
                    <Icon className="fa-wrench"/>
                    <FormattedMessage {...messages.menuCustomField}/>
                </MenuItem>
                <MenuItem key={`ctxtMenu_${card._id}_showCommentCard`} onClick={this._handleShowMenuComments.bind(this)}>
                    <FaIcon className="fa-comment" style={{marginRight: '3px'}}/>
                    <FormattedMessage {...messages.menuComments}/>
                </MenuItem>
            </SubMenu>
        );
    }

    _renderCancelArchiveDeleteMenu()
    {
        const card = this.props.item.name;
        const lane = this.props.item.lane;
        let itemsToRender = [];
        if (lane.laneType === LaneType.completed.name)
        {
            itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_archiveCard`} onClick={this.props.onArchiveCard.bind(this, card)}><Icon className="archive"/><FormattedMessage {...messages.menuArchiveCard}/></MenuItem>);
            itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_archiveLane`} onClick={this._handleArchiveLane}><Icon className="archive"/><Icon className="archive"/><FormattedMessage {...messages.menuArchiveLane}/></MenuItem>);
        }
        else
        {
            itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_cancelCard`} onClick={this._handleCancelCard}><Icon className="remove"/><FormattedMessage {...messages.menuCancelCard}/></MenuItem>);
            itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_cancelConnectedCardToo`} onClick={this._handleCancelConnectedCardToo}><Icon className="remove"/><Icon className="plug"/><FormattedMessage {...messages.menuCancelConnectedCardToo}/></MenuItem>);
        }
        itemsToRender.push(<Divider key={`ctxtMenu_${card._id}_divider_cancel`} />);
        itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_deleteCard`} onClick={this._handleDeleteCard}><Icon className="trash"/><FormattedMessage {...messages.menuDeleteCard}/></MenuItem>);
        itemsToRender.push(<MenuItem key={`ctxtMenu_${card._id}_deleteConnectedCardToo`} onClick={this._handleDeleteConnectedCardToo}><Icon className="trash"/><Icon className="plug"/><FormattedMessage {...messages.menuDeleteConnectedCardToo}/></MenuItem>);
        return itemsToRender;
    }

    _renderEditMenu()
    {
        const card = this.props.item.name;
        return (
            <MenuItem key={`ctxtMenu_${card._id}_showCustomFieldCard`} onClick={this._handleEditCard.bind(this)}>
                <FaIcon className="fa-folder-open" style={{marginRight: '3px'}}/>
                <FormattedMessage {...messages.menuEdit}/>
            </MenuItem>
        );
    }

    _renderEditExternalCardMenu()
    {
        const card = this.props.item.name;
        return (
            <MenuItem key={`ctxtMenu_${card._id}_showCustomFieldCard`} onClick={this._handleEditExternalCard.bind(this)}>
                <FaIcon className="fa-folder-open" style={{marginRight: '3px'}}/>
                <FormattedMessage {...messages.menuEdit}/>
            </MenuItem>
        );
    }

    render()
    {
        if (!this.props.item.name)
        {
            return (<ContextMenu identifier="card_context_menu"></ContextMenu>);
        }
        const card = this.props.item.name;
        if (card.isExternal)
        {
            return (<ContextMenu identifier="card_context_menu">
                {this._renderEditExternalCardMenu()}
            </ContextMenu>);
        }
        return (
            <ContextMenu identifier="card_context_menu">
                {this._renderAssignMember()}
                {this._renderRevokeMember()}
                <Divider/>
                {this._renderEditMenu()}
                <MenuItem key={`ctxtMenu_${card._id}_showCommentCard_principal`} onClick={this._handleShowMenuComments.bind(this)}>
                    <FaIcon className="fa-comment" style={{marginRight: '3px'}}/>
                    <FormattedMessage {...messages.menuComments}/>
                </MenuItem>
                {this._renderImpedimentMenu()}
                {this._renderQuickEdit()}
                {this._renderShowMenu()}
                <Divider/>
                {this._renderCancelArchiveDeleteMenu()}
            </ContextMenu>
        );
    }
}

export default connect(injectIntl(CardContextMenu));

