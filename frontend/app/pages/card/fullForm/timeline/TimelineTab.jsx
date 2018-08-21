import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import _ from 'lodash';
import {renderToString} from 'react-dom/server';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Checkbox} from 'react-semantify';
import classNames from 'classNames';
import moment from 'moment';

import {ImmutableState} from '../../../../decorators';
import {LaneType} from '../../../../enums';

import {KanbanActions} from '../../../../actions';
import {FunctionHelper, TimesheetHelper} from '../../../../commons';
import {Description, LoadServerContent, VisTimeline, Avatar, FormToast} from '../../../../components';
import {default as InformationOnlyAfterCardIsCreated} from '../message/InformationOnlyAfterCardIsCreated.jsx';
import {default as TimelineStore} from './TimelineStore';

//TODO: implementar shouldUpdate

const StateRecord = Immutable.Record({isLoadingTimeSheet: false, isLoadingCardMovementHistory: false, actionMessage: '', cardMovementHistory: null, timeSheet: null, showMark: true, showPeriod: true, showImpediment: true, showTimesheet: true, showMovement: true});

const messages = defineMessages(
{
    groupDateLabel: {id: 'modal.cardForm.dateMetricTab.groupDate.label', description: '', defaultMessage: 'Marcos'},
    groupPeriodLabel: {id: 'modal.cardForm.dateMetricTab.groupPeriod.label', description: '', defaultMessage: 'Período'},
    groupImpedimentLabel: {id: 'modal.cardForm.dateMetricTab.groupImpediment.label', description: '', defaultMessage: 'Impedimento'},
    groupTimeSheetLabel: {id: 'modal.cardForm.dateMetricTab.groupTimeSheet.label', description: '', defaultMessage: 'TimeSheet'},
    groupMovementLabel: {id: 'modal.cardForm.dateMetricTab.groupMovement.label', description: '', defaultMessage: 'Movimentação'},

    createdDateLabel: {id: 'modal.cardForm.dateMetricTab.createdDate.label', description: 'DateMetric createdDate label', defaultMessage: 'Data de Criação'},
    startLeadTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.startLeadTimeDate.label', description: 'DateMetric startLeadTimeDate label', defaultMessage: 'Início LeadTime'},
    endLeadTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.endLeadTimeDate.label', description: 'DateMetric endLeadTimeDate label', defaultMessage: 'Fim LeadTime'},
    startCycleTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.startCycleTimeDate.label', description: 'DateMetric startCycleTimeDate label', defaultMessage: 'Início CycleTime'},
    endCycleTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.endCycleTimeDate.label', description: 'DateMetric endCycleTimeDate label', defaultMessage: 'Fim CycleTime'},
    customerLeadTimeLabel: {id: 'modal.cardForm.dateMetricTab.customerLeadTime.label', description: 'DateMetric customerLeadTime label', defaultMessage: 'Customer leadTIme'},
    leadTimeLabel: {id: 'modal.cardForm.dateMetricTab.leadTime.label', description: 'DateMetric leadTime label', defaultMessage: 'LeadTime'},
    cycleTimeLabel: {id: 'modal.cardForm.dateMetricTab.cycleTime.label', description: 'DateMetric cycleTime label', defaultMessage: 'CycleTIme'},
    backlogTimeLabel: {id: 'modal.cardForm.dateMetricTab.backlogTime.label', description: 'DateMetric backlogTime label', defaultMessage: 'BacklogTime'},
    commitmentTimeLabel: {id: 'modal.cardForm.dateMetricTab.commitmentTime.label', description: 'DateMetric commitmentTime label', defaultMessage: 'CommitmentTime'},
    deliveryTimeLabel: {id: 'modal.cardForm.dateMetricTab.deliveryTime.label', description: 'DateMetric deliveryTime label', defaultMessage: 'DeliveryTime'},
    commentsLabel: {id: 'modal.cardForm.dateMetricTab.comments.label', description: 'DateMetric comments label', defaultMessage: 'Comentários'},
    zoomHelp: {id: 'modal.cardForm.dateMetricTab.zoom.label', description: 'DateMetric zoom label', defaultMessage: 'Zoom: Clique no Timeline e pressione a tecla Cntrl enquanto gira a tecla de scroll do mouse'},
    subtitleMilestone: {id: 'modal.cardForm.dateMetricTab.subtitle.milestone', description: '', defaultMessage: 'Marco'},
    subtitlePeriod: {id: 'modal.cardForm.dateMetricTab.subtitle.period', description: '', defaultMessage: 'Período'},
    subtitleTimeSheet: {id: 'modal.cardForm.dateMetricTab.subtitle.timesheet', description: '', defaultMessage: 'Timesheet'},
    subtitleImpediment: {id: 'modal.cardForm.dateMetricTab.subtitle.impediment', description: '', defaultMessage: 'Impedimento'},
    subtitleMovement: {id: 'modal.cardForm.dateMetricTab.subtitle.movement', description: '', defaultMessage: 'Movimentação'}
});

@ImmutableState
@airflux.FluxComponent
class TimelineTab extends Component
{
    static displayName = 'TimelineTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(TimelineStore, this._listenToTimelineStore);
       this.state = {data: new StateRecord()};
    }

    _listenToTimelineStore = (store) =>
    {
         switch (store.actionState)
        {
            case KanbanActions.cardSetting.timesheet.list.progressed:
                this.setImmutableState({isLoadingTimeSheet: true, actionMessage: ''});
                break;
            case KanbanActions.cardSetting.timesheet.list.failed:
                this.setImmutableState({isLoadingTimeSheet: false, actionMessage: store.actionMessage});
                break;
            case KanbanActions.cardSetting.timesheet.list.completed:
                this.setImmutableState({isLoadingTimeSheet: false, timeSheet: store.state.timeSheet, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.cardMovementHistory.list.progressed:
                this.setImmutableState({isLoadingCardMovementHistory: true, actionMessage: ''});
                break;
            case KanbanActions.cardSetting.cardMovementHistory.list.failed:
                this.setImmutableState({isLoadingCardMovementHistory: false, actionMessage: store.actionMessage});
                break;
            case KanbanActions.cardSetting.cardMovementHistory.list.completed:
                this.setImmutableState({isLoadingCardMovementHistory: false, cardMovementHistory: store.state.cardMovementHistory, actionMessage: ''});
                break;


           default: break;
        }
    }

    _addGroupDateAndPeriodItems = (items, card) =>
    {
        const {formatMessage} = this.props.intl;
        const {createdDate: strCreatedDate, startLeadTimeDate: strStartLeadTimeDate, endLeadTimeDate: strEndLeadTimeDate, startCycleTimeDate: strStartCycleTimeDate, endCycleTimeDate: strEndCycleTimeDate} = card.dateMetrics;
        const getDurationClassName = (date) => (date) ? '' : 'green';

        const createdDate = FunctionHelper.dateOrNull(strCreatedDate);
        const startLeadTimeDate = FunctionHelper.dateOrNull(strStartLeadTimeDate);
        const startCycleTimeDate = FunctionHelper.dateOrNull(strStartCycleTimeDate);
        const endCycleTimeDate = FunctionHelper.dateOrNull(strEndCycleTimeDate);
        const endLeadTimeDate = FunctionHelper.dateOrNull(strEndLeadTimeDate);

        if (this.state.data.showMark)
        {
            if (createdDate) {items.push({id: 1, show: 'start', group: 1, start: createdDate, type: 'box', header: formatMessage(messages.createdDateLabel), className: 'green'});}
            if (startLeadTimeDate) {items.push({id: 2, show: 'start', group: 1, start: startLeadTimeDate, type: 'box', header: formatMessage(messages.startLeadTimeDateLabel), className: 'green'});}
            if (startCycleTimeDate) {items.push({id: 3, show: 'start', group: 1, start: startCycleTimeDate, type: 'box', header: formatMessage(messages.startCycleTimeDateLabel), className: 'green'});}
            if (endCycleTimeDate) {items.push({id: 4, show: 'start', group: 1, start: endCycleTimeDate, type: 'box', header: formatMessage(messages.endCycleTimeDateLabel), className: 'green'});}
            if (endLeadTimeDate) {items.push({id: 5, show: 'start', group: 1, start: endLeadTimeDate, type: 'box', header: formatMessage(messages.endLeadTimeDateLabel), className: 'green'});}
        }

        if (this.state.data.showPeriod)
        {
            //CustomerLeadTime
            items.push({id: 6, show: 'duration', order: 1, group: 2, start: createdDate, end: FunctionHelper.dateOrNow(endLeadTimeDate), className: getDurationClassName(endLeadTimeDate), header: formatMessage(messages.customerLeadTimeLabel)});
            //LeadTime
            if (startLeadTimeDate) {items.push({id: 7, show: 'duration', order: 2, group: 2, start: startLeadTimeDate, end: FunctionHelper.dateOrNow(endLeadTimeDate), className: getDurationClassName(endLeadTimeDate), header: formatMessage(messages.leadTimeLabel)});}
            //cycletime
            if (startCycleTimeDate) {items.push({id: 8, show: 'duration', order: 3, group: 2, start: startCycleTimeDate, end: FunctionHelper.dateOrNow(endCycleTimeDate), className: getDurationClassName(endCycleTimeDate), header: formatMessage(messages.cycleTimeLabel)});}
            //backlogtime
            items.push({id: 9, show: 'duration', order: 4, group: 2, start: createdDate, end: FunctionHelper.dateOrNow(startLeadTimeDate), className: getDurationClassName(startLeadTimeDate), header: formatMessage(messages.backlogTimeLabel)});
            //commitmentTime
            if (startLeadTimeDate) {items.push({id: 10, show: 'duration', order: 5, group: 2, start: startLeadTimeDate, end: FunctionHelper.dateOrNow(startCycleTimeDate), className: getDurationClassName(startCycleTimeDate), header: formatMessage(messages.commitmentTimeLabel)});}
            //deliver
            if (endCycleTimeDate) {items.push({id: 11, show: 'duration', order: 6, group: 2, start: endCycleTimeDate, end: FunctionHelper.dateOrNow(endLeadTimeDate), className: getDurationClassName(endLeadTimeDate), header: formatMessage(messages.deliveryTimeLabel)});}
        }
    }

    _addTimeSheetItems = (items, card) => //eslint-disable-line
    {
        const timeSheet = this.state.data.timeSheet;
        if (!timeSheet)
        {
            return;
        }

        let timeSheetInRange = TimesheetHelper.generateConsecutiveDatesToRange(timeSheet);
        let getDurationClassName = (date) => (date) ? '' : 'green';
        _(timeSheetInRange).forEach((item, index) =>
        {
            items.push(
                {id: `timesheet_${index}`, show: 'timesheet', order: index, group: 4,
                start: item.startDate, end: item.endDate, className: getDurationClassName(item.endDate),
                avatar: item.user.avatar,
                header: item.user.nickname,
                effectiveWork: item.minutes
            });
        });
    }

    _addMovementsItems = (items, card) => //eslint-disable-line
    {
        const cardMovementHistory = this.state.data.cardMovementHistory;
        if (FunctionHelper.isUndefined(cardMovementHistory) || FunctionHelper.isUndefined(cardMovementHistory.movements))
        {
            return;
        }

        _(cardMovementHistory.movements).forEach((item, index) =>
        {
            let endDate = null;
            let className = '';
            if (cardMovementHistory.movements[index + 1])
            {
                endDate = cardMovementHistory.movements[index + 1].startDate;
            }
            else if (item.laneType === LaneType.completed.name)
            {
                endDate = item.startDate;
            }
            else
            {
                endDate = moment().toDate();
                className = 'green';
            }
            let path = item.path.replace('/root', '');
            items.push({id: `movement_${index}`, show: 'duration', order: index, group: 5, start: item.startDate, end: endDate, className: className, header: path});
        });
    }

    _addImpedimentItems = (items, card) => //eslint-disable-line
    {
        const getDurationClassName = (date) => (date) ? '' : 'green';
        let sortedImpediments = _.sortBy(card.impediments, function(item) {return new Date(item.startDate);});
        _(sortedImpediments).forEach((item, index) =>
        {
            items.push({id: `imp_${index}`, show: 'duration', order: index, group: 3, start: item.startDate, end: FunctionHelper.dateOrNow(item.endDate), className: getDurationClassName(item.endDate), avatar: item.type.avatar, header: item.type.title});
        });
    }

    createItemToShow = (card) =>
    {
        let items = [];
        this._addGroupDateAndPeriodItems(items, card);
        if (this.state.data.showImpediment)
        {
            this._addImpedimentItems(items, card);
        }
        if (this.state.data.showTimesheet)
        {
            this._addTimeSheetItems(items, card);
        }
        if (this.state.data.showMovement)
        {
            this._addMovementsItems(items, card);
        }
        return items;
    }

    getAvatarHtml = (avatar) =>
    {
        if (FunctionHelper.isUndefined(avatar))
        {
            return '';
        }
        return renderToString(<Avatar avatar={avatar} hostStyle={{width: '13px', height: '13px', marginRight: '5px'}}/>);
    }

     _renderFilterOptions = () =>
    {
        return (<div style={{display: 'block', fontSize: '12px'}}>
            <table className="ui striped compact structured center aligned table" style={{border: '0px solid black'}}>
                <thead>
                    <tr>
                        <th><Checkbox init={{onChange: () => {this.setImmutableState({showMark: !this.state.data.showMark});}}} className={classNames({'ui tiny': true, checked: this.state.data.showMark})}><input type="checkbox" defaultChecked={this.state.data.showMark} /></Checkbox><FormattedMessage {...messages.subtitleMilestone}/></th>
                        <th><Checkbox init={{onChange: () => {this.setImmutableState({showPeriod: !this.state.data.showPeriod});}}} className={classNames({'ui tiny': true, checked: this.state.data.showPeriod})}><input type="checkbox" defaultChecked={this.state.data.showPeriod} /></Checkbox><FormattedMessage {...messages.subtitlePeriod}/></th>
                        <th><Checkbox init={{onChange: () => {this.setImmutableState({showImpediment: !this.state.data.showImpediment});}}} className={classNames({'ui tiny': true, checked: this.state.data.showImpediment})}><input type="checkbox" defaultChecked={this.state.data.showImpediment} /></Checkbox><FormattedMessage {...messages.subtitleImpediment}/></th>
                        <th><Checkbox init={{onChange: () => {this.setImmutableState({showTimesheet: !this.state.data.showTimesheet});}}} className={classNames({'ui tiny': true, checked: this.state.data.showTimesheet})}><input type="checkbox" defaultChecked={this.state.data.showTimesheet} /></Checkbox><FormattedMessage {...messages.subtitleTimeSheet}/></th>
                        <th><Checkbox init={{onChange: () => {this.setImmutableState({showMovement: !this.state.data.showMovement});}}} className={classNames({'ui tiny': true, checked: this.state.data.showTimesheet})}><input type="checkbox" defaultChecked={this.state.data.showTimesheet} /></Checkbox><FormattedMessage {...messages.subtitleMovement}/></th>
                    </tr>
                </thead>
            </table>
        </div>);
    }

    render()
    {
        const {isLoadingTimeSheet, isLoadingCardMovementHistory, actionMessage} = this.state.data;
        const isLoading = isLoadingTimeSheet || isLoadingCardMovementHistory;
        const {card} = this.props;
        const that = this;
        const {formatMessage} = this.props.intl;

        if (FunctionHelper.isUndefined(card))
        {
            return null;
        }

        if (FunctionHelper.isUndefined(card.dateMetrics))
        {
            return (<InformationOnlyAfterCardIsCreated/>);
        }


        if (isLoading)
        {
            return (
                <div style={{display: 'inline-block', width: '100%'}}>
                    <LoadServerContent isLoading={isLoading}/>
                    <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                    {this._renderFilterOptions()}
                    <Description style={{marginLeft: '5px', width: '100%'}}>
                        <div style={{display: 'block', height: '600px', overflowY: 'scroll', overflowX: 'hidden', fontSize: '12px'}}>
                        </div>
                    </Description>
                </div>
            );
        }

        let groups = [
            {id: 1, order: 1, propertyName: 'showMark', content: formatMessage(messages.groupDateLabel)},
            {id: 2, order: 2, propertyName: 'showPeriod', content: formatMessage(messages.groupPeriodLabel)},
            {id: 3, order: 3, propertyName: 'showImpediment', content: formatMessage(messages.groupImpedimentLabel)},
            {id: 4, order: 4, propertyName: 'showTimesheet', content: formatMessage(messages.groupTimeSheetLabel)},
            {id: 5, order: 5, propertyName: 'showMovement', content: formatMessage(messages.groupMovementLabel)}
        ];

        let items = this.createItemToShow(card);

        let itemOrder = (a, b) => b.order - a.order;
        let groupOrder = (a, b) => a.order - b.order;

        const options = {
            width: '100%',
            orientation: 'both',
            throttleRedraw: 10,
            zoomKey: 'ctrlKey',
            stack: true,
            clickToUse: true,
            order: itemOrder,
            groupOrder: groupOrder,
            template: (item) =>
            {
                switch (item.show)
                {
                    case 'start': return `<div style="font-weigth:bold;font-size:10px" title="${item.header}: ${moment(item.start).format('DD/MM/YYYY')}">${item.header}</div><p>${moment(item.start).format('DD/MM/YYYY')}</p>`;
                    case 'timesheet':
                    {
                        let numberOfDaysInInterval = moment(item.end).diff(moment(item.start), 'days') + 1;
                        let avatarHtml = that.getAvatarHtml(item.avatar);

                        let formattedEffectiveWork = FunctionHelper.formatMinutesToHourAndMinutes(item.effectiveWork);

                        return `<div style="display: inline-flex;font-weigth:bold;font-size:10px" title="${item.header}: ${formattedEffectiveWork} trabalhadas em ${numberOfDaysInInterval} dias">${avatarHtml}${item.header}: ${formattedEffectiveWork} em ${numberOfDaysInInterval} dias trabalhados</div>`;
                    }
                    case 'duration':
                    {
                        let duration = moment(item.end).diff(moment(item.start), 'minutes');
                        let avatarHtml = that.getAvatarHtml(item.avatar);
                        let formattedDuration = FunctionHelper.formatMinutesToDayHourAndMinutes(duration);
                        return `<div style="display: inline-flex;font-weigth:bold;font-size:10px" title="${item.header}: ${formattedDuration}">${avatarHtml}${item.header}: ${formattedDuration}</div>`;
                    }
                    default: return `<div style="font-weigth:bold;font-size:10px" title="${item.header}: ${item.description}">${item.header}: ${item.description}</div>`;
                }
            },
            showMajorLabels: true,
            showCurrentTime: true,
            format: {minorLabels: {minute: 'h:mma', hour: 'ha'}}
        };

        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <LoadServerContent isLoading={isLoading}/>
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                {this._renderFilterOptions()}
                <Description style={{marginLeft: '5px', width: '100%'}}>
                    <div style={{display: 'block', height: '500px', overflowY: 'scroll', overflowX: 'hidden', fontSize: '12px'}}>
                        <VisTimeline options={options} items={items} groups={groups}/>
                    </div>
                    <div><FormattedMessage {...messages.zoomHelp}/></div>
                </Description>
            </div>
        );
    }
}

module.exports = injectIntl(TimelineTab, {withRef: true});

