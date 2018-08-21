'use strict';
//TODO: BUG nao ta exibindo no domingo

import BigCalendar from 'react-big-calendar';
import moment from 'moment';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';
import Immutable from 'immutable';
import classNames from 'classnames';
import {List, Item, Icon, Label, Checkbox, Button} from 'react-semantify';
import {KanbanActions} from '../../../actions';
import {BoardCalendarStore} from '../../../stores';
import {LoadServerContent} from '../../../components';
import {FunctionHelper, CalendarLayoutHelper} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {default as EventComponent} from './EventComponent.jsx';
import {EventType, CardStatus} from '../../../enums';


const StateRecord = Immutable.Record({board: null, isLoading: false, actionMessage: null, calendarEvents: null, selectedCalendarView: 'month', startDate: new Date(),
    showStartPlanningDate: true, showEndPlanningDate: true, showStartExecutionDate: true, showEndExecutionDate: true, showReminder: true, showTimesheet: true,
    showBacklog: false, showArchived: false, showInboard: true, showCanceled: false, showDeleted: false,
    lastRefreshBoardInformation: null});

const calendarMessages =
{
  allDay: 'dia inteiro',
  previous: 'anterior',
  next: 'próximo',
  today: 'hoje',
  month: 'mês',
  week: 'semana',
  day: 'dia',
  agenda: 'agenda',
  showMore: total => `+${total} mais`
};

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
export default class BoardCalendarPage extends React.Component
{
    static displayName = 'BoardCalendarPage';

    static propTypes =
    {
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardCalendarStore, this._listenToBoardCalendarStoreChange);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
	{
        if (!this.state.data.board)
		{
            this.setImmutableState({isLoading: true, actionMessage: null, board: null});
			KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, this.state.data.selectedCalendarView, this.state.data.startDate);
        }
    }

    componentDidMount()
    {
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.params.boardId !== nextProps.params.boardId)
        {
            KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, this.state.data.selectedCalendarView, this.state.data.startDate);
        }
    }

    shouldComponentUpdate(nextProps, nextState) //<eslint-disable-line></eslint-disable-line>
    {
        if (this.state.isLoading === false && nextState.isLoading === true)
        {
            return false;
        }
        return true;
    }

	componentWillUnmount()
	{
		this.ignoreLastFetch = true;
        this.setImmutableState({isLoading: false, actionMessage: null, board: null});
	}

    _fixCalendarEvents = (events) =>
    {
        const that = this;
        //TODO:Esse codigo foi colocado pois o calendar espera que a hora esteja no timezone local o que nao é verdade na hora do timesheet (2016-08-01 00:00:00).
        //TODO:para bypassar é acrescentada 3 horas no horário que seria a diferenca. Corrigir para nao depender dessa soma.
        //TODO:no caso do executionDate e planning date esta sendo salvo as horas com timezone (3 horas a mais), corrigir isso tambem para uniformizar salvando 00:00:00
        _.forEach(events, (event) =>
        {
           switch (event.type)
           {
                case EventType.startPlanningDate.name:
                {
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.endDate).add(3, 'hour').toDate();
                    event.executionDate = (event.executionDate) ? moment(event.executionDate).add(3, 'hour').toDate() : null;
                    event.status = CalendarLayoutHelper.getStatus(event.startDate, event.executionDate);
                    event.style = FunctionHelper.isDefined(event.status) ? {backgroundColor: event.status.color.backgroundColor, color: event.status.color.color, opacity: that._getEventOpacity(event)} : {opacity: that._getEventOpacity(event)};
                    break;
                }
                case EventType.endPlanningDate.name:
                {
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.endDate).add(3, 'hour').toDate();
                    event.executionDate = (event.executionDate) ? moment(event.executionDate).add(3, 'hour').toDate() : null;
                    event.status = CalendarLayoutHelper.getStatus(event.startDate, event.executionDate);
                    event.style = FunctionHelper.isDefined(event.status) ? {backgroundColor: event.status.color.backgroundColor, color: event.status.color.color, opacity: that._getEventOpacity(event)} : {opacity: that._getEventOpacity(event)};
                    break;
                }
                case EventType.startExecutionDate.name:
                {
                    event.planningDate = (event.planningDate) ? moment(event.planningDate).add(3, 'hour').toDate() : null;
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.endDate).add(3, 'hour').toDate();
                    event.status = CalendarLayoutHelper.getStatus(event.planningDate, event.startDate);
                    event.style = FunctionHelper.isDefined(event.status) ? {backgroundColor: event.status.color.backgroundColor, color: event.status.color.color, opacity: that._getEventOpacity(event)} : {opacity: that._getEventOpacity(event)};
                    break;
                }
                case EventType.endExecutionDate.name:
                {
                    event.planningDate = (event.planningDate) ? moment(event.planningDate).add(3, 'hour').toDate() : null;
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.endDate).add(3, 'hour').toDate();
                    event.status = CalendarLayoutHelper.getStatus(event.planningDate, event.startDate);
                    event.style = FunctionHelper.isDefined(event.status) ? {backgroundColor: event.status.color.backgroundColor, color: event.status.color.color, opacity: that._getEventOpacity(event)} : {opacity: that._getEventOpacity(event)};
                    break;
                }
                case EventType.reminder.name:
                {
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.startDate).add(3, 'hour').toDate();
                    let reminderStatusText = (event.completed) ? '[Completado] ' : '';
                    event.status = {message: `${reminderStatusText}${event.title} - Cartão: ${event.card.title}`};
                    event.style = {opacity: that._getEventOpacity(event)};
                    break;
                }
                case EventType.timesheet.name:
                {
                    event.startDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.endDate = moment(event.startDate).add(3, 'hour').toDate();
                    event.style = {backgroundColor: '#8f3e97'};
                    event.status = {message: `${event.user.givenname} ${event.user.surname} trabalhou [${FunctionHelper.formatMinutesToHourAndMinutes(event.minutes)}] hrs em [${event.card.title}]`};
                    event.style = {opacity: that._getEventOpacity(event)};
                    break;
                }
                default: break;
           }
           return event;
        });
        console.log(events);
        return events;
    }
    _listenToBoardCalendarStoreChange = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.boardActions.getCalendar.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case KanbanActions.boardActions.getCalendar.completed:
            {
                let calendarEvents = this._fixCalendarEvents(store.state.calendarEvents);
                this.setImmutableState({isLoading: false, board: store.state.board, calendarEvents: calendarEvents, lastRefreshBoardInformation: moment()});
                break;
            }
            case KanbanActions.board.list.failed:
                this.setImmutableState({isLoading: false, board: null, calendarEvents: null});
                break;

            case KanbanActions.card.update.completed:
                //TODO: otimizar para nao precisar carregar todo o calendario novamente, lembrando que a api recebe eventos e não cartão.
                //Verificar como atualizar os cartões associados aos eventos, sem precisar reexecutar a api.
                KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, this.state.data.selectedCalendarView, this.state.data.startDate);
                break;

            case KanbanActions.card.update.failed:
                this.setImmutableState({isLoading: false});
                break;

            default: break;
        }
    };

    _handleRefreshBoardInfo = () =>
    {
       KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, this.state.data.selectedCalendarView, this.state.data.startDate);
    }

    _handleOnNavigate = (startDate, viewMode) =>
    {
        this.setImmutableState({selectedCalendarView: viewMode, startDate: startDate});
        KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, viewMode, startDate);
    }

    _handleOnView = (selectedView) =>
    {
        this.setImmutableState({selectedCalendarView: selectedView});
        KanbanActions.boardActions.getCalendar.asFunction(this.props.params.boardId, selectedView, this.state.data.startDate);
    }

    _renderTitle = (event) =>
    {
        return (FunctionHelper.isDefined(event.status)) ? event.status.message : event.title;
    }

    _getEventClassName = (event, start, end, isSelected) => //eslint-disable-line
    {
        return {className: '', style: event.style};
    }

    _getEventOpacity = (event) =>
    {
        switch (event.card.status)
        {
            case CardStatus.backlog.name: return (0.5);
            case CardStatus.inboard.name: return (1);
            case CardStatus.deleted.name: return (0.2);
            case CardStatus.archived.name: return (0.5);
            case CardStatus.canceled.name: return (0.2);
            default: return (null);
        }
    }

    _getFilteredCalendarEvents = () =>
    {
        const events = this.state.data.calendarEvents;
        const {showStartPlanningDate, showEndPlanningDate, showStartExecutionDate, showEndExecutionDate, showReminder, showTimesheet, showBacklog, showInboard, showArchived, showCanceled, showDeleted} = this.state.data;
        let filteredEvents = _.filter(events, (event) =>
        {
            let isToShowByEventType = false;
            let isToShowByCardStatus = false;
            switch (event.type)
            {
                case EventType.startPlanningDate.name: isToShowByEventType = showStartPlanningDate; break;
                case EventType.endPlanningDate.name: isToShowByEventType = showEndPlanningDate; break;
                case EventType.startExecutionDate.name: isToShowByEventType = showStartExecutionDate; break;
                case EventType.endExecutionDate.name: isToShowByEventType = showEndExecutionDate; break;
                case EventType.reminder.name: isToShowByEventType = showReminder; break;
                case EventType.timesheet.name: isToShowByEventType = showTimesheet; break;
                default: isToShowByEventType = false; break;
            }

            switch (event.card.status)
            {
                case CardStatus.backlog.name: isToShowByCardStatus = showBacklog; break;
                case CardStatus.inboard.name: isToShowByCardStatus = showInboard; break;
                case CardStatus.archived.name: isToShowByCardStatus = showArchived; break;
                case CardStatus.canceled.name: isToShowByCardStatus = showCanceled; break;
                case CardStatus.deleted.name: isToShowByCardStatus = showDeleted; break;
                default: isToShowByCardStatus = false; break;
            }

            return isToShowByCardStatus && isToShowByEventType;
        });
        console.log(events, filteredEvents);
        return filteredEvents;
    }

    //TODO: Verificar se o quadro é nulo, em caso de erro. caso tenha retornado erro, mostrar mensagem amigavel //eslint-disable-line no-warning-comments
    render()
	{
        let {actionMessage, isLoading, board, calendarEvents, selectedCalendarView, lastRefreshBoardInformation} = this.state.data;
        let validBoard = FunctionHelper.isDefined(board) && FunctionHelper.isDefined(calendarEvents);
        if (!validBoard)
        {
            return null;
        }
        let filteredCalendarEvents = this._getFilteredCalendarEvents();
        return (
            <div style={{marginTop: '10px'}}>
                {FunctionHelper.isDefined(lastRefreshBoardInformation) && <div style={{marginLeft: '5px', color: 'white', fontSize: '10px'}}>Última atualização: {lastRefreshBoardInformation.format('DD/MM/YYYY HH:mm')} - Em breve, atualização automática...</div> }
                <List className="horizontal divided" style={{padding: '0px', display: 'inline-flex', width: '100%', backgroundColor: '#ddd'}}>
                    <Item style={{marginLeft: '5px'}}><Button className="icon" style={{marginLeft: '5px', padding: '0px', color: 'black', fontWeight: 'bold'}} onClick={this._handleRefreshBoardInfo} alt="Refresh no quadro"><Icon className='refresh'/></Button></Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Label className="mini empty circular" style={{whiteSpace: 'no-wrap', backgroundColor: 'green', width: '10px'}}/><span style={{marginLeft: '3px', lineHeight: '1.3'}}>No Prazo</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Label className="mini empty circular" style={{whiteSpace: 'no-wrap', backgroundColor: 'red', width: '10px'}}/><span style={{marginLeft: '3px', lineHeight: '1.3'}}>Atrasado</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showStartPlanningDate: !this.state.data.showStartPlanningDate});}}} className={classNames({'ui tiny': true, checked: this.state.data.showStartPlanningDate})}>
                            <input type="checkbox" defaultChecked={this.state.data.showStartPlanningDate} />
                        </Checkbox>
                        <Label className="mini" style={{whiteSpace: 'no-wrap', fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>IP</Label><span style={{marginLeft: '3px'}}>Início Planejado</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showEndPlanningDate: !this.state.data.showEndPlanningDate});}}} className={classNames({'ui tiny': true, checked: this.state.data.showEndPlanningDate})}>
                            <input type="checkbox" defaultChecked={this.state.data.showEndPlanningDate} />
                        </Checkbox>
                        <Label className="mini" style={{whiteSpace: 'no-wrap', fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>TP</Label><span style={{marginLeft: '3px'}}>Término Planejado</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showStartExecutionDate: !this.state.data.showStartExecutionDate});}}} className={classNames({'ui tiny': true, checked: this.state.data.showStartExecutionDate})}>
                            <input type="checkbox" defaultChecked={this.state.data.showStartExecutionDate} />
                        </Checkbox>
                        <Label className="mini brown" style={{whiteSpace: 'no-wrap', fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>IR</Label><span style={{marginLeft: '3px'}}>Início Real</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showEndExecutionDate: !this.state.data.showEndExecutionDate});}}} className={classNames({'ui tiny': true, checked: this.state.data.showEndExecutionDate})}>
                            <input type="checkbox" defaultChecked={this.state.data.showEndExecutionDate} />
                        </Checkbox>
                        <Label className="mini brown" style={{whiteSpace: 'no-wrap', fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>TR</Label><span style={{marginLeft: '3px'}}>Término Real</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showReminder: !this.state.data.showReminder});}}} className={classNames({'ui tiny': true, checked: this.state.data.showReminder})}>
                            <input type="checkbox" defaultChecked={this.state.data.showReminder} />
                        </Checkbox>
                        <Label className="mini circular" style={{whiteSpace: 'no-wrap', backgroundColor: '#3174ad', width: '10px'}}><Icon className={'alarm'} style={{color: 'white'}}/></Label><span style={{marginLeft: '3px'}}>Lembrete</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showTimesheet: !this.state.data.showTimesheet});}}} className={classNames({'ui tiny': true, checked: this.state.data.showTimesheet})}>
                            <input type="checkbox" defaultChecked={this.state.data.showTimesheet} />
                        </Checkbox>
                        <Label className="mini empty circular" style={{whiteSpace: 'no-wrap', backgroundColor: 'rgb(143, 62, 151)', width: '10px'}}/><span style={{marginLeft: '3px', lineHeight: '1.3'}}>TimeSheet</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <span style={{marginLeft: '3px', lineHeight: '1.3'}}>Cartão (no): </span>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showInboard: !this.state.data.showInboard});}}} className={classNames({'ui tiny': true, checked: this.state.data.showInboard})}>
                            <input type="checkbox" defaultChecked={this.state.data.showInboard} />
                        </Checkbox>
                        <span style={{whiteSpace: 'no-wrap', marginLeft: '3px', lineHeight: '1.3'}}>Quadro</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showArchived: !this.state.data.showArchived});}}} className={classNames({'ui tiny': true, checked: this.state.data.showArchived})}>
                            <input type="checkbox" defaultChecked={this.state.data.showArchived} />
                        </Checkbox>
                        <span style={{whiteSpace: 'no-wrap', marginLeft: '3px', lineHeight: '1.3'}}>Arquivado</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showBacklog: !this.state.data.showBacklog});}}} className={classNames({'ui tiny': true, checked: this.state.data.showBacklog})}>
                            <input type="checkbox" defaultChecked={this.state.data.showBacklog} />
                        </Checkbox>
                        <span style={{whiteSpace: 'no-wrap', marginLeft: '3px', lineHeight: '1.3'}}>Backlog</span><span style={{marginLeft: '3px', lineHeight: '1.3', fontSize: '10px'}}>(em breve)</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showCanceled: !this.state.data.showCanceled});}}} className={classNames({'ui tiny': true, checked: this.state.data.showCanceled})}>
                            <input type="checkbox" defaultChecked={this.state.data.showCanceled} />
                        </Checkbox>
                        <span style={{whiteSpace: 'no-wrap', marginLeft: '3px', lineHeight: '1.3'}}>Cancelado</span>
                    </Item>
                    <Item style={{whiteSpace: 'nowrap'}}>
                        <Checkbox style={{marginLeft: '5px', height: '12px', minHeight: '12px'}} init={{onChange: () => {this.setImmutableState({showDeleted: !this.state.data.showDeleted});}}} className={classNames({'ui tiny': true, checked: this.state.data.showDeleted})}>
                            <input type="checkbox" defaultChecked={this.state.data.showDeleted} />
                        </Checkbox>
                        <span style={{whiteSpace: 'no-wrap', marginLeft: '3px', lineHeight: '1.3'}}>Excluído</span>
                    </Item>

                </List>
                <div key={'boardCalendar'} style={{height: '600px', backgroundColor: 'white'}}>
                    <LoadServerContent isLoading={isLoading} actionMessage={actionMessage} />
                    <div>
                        <BigCalendar culture={'pt-br'} popupOffset={30} popup messages={calendarMessages} components={{event: EventComponent}} views={['month', 'week', 'day', 'agenda']} allDayAccessor={'isAllDayEvent'} onView={this._handleOnView} onNavigate={this._handleOnNavigate} view={selectedCalendarView} events={filteredCalendarEvents} selectable={false} toolbar={true} startAccessor="startDate" endAccessor="endDate" titleAccessor={this._renderTitle} eventPropGetter={this._getEventClassName}/>
                    </div>
                </div>
            </div>
        );
    }
}

