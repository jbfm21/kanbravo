//ATENCAO: alteracao no avatar para aceitar title, margin, borderColor, isToShowBackgroundColor
//Inclusao do sass blockIcon e assignedMembersIcon
//Elipsistext

'use strict';
import React from 'react';
import _ from 'lodash';
import * as airflux from 'airflux';
import Immutable from 'immutable';

import {Progress} from 'react-semantify';
import {ImmutableState} from '../../../decorators';
import {Float, Content, Description, Avatar, EllipsisText} from '../../../components';
import {BoardContextStore} from '../../../stores';
import {default as CustomFieldPopup} from './customField/CustomFieldPopup.jsx';
import {default as TaskPopup} from './task/TaskPopup.jsx';
import {default as ImpedimentPopup} from './impediment/ImpedimentPopup.jsx';
import {default as RatingPopup} from './rating/RatingPopup.jsx';


import {BoardLayoutHelper, FunctionHelper, CalendarLayoutHelper} from '../../../commons';
import {AgingType} from '../../../enums';
import {KanbanActions, UIActions} from '../../../actions';

import {default as AssignedMember} from './assignedMember/AssignedMember.jsx';
import {default as KCardStore} from './KCardStore';

var StateRecord = Immutable.Record({});

@airflux.FluxComponent
@ImmutableState
export default class KCard extends React.Component
{

    static displayName = 'KCard';

    static propTypes =
    {
        //TODO, Melhorar, criando um cartao mais simples e depois herdando cartao para ter context menu e etc, pois
        //existem lugares que é exibido o cartao somente para verificar como está o design, não tendo ações
        card: React.PropTypes.object.isRequired,
        lane: React.PropTypes.object,
        visualStyle: React.PropTypes.object,
        agingExhibitionMode: React.PropTypes.string,
        isReadOnly: React.PropTypes.bool,
        isContextMenuEnabled: React.PropTypes.bool,
        hostStyle: React.PropTypes.object
    };

    static defaultProps =
    {
        isReadOnly: false,
        isContextMenuEnabled: true,
        visualStyle: BoardLayoutHelper.defaultVisualStyle(),
        agingExhibitionMode: AgingType.none.name
    }

    constructor()
    {
        super();
        this.listenTo(KCardStore, this._listenToKCardStoreChange);
        this.listenTo(UIActions.contextMenuShowCardCustomFieldPopup, this._listenToShowCardCustomFieldPopupContextMenuAction);
        this.listenTo(UIActions.contextMenuShowCardCommentPopup, this._listenToShowCardCommentPopupContextMenuAction);
        this.listenTo(UIActions.contextMenuShowCardImpedimentPopup, this._listenToShowCardImpedimentPopupContextMenuAction);
        this.listenTo(UIActions.contextMenuShowCardTaskPopup, this._listenToShowCardTaskPopupContextMenuAction);
        this.listenTo(UIActions.contextMenuEditCard, this._listenToEditCardContextMenuAction);

        this.state = {data: new StateRecord({})};
    }

    componentDidMount()
    {
        this._refreshProgressBar();
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (nextProps.card.nonce !== this.props.card.nonce || nextProps.visualStyle !== this.props.visualStyle || nextState !== this.state || nextProps.agingExhibitionMode !== this.props.agingExhibitionMode);
    }

    componentDidUpdate()
    {
        this._refreshProgressBar();
    }


    _listenToShowCardTaskPopupContextMenuAction = (card) =>
    {
        if (card._id === this.props.card._id)
        {
            if (this.taskToopTip)
            {
                this.taskToopTip.getWrappedInstance().showToolTip();
            }
        }
    }

    _listenToShowCardImpedimentPopupContextMenuAction = (card) =>
    {
        if (card._id === this.props.card._id)
        {
            if (this.impedimentToopTip)
            {
                this.impedimentToopTip.getWrappedInstance().showToolTip();
            }
        }
    }

    _listenToShowCardCustomFieldPopupContextMenuAction = (card) =>
    {
        if (card._id === this.props.card._id)
        {
            this.customFieldToopTip.getWrappedInstance().showToolTip();
        }
    }

    _listenToShowCardCommentPopupContextMenuAction = (card) =>
    {
        if (card._id === this.props.card._id)
        {
            this._handleCardCommentModalShow();
        }
    }

    _listenToEditCardContextMenuAction = (card) =>
    {
        if (card._id === this.props.card._id)
        {
            this._handleCardFormModalShow();
        }
    }


    _listenToKCardStoreChange = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.impediment.add.completed:
            {
                const {card} = this.props;
                const savedImpediment = store.state.impediment;
                const cardId = savedImpediment.card;
                if (this.props.card._id === cardId)
                {
                    card.impediments.unshift(savedImpediment);
                    this.forceUpdate();
                }
                break;
            }
            case KanbanActions.cardSetting.task.update.completed:
            {
                const taskItem = store.state.taskItem;
                if (this.props.card._id !== taskItem.card)
                {
                    return;
                }
                if (taskItem.completed)
                {
                    this.props.card.taskStatistic.completed++;
                    this.props.card.taskStatistic.notCompleted--;
                }
                else
                {
                    this.props.card.taskStatistic.completed--;
                    this.props.card.taskStatistic.notCompleted++;
                }
                this._refreshProgressBar();
                break;
            }
            default: break;
        }
    };

    _refreshProgressBar()
    {
        let taskStatistic = this.props.card.taskStatistic;
        if (FunctionHelper.isUndefined(taskStatistic))
        {
            return;
        }
        let numberOfCompletedTasks = taskStatistic.completed;
        let numberOfTasks = taskStatistic.total;

        let progressText = (numberOfCompletedTasks > 0) ? {ratio: ''} : {ratio: ''};
        window.$(`.ui.cardProgress.progress.${this.props.card._id}`).progress({showActivity: false, value: numberOfCompletedTasks, total: numberOfTasks, label: 'ratio', text: progressText}); //eslint-disable-line
    }

    _handleCardFormModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let {card} = this.props;

        if (card.isExternal)
        {
            //TODO: metodo repetido com cardcontextmenu
            console.log('aaa');
            let url = null;
            if (card.cardIdConfig && card.externalId)
            {
                let externalId = card.externalId;
                let prefix = card.cardIdConfig.prefix || '';
                if (card.externalId.startsWith(prefix))
                {
                    prefix = '';

                }
                else
                {
                    externalId = FunctionHelper.pad(externalId, card.cardIdConfig.paddingSize, card.cardIdConfig.paddingChar);
                }
                //todo: REPETIDO EM KCARD a linha de baixo, centralizar
                url = (FunctionHelper.isDefined(card.cardIdConfig.urlTemplate)) ? card.cardIdConfig.urlTemplate.replace('[PREFIX]', prefix).replace('[ID]', externalId) : '';
            }
            else if (card.externalLink)
            {
                url = card.externalLink;
            }
            if (url)
            {
                var win = window.open(url, '_blank'); //eslint-disable-line
                win.focus();
            }
        }

        if (this.props.isReadOnly) {return;}
        let cloneCard = _.assign({}, card);
        UIActions.showCardFormModal.asFunction(card.board, cloneCard);
    };

    _handleCardCommentModalShow= (e) => //eslint-disable-line
    {
        if (e) {e.preventDefault();}
        if (this.props.isReadOnly) {return;}
        let {card} = this.props;
        UIActions.showCardCommentModal.asFunction(card);
    };

    _handleShowParentCardFormModal = (e) =>
    {
        if (e) {e.preventDefault();}
        if (this.props.isReadOnly) {return;}
        let parentCard = this.props.card.parent;
        let cloneCard = _.assign({}, parentCard);
        UIActions.showParentCardFormModal.asFunction(parentCard.board, cloneCard);
    }

    _renderTags(card)
    {
        if (FunctionHelper.isUndefined(card.tags))
        {
            return (<span />);
        }
        return (
            <div className="tag content" style={{wordWrap: 'break-word'}}>
                { card.tags.map(function(tag) { return (<span key={`tg_${tag.title}`} className="inline div">{tag.title}</span>); }) }
            </div>
        );
    }
    _renderExternaLink(card)
    {
        let {cardIdConfig, externalId, externalLink} = card;
        let isToShowExternalIdLink = FunctionHelper.isDefined(card.cardIdConfig) && FunctionHelper.isDefined(card.externalId);
        let labelExternalId = '';
        let url = '';
        let avatar = null;
        let title = '';
        let backgroundColor = 'black';
        let foreColor = 'white';
        if (isToShowExternalIdLink)
        {
            //TODO Criar uma classe entity que encapsula os algoritmos abaixo
            let prefix = cardIdConfig.prefix || '';
            externalId = FunctionHelper.pad(externalId, cardIdConfig.paddingSize, cardIdConfig.paddingChar);
            labelExternalId = prefix + externalId;
            url = (FunctionHelper.isDefined(cardIdConfig.urlTemplate)) ? cardIdConfig.urlTemplate.replace('[PREFIX]', prefix).replace('[ID]', externalId) : '';
            title = cardIdConfig.title;
            avatar = cardIdConfig.avatar || null;
            if (avatar)
            {
                backgroundColor = (avatar.backgroundColor) ? `rgba(${avatar.backgroundColor.r}, ${avatar.backgroundColor.g}, ${avatar.backgroundColor.b}, ${avatar.backgroundColor.a})` : backgroundColor;
                foreColor = (avatar.foreColor) ? `rgba(${avatar.foreColor.r}, ${avatar.foreColor.g}, ${avatar.foreColor.b}, ${avatar.foreColor.a})` : foreColor;
            }
            return (
                <div className="externalIdHeader" style={{width: '100%', maxHeight: '18px', lineHeight: 2.2, display: 'inline-flex', backgroundColor: backgroundColor}}>
                    <span style={{marginLeft: '5px'}}>
                        { FunctionHelper.isDefined(avatar) && <Avatar isToShowBackGroundColor avatar={avatar}/> }
                    </span>
                    <span style={{marginLeft: '5px', width: '100%'}}>
                        <a href={url} target="_blank" alt={title} style={{color: foreColor}}>{labelExternalId}</a>
                    </span>
                    <span tyle={{marginLeft: '5px'}}>
                        { FunctionHelper.isDefined(externalLink) && <a href={externalLink} target="_blank" style={{color: foreColor}}><i className="linkify icon"></i></a> }
                    </span>
                </div>
            );
        }
        return (<span/>);
    }

    _renderTaskBar()
    {
        let {card} = this.props;
        let taskStatistic = this.props.card.taskStatistic;
        if (FunctionHelper.isUndefined(taskStatistic))
        {
            return null;
        }
        let numberOfCompletedTasks = taskStatistic.completed;
        let numberOfTasks = taskStatistic.total;

        let className = `indicating cardProgress ${this.props.card._id}`;
        let percent = Math.round((numberOfCompletedTasks / numberOfTasks) * 100);
        let title = `${numberOfCompletedTasks} / ${numberOfTasks} (${percent}%). Clique para visualizar as tarefas`;
        return (
            <TaskPopup ref={c => { this.taskToopTip = c; return;}} card={card} isReadOnly={this.props.isReadOnly} visualStyle={this.props.visualStyle}>
                <Progress className={className} style={{cursor: 'pointer', height: '13px', marginBottom: '5px'}} title={title}>
                    <div className="bar" style={{height: '13px'}}>
                        <div className="progress" style={{height: '13px'}}>
                        </div>
                    </div>
                </Progress>
            </TaskPopup>
        );
    }

    _renderBottomColor(card) //eslint-disable-line
    {
        if (FunctionHelper.isDefined(card.project))
        {
            let backgroundColor = FunctionHelper.isDefined(card.project.avatar) && FunctionHelper.isDefined(card.project.avatar.backgroundColor) ? FunctionHelper.convertRgbaToString(card.project.avatar.backgroundColor) : 'transparent';
            return (
                <div style={{height: '5px', backgroundColor: backgroundColor}} title={card.project.title}>
                </div>
            );
        }
        return (<div style={{height: '5px', backgroundColor: 'transparent'}}></div>);
    }

    _renderComment(card)
    {
        if (!this._isToShow('cardComments') || FunctionHelper.isUndefined(card.numComments) || card.numComments === 0)
        {
            return null;
        }

        let cursor = (this.props.isReadOnly) ? 'default' : 'pointer';

        return (
            <div className="not padding item no-print" style={{cursor: cursor}}>
                <span style={{fontSize: '10px'}}>{card.numComments}</span><i title="Comentários" onClick={this._handleCardCommentModalShow} className="fa fa-comment" style={{color: 'black'}}></i>
            </div>
        );
    }

    _hasAvatar = (avatar) =>
    {
        return FunctionHelper.isDefined(avatar) && (FunctionHelper.isDefined(avatar.icon) || FunctionHelper.isDefined(avatar.letter) || FunctionHelper.isDefined(avatar.imageSrc));
    }

    _renderInformation(card)
    {
        const avatarFontSize = null;

        let metricTitle = FunctionHelper.isDefined(card.metric) ? card.metric.title : '';

        let activeImpediments = FunctionHelper.isDefined(card.impediments) ? _.filter(card.impediments, item =>FunctionHelper.isNullOrEmpty(item.endDate)) : null;

        let isToShowIconInfos = (FunctionHelper.isDefined(card.ratings) && card.ratings.length > 0) ||
                                 (FunctionHelper.isDefined(card.numComments) && card.numComments > 0) ||
                                 FunctionHelper.isDefined(card.classOfService) ||
                                 FunctionHelper.isDefined(card.itemType) ||
                                 FunctionHelper.isDefined(card.priority) ||
                                 FunctionHelper.isDefined(card.priorityNumberValue) ||
                                 FunctionHelper.isDefined(card.parent) ||
                                 FunctionHelper.isDefined(card.metricValue) ||
                                 FunctionHelper.isDefined(card.itemSize) ||
                                 FunctionHelper.isDefined(card.trackerIntegration) ||
                                 (FunctionHelper.isDefined(card.assignedMembers) && FunctionHelper.isArrayNotEmpty(card.assignedMembers)) ||
                                 (FunctionHelper.isArrayNotEmpty(activeImpediments)); //Impedimentos é verificado para deixar o tamanho do cartao compativel com o tamanho do adorno do impedimento
        if (!isToShowIconInfos)
        {
            return null;
        }
        const parentBoardTitle = FunctionHelper.isDefined(card.parent) && FunctionHelper.isDefined(card.parent.board) ? card.parent.board.title : '';
        return (
            <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px', width: '99%'}} >
                {this._renderComment(card)}
                {FunctionHelper.isDefined(card.ratings) && card.ratings.length > 0 &&
                    <RatingPopup card={card} isReadOnly={this.props.isReadOnly} visualStyle={this.props.visualStyle}>
                        <div className="not padding item iconInfo">
                            <Avatar isToShowBackGroundColor avatar={{icon: 'fa-star'}} style={{cursor: 'pointer', padding: '5px'}} />
                        </div>
                    </RatingPopup>
                }

                {FunctionHelper.isDefined(card.parent) &&
                    <div title={`Conectado ao cartão: ${card.parent.title} (Quadro: ${parentBoardTitle})`} className="not padding item" style={{cursor: 'pointer'}} onClick={this._handleShowParentCardFormModal}>
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{icon: 'fa-plug'}} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.trackerIntegration) && this._hasAvatar(card.trackerIntegration.avatar) &&
                    <div title={`Integração: ${card.trackerIntegration.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.trackerIntegration.avatar} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.classOfService) && this._hasAvatar(card.classOfService.avatar) &&
                    <div title={`Classe de serviço: ${card.classOfService.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.classOfService.avatar} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.itemType) && this._hasAvatar(card.itemType.avatar) &&
                    <div title={`Tipo de item: ${card.itemType.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.itemType.avatar} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.priority) && this._hasAvatar(card.priority.avatar) &&
                    <div title={`Prioridade: ${card.priority.title}`} className="not padding item iconInfo">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.priority.avatar} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.priorityNumberValue) &&
                    <div title={`Prioridade numérica: ${card.priorityNumberValue}`} className="not padding item iconInfo" style={{fontSize: '11px'}}>
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{letter: card.priorityNumberValue, borderRadius: 10, borderWidth: '1', borderColor: 'black'}} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {FunctionHelper.isDefined(card.metricValue) &&
                    <div title={`Métrica: ${card.metricValue}  ${metricTitle}`} className="not padding item iconInfo" style={{fontSize: '11px'}}>
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={{letter: card.metricValue, borderRadius: 10, borderWidth: '1', borderColor: 'brown'}} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}


                {FunctionHelper.isDefined(card.itemSize) && this._hasAvatar(card.itemSize.avatar) &&
                    <div title={`Tamanho: ${card.itemSize.title}`} className="not padding item">
                        <Avatar isToShowBackGroundColor isSquareImageDimension avatar={card.itemSize.avatar} style={{marginLeft: '2px', fontSize: avatarFontSize, width: '25px', padding: '0px'}} />
                    </div>}

                {this._isToShow('cardAssignedMember') && this._renderAssignedMembers(card)}
            </div>
        );
    }

    _renderImpediment(card)
    {
        if (FunctionHelper.isArrayNullOrEmpty(card.impediments))
        {
            return null;
        }
        let activeImpediments = _.filter(card.impediments, item =>FunctionHelper.isNullOrEmpty(item.endDate));
        if (FunctionHelper.isArrayNullOrEmpty(activeImpediments))
        {
            return null;
        }
        let firstImpediment = activeImpediments[0];
        let containAvatar = FunctionHelper.isDefined(firstImpediment.type) && FunctionHelper.isDefined(firstImpediment.type.avatar);
        let backgroundColor = containAvatar && FunctionHelper.isDefined(firstImpediment.type.avatar.backgroundColor) ? FunctionHelper.convertRgbaToString(firstImpediment.type.avatar.backgroundColor) : 'red';
        //TODO: CRIAR AVATAR ONDE PODE PASSAR O ESTILO PARA CADA TIPO DE VISUAL
        return (
            <ImpedimentPopup ref={c => { this.impedimentToopTip = c; return;}} parent={this} card={card} isReadOnly={this.props.isReadOnly} visualStyle={this.props.visualStyle}>
            {
                containAvatar && ((firstImpediment.type.avatar.icon) || (firstImpediment.type.avatar.imageSrc)) && <Avatar hostStyle={{cursor: 'pointer', borderColor: backgroundColor, fontSize: '12px', opacity: '0.8'}} hostClassName="ui corner red label k-card-blockIcon" avatar={firstImpediment.type.avatar}/>
            }
            {
                containAvatar && (!((firstImpediment.type.avatar.icon) || (firstImpediment.type.avatar.imageSrc))) && <Avatar hostStyle={{cursor: 'pointer', borderColor: backgroundColor, padding: '5px', width: '35px', opacity: '0.8'}} style={{fontSize: '17px'}} hostClassName="ui corner red label k-card-blockIcon" avatar={firstImpediment.type.avatar}/>
            }
            {activeImpediments.length > 1 && <div className="ui label impedimentMoreLabel">+</div>}
            </ImpedimentPopup>
         );
    }

    _getExecutionHintLabel = (card) =>
    {
        if (FunctionHelper.isDefined(card.endExecutionDate))
        {
            return {alt: 'completado', icon: '[C]'}; //todo: intercionalizar
        }
        if (FunctionHelper.isDefined(card.startExecutionDate))
        {
            return {alt: 'iniciado', icon: '[I]'}; //todo: intercionalizar
        }
        return {alt: '', icon: ''};
    }

    _renderDates(card)
    {
        let startPlanningDateStatus = CalendarLayoutHelper.getStatus(card.startPlanningDate, card.startExecutionDate);
        let endPlanningDateStatus = CalendarLayoutHelper.getStatus(card.endPlanningDate, card.endExecutionDate);
        let executionHintLabel = this._getExecutionHintLabel(card);
        if (FunctionHelper.isDefined(card.startPlanningDate) || FunctionHelper.isDefined(card.endPlanningDate))
        {
            return (
                <div className="planningDates">
                    <span title={executionHintLabel.alt} style={{fontSize: '10px', color: 'black'}}>{executionHintLabel.icon}</span>
                    {
                        FunctionHelper.isDefined(startPlanningDateStatus) &&
                            <span title={startPlanningDateStatus.message} className="ui not padding item label date" style={{backgroundColor: startPlanningDateStatus.color.backgroundColor, color: startPlanningDateStatus.color.color}}>{startPlanningDateStatus.planningMomentDate.format('DD/MMM')}<sup>I</sup></span>
                    }
                    {
                        FunctionHelper.isDefined(endPlanningDateStatus) &&
                            <span title={endPlanningDateStatus.message} className="ui not padding item label date" style={{backgroundColor: endPlanningDateStatus.color.backgroundColor, color: endPlanningDateStatus.color.color}}>{endPlanningDateStatus.planningMomentDate.format('DD/MMM')}<sup>T</sup></span>
                    }
                </div>
            );
        }
        return (<span/>);
    }

    _renderAssignedMembers(card)
    {
        let that = this;
        if (FunctionHelper.isUndefined(card.assignedMembers))
        {
            return null;
        }

        return (
            <Float className="k-display-inline right">
            {
                card.assignedMembers.map(function(member)
                {
                    if (FunctionHelper.isDefined(member.user))
                    {
                        return (<AssignedMember isReadOnly={that.props.isReadOnly} key={`aMember-${ member.user._id}-${card._id}`} card={that.props.card} member={member} visualStyle={that.props.visualStyle}/>);
                    }
                    return null;
                })
            }
            </Float>
        );
    }

    _isToShow = (visualEntityName) =>
    {
        let {visualStyle} = this.props;
        return BoardLayoutHelper.isToShow(visualStyle, visualEntityName);
    };

    _getCardStyle = () =>
    {
        const {card, agingExhibitionMode} = this.props;
        const boardAllConfig = BoardContextStore.getState().selectedBoardAllConfig;
        if (FunctionHelper.isUndefined(boardAllConfig))
        {
            return null;
        }
        const background = BoardLayoutHelper.getCardAgingBackground(boardAllConfig.agings, card, agingExhibitionMode);

        return {background: background};
    }

    render()
	{
        let {card, visualStyle} = this.props;
        if (FunctionHelper.isUndefined(card))
        {
            return null;
        }
        const cardStyle = this._getCardStyle();
        //TODO: melhorar
        let className = 'ui card kanbanCard';
        if (card.isExternal)
        {
            className += ' externalCard';
        }

        return (
            <div className={className} onDoubleClick={this._handleCardFormModalShow} style={this.props.hostStyle}>
                <div className="cardItem" style={cardStyle}>
                    {this._isToShow('cardExternalLink') && this._renderExternaLink(card)}
                    {this._isToShow('cardTaskBar') && this._renderTaskBar(card)}
                    {this._isToShow('cardTag') && this._renderTags(card)}
                    <Content>
                        {this._isToShow('cardImpediment') && this._renderImpediment(card)}
                        <Description style={{fontFamily: 'monospace', marginBottom: '2px'}}>
                            <EllipsisText className="content" text={card.title} length={100}/>
                        </Description>
                    </Content>
                    {this._isToShow('cardDates') && this._renderDates(card)}
                    {this._isToShow('cardInformation') && this._renderInformation(card)}
                    {this._isToShow('cardBottomColor') && this._renderBottomColor(card)}
                </div>
                {(FunctionHelper.isUndefined(visualStyle) || visualStyle.type !== 'template') && <CustomFieldPopup ref={c => { this.customFieldToopTip = c; return;}} card={card} isReadOnly={false}/>}
            </div>
        );
    }
}
