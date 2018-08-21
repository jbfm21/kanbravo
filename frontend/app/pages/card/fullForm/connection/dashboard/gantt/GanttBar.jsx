import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {FunctionHelper, CalendarLayoutHelper} from '../../../../../../commons';
import {Description, VisTimeline} from '../../../../../../components';
import {CardEntity} from '../../../../../../entities';
import {DateStatus} from '../../../../../../enums';

//TODO: implementar shouldUpdate

const messages = defineMessages(
{
    groupMarkLabel: {id: 'modal.cardForm.dateMetricTab.groupMarkLabel.label', description: '', defaultMessage: 'Marco'},
    groupPlanningDateLabel: {id: 'modal.cardForm.dateMetricTab.groupPlanningDate.label', description: '', defaultMessage: 'Planejado'},
    groupExecutionDateLabel: {id: 'modal.cardForm.dateMetricTab.groupPlanningDate.label', description: '', defaultMessage: 'Execução'},
    startPlanningDateLabel: {id: 'modal.cardForm.dateMetricTab.createdDate.label', description: 'DateMetric createdDate label', defaultMessage: 'Início Planejado'},
    endPlanningDateLabel: {id: 'modal.cardForm.dateMetricTab.startLeadTimeDate.label', description: 'DateMetric startLeadTimeDate label', defaultMessage: 'Término Planejado'},
    zoomHelp: {id: 'modal.cardForm.dateMetricTab.zoom.label', description: 'DateMetric zoom label', defaultMessage: 'Zoom: Clique no Timeline e pressione a tecla Cntrl enquanto gira a tecla de scroll do mouse'}
});

class GanttBar extends Component
{
    static displayName = 'GanttBar';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        statisticManager: PropTypes.object.isRequired,
        connectedCards: PropTypes.any.isRequired,
        reminders: PropTypes.any.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    _addMajorPlanningDate = (items) =>
    {
        const {card} = this.props;
        const {formatMessage} = this.props.intl;

        const startPlanningDate = FunctionHelper.dateOrNull(card.startPlanningDate);
        const endPlanningDate = FunctionHelper.dateOrNull(card.endPlanningDate);
        const __createItem = (id, date, header) =>
        {
            const formattedHeader = formatMessage(header);
            const label = `${formattedHeader}: ${FunctionHelper.formatDate(date, 'DD/MM', '')}`;
            const altText = `${formattedHeader}&#10;${FunctionHelper.formatDate(date, 'DD/MM/YYYY', '')}`;
            return {id: id, show: 'start', group: 1, start: date, type: 'box', label: label, className: '', altText: altText};
        };

        if (startPlanningDate)
        {
            items.push(__createItem('startPlanningDate', startPlanningDate, messages.startPlanningDateLabel));
        }
        if (endPlanningDate)
        {
            items.push(__createItem('endPlanningDate', endPlanningDate, messages.endPlanningDateLabel));
        }
    }

    _addReminders = (items) =>
    {
        const {reminders} = this.props;
        _(reminders).filter((item) => FunctionHelper.isDefined(item.date)).forEach((reminder, index) =>
        {
            const dateStatus = CalendarLayoutHelper.getDateStatus(reminder.date, null);
            const className = classNames({
                'blackBorder k-border': reminder.completed,
                'greenBorder k-border': !reminder.completed && dateStatus === DateStatus.ontime,
                'yellowBorder k-border': !reminder.completed && dateStatus === DateStatus.warning,
                'redBorder k-border': !reminder.completed && dateStatus === DateStatus.late
            });
            const altText = `${reminder.description} &#10; ${FunctionHelper.formatDate(reminder.date, 'DD/MM/YYYY', '')}`;
            items.push({id: `reminder_${index + 3}`, show: 'start', group: 1, start: reminder.date, type: 'box', label: reminder.description, altText: altText, className: className});
        });
    };

    _addExecutionDates(groups, items)
    {
        const {connectedCards} = this.props;

        if (FunctionHelper.isArrayNullOrEmpty(connectedCards))
        {
            return;
        }

        const __getDurationClassName = (cardEntity) =>
        {
            return classNames({
                'red k-border': cardEntity.isLateFinish(),
                'progress-bar-finished': cardEntity.isStarted() && cardEntity.isFinished(),
                'progress-bar-started': cardEntity.isStarted() && !cardEntity.isFinished(),
                'progress-bar-notStarted': !cardEntity.isStarted()
            });
        };

        _(connectedCards).forEach((item, index) =>
        {
            const groupId = `card_${index}`;
            const groupOrder = index + 1;
            groups.push({id: groupId, order: groupOrder, content: item.title});

            const cardEntity = new CardEntity(item);
            const isPlanned = FunctionHelper.isDefined(item.startPlanningDate) && FunctionHelper.isDefined(item.endPlanningDate);
            if (isPlanned)
            {
                items.push(
                    {id: `connectedPlanningCard_${index}`, order: 1, group: groupId,
                    type: 'background', className: 'planningDate',
                    start: FunctionHelper.dateOrNull(item.startPlanningDate),
                    end: FunctionHelper.dateOrNull(item.endPlanningDate),
                    label: item.title,
                    altText: ''
                });
            }
            if (FunctionHelper.isDefined(item.startExecutionDate))
            {
                const cardStatistic = this.props.statisticManager.getStatistic(item);
                const finishedScope = FunctionHelper.isDefined(cardStatistic) ? cardStatistic.globalScope.scope.finished : null;
                const connectionMetric = FunctionHelper.isDefined(cardStatistic) ? cardStatistic.connectionMetric.title : '-';
                const metricValue = item.metricValue || '-';
                const metricTitle = FunctionHelper.isDefined(item.metric) ? item.metric.title : '-';
                const humanDuration = FunctionHelper.formatMinutesToDayHourAndMinutes(FunctionHelper.diff(item.startExecutionDate, item.endExecutionDate, 'minutes'));
                const dontHaveScope = FunctionHelper.isUndefined(finishedScope) || FunctionHelper.isUndefined(finishedScope.percentual);

                const commonLabel = `${metricValue} ${metricTitle} em ${humanDuration}`;
                const commonAltTextHeader = `${item.title}: ${metricValue} ${metricTitle} em  ${humanDuration}`;
                const commonAltTextFooter = `Início: ${cardEntity.getStartDateStatus().message} &#10; Término: ${cardEntity.getEndDateStatus().message}`;

                let itemToPush = {id: `connectedExecutionCard_${index}`,
                        order: 2, group: groupId, className: __getDurationClassName(cardEntity),
                        start: FunctionHelper.dateOrNull(item.startExecutionDate),
                        end: FunctionHelper.dateOrNow(FunctionHelper.dateOrNull(item.endExecutionDate))};

                if (dontHaveScope)
                {
                    const altText = `${commonAltTextHeader} &#10;&#10; ${commonAltTextFooter}`;
                    const label = commonLabel;
                    itemToPush = FunctionHelper.assign(itemToPush, {show: 'executionDate', label: label, altText: altText});
                }
                else
                {
                    const altText = `${commonAltTextHeader} &#10; (${finishedScope.value} ${connectionMetric} concluídos) &#10;&#10; ${commonAltTextFooter}}`;
                    const label = (finishedScope.percentual >= 100) ? commonLabel : '';
                    const showType = (finishedScope.percentual >= 100) ? 'executionDate' : 'executionDate_notFinished';
                    itemToPush = FunctionHelper.assign(itemToPush, {show: showType, label: label, altText: altText, finishedPercentual: finishedScope.percentual});
                }

                items.push(itemToPush);
            }
        });
    }

    render()
    {
        const {card, connectedCards} = this.props;
        const {formatMessage} = this.props.intl;

        if (FunctionHelper.isUndefined(card) || FunctionHelper.isUndefined(connectedCards))
        {
            return null;
        }

        let groups = [{id: 1, order: 1, content: formatMessage(messages.groupMarkLabel)}];
        let items = [];

        this._addMajorPlanningDate(items);
        this._addExecutionDates(groups, items);
        this._addReminders(items);

        const options = {
            width: '100%',
            orientation: 'both',
            throttleRedraw: 10,
            locale: 'pt-br',
            zoomKey: 'ctrlKey',
            stack: true,
            clickToUse: true,
            order: (a, b) => b.order - a.order,
            groupOrder: (a, b) => a.order - b.order,
            template: (item) =>
            {
                switch (item.show)
                {
                    case 'start': return `<div style="display:inline; font-weigth:bold; font-size:10px" title="${item.altText}">${item.label}</div>`;
                    case 'executionDate': return `<div style="display:inline-flex; font-weigth:bold; font-size:10px; color:white; margin-left:20px" title="${item.altText}">${item.label}</div>`;
                    case 'executionDate_notFinished':
                    {
                        const finishedPercentual = item.finishedPercentual;
                        const notFinishedPercentual = 100 - item.finishedPercentual;
                        return `
                            <div class="progress" style="width: 100%; height: 17px; border-radius: 0px; margin: 0px;font-size: 11px;" title="${item.altText}">
                                <div class="progress-bar-finished progress-bar" label="${finishedPercentual}%" style="font-size: inherit; width: ${finishedPercentual}%">${finishedPercentual}%</div>
                                <div class="progress-bar-started progress-bar" label="${notFinishedPercentual}%" style="font-size: inherit; width: ${notFinishedPercentual}%;"></div>
                            </div>`;
                    }
                    default:
                        if (item.type === 'background')
                        {
                            return `<div style="font-weigth:bold;font-size:12px" title="${item.label}"></div>`;
                        }
                        return `<div style="font-weigth:bold;font-size:12px" title="${item.altText}">${item.label}</div>`;
                }
            },
            showMajorLabels: true,
            showCurrentTime: true,
            format: {minorLabels: {minute: 'h:mma', hour: 'ha'}}
        };

        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <Description style={{marginLeft: '5px', width: '100%'}}>
                    <div className="statisticGanttBar" style={{display: 'block', overflowX: 'hidden', fontSize: '12px'}}>
                        <VisTimeline options={options} items={items} groups={groups} />
                    </div>
                    <div><FormattedMessage {...messages.zoomHelp}/></div>
                </Description>
            </div>
        );
    }
}

module.exports = injectIntl(GanttBar, {withRef: true});
