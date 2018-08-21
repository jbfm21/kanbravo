'use strict';
import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {Icon, Header} from 'react-semantify';
import moment from 'moment';

import * as airflux from 'airflux';
import {KanbanActions} from '../../../../actions';
import {BoardLayoutHelper, FunctionHelper, TimesheetHelper} from '../../../../commons';
import {ImmutableState} from '../../../../decorators';
import {Description, Avatar, ToolTip, LoadServerContent, DateTimeInput, DateInput, MinutesInput, FormToast} from '../../../../components';

import {default as TimeSheetStore} from './TimeSheetStore';

//TODO: ao colocar data invalida, a mensagem é exibida duas vezes, por conta do store existente no formulario de edicao tambem

const StateRecord = Immutable.Record({isPopupActive: false, isLoading: false, isAssignedMembersHover: false, timeSheetToShow: null, changedData: null, actionMessage: ''});

const messages = defineMessages(
{
    loading: {id: 'tooltip.assignmember.loading', description: '', defaultMessage: 'Aguarde. Carregando....'},
    automaticTimeSheetLabel: {id: 'tooltip.assignmember.automaticTimeSheet.label', description: 'TimeSheet timesheetTab label', defaultMessage: 'Timesheet automático'},
    startDateLabel: {id: 'tooltip.assignmember.startDate.label', description: 'TimeSheet startDate label', defaultMessage: 'Data'},
    startLabel: {id: 'tooltip.assignmember.start.label', description: 'TimeSheet startDate label', defaultMessage: 'Início'},
    endLabel: {id: 'tooltip.assignmember..end.label', description: 'TimeSheet startDate label', defaultMessage: 'Fim'},
    automaticHoursLabel: {id: 'tooltip.assignmember..automaticHours.label', description: 'TimeSheet hours label', defaultMessage: 'Horas'},
    hoursLabel: {id: 'tooltip.assignmember.hours.label', description: 'TimeSheet hours label', defaultMessage: 'Horas corrigidas'},
    tipLabel: {id: 'tooltip.assignmember.tip.label', description: 'Tip label', defaultMessage: '( dica: controle as horas clicando no avatar )'},
    effortHeader: {id: 'tooltip.assignmember.effortHeader.label', description: 'Tip label', defaultMessage: 'Esforço - '},
    totalEffortHeader: {id: 'tooltip.assignmember.effortHeader.label', description: 'Tip label', defaultMessage: 'Total de esforço: '},
    totalWorkedDays: {id: 'tooltip.assignmember.totalWorkedDays.label', description: 'Tip label', defaultMessage: 'Total de dias trabalhados: '},
    insertValidDateTimeError: {id: 'tooltip.assignmember.insertValidDateTimeError.label', description: 'insertValidDateTimeError label', defaultMessage: 'Preencha a data e hora corretamente'}

});

@ImmutableState
@airflux.FluxComponent
export default class AssignedMember extends React.Component
{

    static displayName = 'AssignedMember';

    static propTypes = {
        card: React.PropTypes.object.isRequired,
        member: React.PropTypes.object.isRequired,
        visualStyle: React.PropTypes.object,
        isReadOnly: React.PropTypes.bool,
        intl: intlShape.isRequired
    };

    static defaultProps =
    {
        visualStyle: BoardLayoutHelper.defaultVisualStyle(),
        isReadOnly: false
    }

    constructor(props)
    {
        super(props);
        this.listenTo(TimeSheetStore, this._listenToWorkOnTimeSheetStore);
        this.state = {data: new StateRecord({isPopupActive: false})};
    }

    componentWillUnmount()
    {
        if (FunctionHelper.isDefined(this.unsubscribe))
        {
            this.unsubscribe();
        }
    }

    _handleSetUserWorkOnCard = (e) =>
    {
        e.preventDefault();
        if (this.props.isReadOnly) {return;}
        KanbanActions.card.userWorkOnCard.asFunction(this.props.card, this.props.member.user);
    }

    _handleSetUserNotWorkOnCard = (e) =>
    {
        e.preventDefault();
        if (this.props.isReadOnly) {return;}
        KanbanActions.card.userNotWorkOnCard.asFunction(this.props.card, this.props.member.user);
    }

    _listenToWorkOnTimeSheetStore = (store) =>
    {
        //TODO: retirar esse listener daqui, pois vai chamar para todos os avatares exisentes no quadro

        switch (store.actionState)
        {
            case KanbanActions.card.userNotWorkOnCard.completed:
            {
                const {user, cardId, timeSheetItems} = store.state;
                const {timeSheetToShow} = this.state.data;
                if (user._id === this.props.member.user._id)
                {
                    //atualiza o identificador de versão de bd em todos os objetos usuários associados aos cartões, do usuário alterado
                    //isso serve para bloquar concorrencia
                    //TODO: Ver qual melhor forma de fazer isso
                    this.props.member.user.nonce = user.nonce;
                }
                if (timeSheetItems.length === 0)
                {
                    return;
                }
                if (user._id === this.props.member.user._id && (cardId === this.props.card._id && FunctionHelper.isDefined(timeSheetToShow)))
                {
                    //TODO: Ver qual melhor forma de fazer isso
                    this.props.member.user.workOnCard = null;
                    let newTimeSheetToShow = timeSheetItems.concat(timeSheetToShow);
                    this.setImmutableState({timeSheetToShow: newTimeSheetToShow, isLoading: false, actionMessage: ''});
                    this.tooltip.forceReRender();
                    this.forceUpdate();
                }
                break;
            }

            case KanbanActions.card.userWorkOnCard.completed:
            {
                const {user, cardId, workOnCard} = store.state;
                if (user._id === this.props.member.user._id)
                {
                    //atualiza o identificador de versão de bd em todos os objetos usuários associados aos cartões, do usuário alterado
                    //isso serve para bloquar concorrencia
                    //TODO: Ver qual melhor forma de fazer isso
                    this.props.member.user.nonce = user.nonce;
                    if (cardId === this.props.card._id)
                    {
                        //coloca workon no cartão associados
                        this.props.member.user.workOnCard = workOnCard;
                        this.tooltip.forceReRender();
                        this.forceUpdate();
                    }
                    else if (this.props.member.user.workOnCard && this.props.member.user.workOnCard.card !== cardId)
                    {
                        //Retira o workon dos outros cartões
                        this.props.member.user.workOnCard = null;
                        this.forceUpdate();
                    }
                }
                break;
            }

            case KanbanActions.card.userNotWorkOnCard.failed:
            {
                if (this.tooltip)
                {
                    this.setImmutableState({isLoading: false, actionMessage: ''});
                    this.tooltip.forceReRender();
                }
                break;
            }

            default: break;
        }

    }

    _listenToTooltipTimeSheetStore = (store) =>
    {
        //TODO: retirar esse listener daqui, pois vai chamar para todos os avatares exisentes no quadro

        switch (store.actionState)
        {
            case KanbanActions.cardSetting.timesheet.listUserCardTimeSheet.completed:
            {
                const {userId, cardId} = store.state;
                if (userId === this.props.member.user._id && cardId === this.props.card._id && this.state.data.isAssignedMembersHover)
                {
                    this.setImmutableState({isPopupActive: true, timeSheetToShow: store.state.timeSheet, isLoading: false, actionMessage: ''});
                    this.forceUpdate();
                }
                break;
            }
            case KanbanActions.tooltip.addTimesheet.completed:
            {
                const {timeSheetItem} = store.state;
                const {timeSheetToShow} = this.state.data;
                if (timeSheetItem.user === this.props.member.user._id && timeSheetItem.card === this.props.card._id && FunctionHelper.isDefined(timeSheetToShow))
                {
                    let newTimeSheetToShow = [timeSheetItem].concat(timeSheetToShow);
                    this.setImmutableState({timeSheetToShow: newTimeSheetToShow, isLoading: false, actionMessage: ''});
                    this.tooltip.forceReRender();
                }
                break;
            }

            case KanbanActions.tooltip.updateTimesheet.completed:
            {
                const {timeSheetItem} = store.state;
                const {timeSheetToShow} = this.state.data;
                if (timeSheetItem.user === this.props.member.user._id && timeSheetItem.card === this.props.card._id && FunctionHelper.isDefined(timeSheetToShow))
                {
                    let match = _.find(timeSheetToShow, {_id: timeSheetItem._id});
                    if (match)
                    {
                        _.merge(match, timeSheetItem);
                        this.setImmutableState({timeSheetToShow: timeSheetToShow, isLoading: false, actionMessage: ''});
                        this.tooltip.forceReRender();
                    }
                }
                break;
            }

            case KanbanActions.cardSetting.timesheet.delete.completed:
            {
                //TODO: otimizar para verificar antes se pertence ao membro para nao ter que varrer todos
                const {timesheetItemId} = store.state;
                const {timeSheetToShow} = this.state.data;
                let match = _.find(timeSheetToShow, {_id: timesheetItemId});
                if (match)
                {
                    _.remove(timeSheetToShow, {_id: timesheetItemId});
                    this.setImmutableState({timeSheetToShow: timeSheetToShow, isLoading: false, actionMessage: ''});
                    break;
                }
                break;
            }

            case KanbanActions.cardSetting.timesheet.listUserCardTimeSheet.failed:
            case KanbanActions.tooltip.addTimesheet.failed:
            case KanbanActions.tooltip.updateTimesheet.failed:
            case KanbanActions.cardSetting.timesheet.delete.failed:
                this.setImmutableState({isLoading: false});
                break;
            default: break;
        }

    }

    _handleShowTooltip = () =>
    {
        this.tooltipTimer = setTimeout(() =>
        {
            if (this.props.isReadOnly) {return;}
            this.setImmutableState({isAssignedMembersHover: true, isPopupActive: true, actionMessage: ''});
            if (FunctionHelper.isUndefined(this.unsubscribe))
            {
                this.unsubscribe = TimeSheetStore.listen(this._listenToTooltipTimeSheetStore);
            }
            KanbanActions.cardSetting.timesheet.listUserCardTimeSheet.asFunction(this.props.card, this.props.member.user._id);
        }, 700);

    }

    _handleMouseLeaveTooltip = () =>
    {
        if (this.tooltipTimer)
        {
            clearTimeout(this.tooltipTimer);
        }
    }

    _handleHideTooltip = () =>
    {
        if (this.props.isReadOnly) {return;}

        this.setImmutableState({isAssignedMembersHover: false, isPopupActive: false, actionMessage: null, isLoading: false});
        if (FunctionHelper.isDefined(this.unsubscribe))
        {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.setImmutableState({isAssignedMembersHover: false, isPopupActive: false, actionMessage: ''});
    }

    _handleChangeData = (item, newData) =>
    {
       if (this.props.isReadOnly) {return;}
       const itemToUpdate = FunctionHelper.cloneAndAssign(item, newData);
       this.setImmutableState({isLoading: true, actionMessage: ''});
       KanbanActions.tooltip.updateTimesheet.asFunction(itemToUpdate);
    }

    _addNewTimeSheetData = (e) =>
    {
       //TODO: centralizar esse tipo de conversao pois pode ser necessario
       e.preventDefault();
       if (this.props.isReadOnly) {return;}
       const {card, member} = this.props;
       const {formatMessage} = this.props.intl;
       if (FunctionHelper.isNullOrEmpty(this.newTimeSheetStartDate.value) || FunctionHelper.isNullOrEmpty(this.newTimeSheetMinutes.value))
       {
           this.setImmutableState({actionMessage: formatMessage(messages.insertValidDateTimeError)});
           if (this.tooltip)
           {
                this.tooltip.forceReRender();
           }
           return;
       }

       const timeSheetData = TimesheetHelper.generateTimeSheetData(member, this.newTimeSheetStartDate.value, this.newTimeSheetMinutes.value);
       this.setImmutableState({isLoading: true, actionMessage: ''});
       KanbanActions.tooltip.addTimesheet.asFunction(card, timeSheetData);
    }

    _getTotalOfMinutes = (timeSheet) =>
    {
        return _.reduce(timeSheet, function(sum, value)
        {
            return sum + Number(value.minutes);
        }, 0);
    }

    _getTotalOfWorkingDays = (timeSheet) =>
    {
        return _.uniqBy(timeSheet, value =>
        {
            return moment(value.startDate).format('DD/MM/YYYY');
        }).length;
    }

    render()
	{
        const that = this;
        const {card, member} = this.props;
        if (FunctionHelper.isUndefined(member.user))
        {
            return null;
        }
        const {isLoading, actionMessage} = this.state.data;
        /*if (isLoading)
        {
            return (
                <div style={{whiteSpace: 'pre'}}>
                    <FormattedMessage {...messages.loading}/>
                </div>
            );
        }*/

        let toolTipStyle = {
            style: {background: 'rgba(255,255,255,1)', padding: '0px', marginTop: '30px', marginBottom: '0px', boxShadow: '5px 5px 3px rgba(0,0,0,.5)'},
            arrowStyle: {color: 'rgba(0,0,0,.8)', borderColor: false}
        };
        const timeSheetToShow = this.state.data.timeSheetToShow;
        const isUserWorkedOn = FunctionHelper.isDefined(member.user.workOnCard) && member.user.workOnCard.card === card._id;
        const workedOn = member.user.workOnCard;
        const enableInteraction = BoardLayoutHelper.isToShow(this.props.visualStyle, 'assignMemberToolTip') && !this.props.isReadOnly;

        const functionToCall = enableInteraction ? (isUserWorkedOn ? this._handleSetUserNotWorkOnCard : this._handleSetUserWorkOnCard) : () => false; //eslint-disable-line
        const opacity = (isUserWorkedOn) ? 1 : 0.3;
        const tooltipId = `tp-card-effort-${ member.user._id}-${card._id}`;
        const isToShowClockTracker = FunctionHelper.isDefined(workedOn) && isUserWorkedOn && FunctionHelper.isDefined(workedOn.startDateTime);
        member.user.avatar.name = `${member.user.givenname} ${member.user.surname}`;

        const totalOfMinutes = this._getTotalOfMinutes(timeSheetToShow);
        const totalOfWorkingDays = this._getTotalOfWorkingDays(timeSheetToShow);
        const hostStyleCursor = enableInteraction ? 'pointer' : 'default';

        return (
            <div onMouseEnter={this._handleShowTooltip} onMouseLeave={this._handleMouseLeaveTooltip} id={tooltipId} style={{display: 'inline-block'}}>
                <LoadServerContent isLoading={isLoading}/>
                <Avatar onClick={functionToCall} isToShowBackGroundColor hostStyle={{cursor: hostStyleCursor, opacity: opacity, width: null, height: '28px', display: 'inline-block', border: '1px solid black', padding: '3px', marginRight: '2px', marginTop: '2px', float: 'right', borderRadius: '3px'}} key={member._id} title={`${member.user.avatar.name}`} style={{width: '18px', height: '18px', display: 'inline-block', fontSize: '12px'}} avatar={member.user.avatar} />
                {
                    enableInteraction &&
                        <ToolTip onToolTipMouseLeave={this._handleHideTooltip} ref={(ref) => {this.tooltip = ref; return;}} group={'cardToolTip'} style={toolTipStyle} tooltipTimeout={200} active={this.state.data.isPopupActive} position="bottom" parent={`#${tooltipId}`}>
                            <Header onClick={this._handleHideTooltip} className="k-background" style={{padding: '0px', borderBottom: '1px solid black', marginBottom: '0px'}}>
                                <div className="content">
                                    <span style={{marginLeft: '3px', color: 'white', fontSize: '16px'}}>
                                        <span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.effortHeader}/>{member.user.avatar.name}</span>
                                    </span>
                                </div>
                                <Icon className="close ui top right attached label" style={{marginRight: '5px', color: 'white', fontSize: '16px', background: 'transparent', padding: '0px'}}/>
                            </Header>
                            <Description style={{marginLeft: '5px'}}>
                                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                                <div style={{display: 'block', height: '300px', overflowY: 'scroll', overflowX: 'hidden', fontSize: '12px'}}>
                                    <table className="ui celled compact structured table" >
                                    <thead>
                                        <tr>
                                            <th colSpan="6" style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.totalEffortHeader} /> {FunctionHelper.formatMinutesToHourAndMinutes(totalOfMinutes)} | <FormattedMessage {...messages.totalWorkedDays}/>: {totalOfWorkingDays} </th>
                                        </tr>
                                        <tr>
                                            <th rowSpan="2" style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.startDateLabel}/></th>
                                            <th rowSpan="2" style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.automaticHoursLabel}/></th>
                                            <th colSpan="4" style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.automaticTimeSheetLabel}/></th>
                                        </tr>
                                        <tr>
                                            <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.startLabel}/></th>
                                            <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.endLabel}/></th>
                                            <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.automaticHoursLabel}/></th>
                                            <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.hoursLabel}/></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr key={`tp-card-start_new-${member.user._id}-${card._id}`} style={{color: 'black', textAlign: 'center', backgroundColor: '#ebeed3'}}>
                                            <td style={{padding: '3px 3px 3px 3px'}}>
                                               <input name="newTimeSheetStartDate" type="datetime-local" defaultValue={''} ref={(ref) => {this.newTimeSheetStartDate = ref; return;}} style={{border: '1px solid black', textAlign: 'center', margin: '0px', padding: '0px', maxWidth: '135px', fontSize: '10px'}}/>
                                            </td>
                                            <td style={{padding: '3px 3px 3px 3px'}}>
                                               <input name="newTimeSheetMinutes" type="time" defaultValue={''} ref={(ref) => {this.newTimeSheetMinutes = ref; return;}} style={{border: '1px solid black', textAlign: 'center', margin: '0px', padding: '0px', fontSize: '10px'}} />
                                            </td>
                                            <td colSpan="4" style={{textAlign: 'left', padding: '3px 3px 3px 3px'}}>
                                               <Icon onClick={that._addNewTimeSheetData} className="circular inverted blue add" style={{cursor: 'pointer', marginLeft: '2px'}}/>
                                               <span style={{marginLeft: '5px', fontSize: '10px', fontColor: 'gray'}}> <FormattedMessage {...messages.tipLabel}/></span>
                                            </td>
                                        </tr>

                                        {
                                            isToShowClockTracker &&
                                                <tr key={`tp-card-start_${card._id}-${member.user._id}-${card._id}_won`} style={{color: 'red', textAlign: 'center'}}>
                                                    <td></td>
                                                    <td><Icon className="wait"/></td>
                                                    <td>{moment(workedOn.startDateTime).format('DD/MM/YYYY HH:mm')}</td>
                                                    <td style={{opacity: 0.4}}>{moment(Date.now()).format('DD/MM/YYYY HH:mm')}</td>
                                                    <td>{FunctionHelper.isDefined(workedOn) && FunctionHelper.formatIntervalToDayHourAndMinutes(workedOn.startDateTime, moment().toDate())}</td>
                                                    <td>--:--</td>
                                                </tr>
                                        }
                                        {
                                            timeSheetToShow && timeSheetToShow.map((item, index) =>
                                            {
                                                return (
                                                    <tr key={`tp-card-start_${card._id}-${ member.user._id}-${card._id}-${index}`}>
                                                        <td style={{padding: '3px 3px 3px 3px'}}><DateInput value={item.startDate} change={this._handleChangeData.bind(that, item)} propName="startDate" classLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                                                        <td style={{padding: '3px 3px 3px 3px'}}><MinutesInput value={item.minutes} change={this._handleChangeData.bind(that, item)} propName="minutes" classLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                                                        <td style={{padding: '3px 3px 3px 3px'}}><DateTimeInput lessOrEqualThan={item.trackerEndDate} value={item.trackerStartDate} change={this._handleChangeData.bind(that, item)} propName="trackerStartDate" classLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                                                        <td style={{padding: '3px 3px 3px 3px'}}><DateTimeInput requireBeforeValue greaterOrEqualThan={item.trackerStartDate} value={item.trackerEndDate} change={this._handleChangeData.bind(that, item)} propName="trackerEndDate" classLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                                                        <td style={{padding: '3px 3px 3px 3px'}}>{FunctionHelper.formatIntervalToDayHourAndMinutes(item.trackerStartDate, FunctionHelper.dateOrNow(item.trackerEndDate))}</td>
                                                        <td style={{padding: '3px 3px 3px 3px'}}><MinutesInput value={item.trackerMinutes} change={this._handleChangeData.bind(that, item)} propName="trackerMinutes" classLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                                                    </tr>);
                                            })
                                        }
                                    </tbody>
                                    </table>
                                </div>
                            </Description>
                        </ToolTip>
                }
            </div>
        );
    }
}

module.exports = injectIntl(AssignedMember);
