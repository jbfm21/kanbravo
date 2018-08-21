//TODO: alguns codigos estao replicados com calendarlayouthelper
'use strict';

import _ from 'lodash';
import moment from 'moment';

import {FunctionHelper, CalendarLayoutHelper} from '../commons';
import {CardExecutionStatus, DateStatus, CardStatus} from '../enums';

class CardEntity
{
    constructor (card)
    {
        this._card = card;
    }

    haveTasks = () =>
    {
        return (FunctionHelper.isDefined(this._taskList)) && (this._taskList.length > 0);
    }

    getNumberOfNotResolvedImpediment = () =>
    {
        const impediments = this._card.impediments;
        return FunctionHelper.isDefined(impediments) ? _.filter(impediments, (item) => FunctionHelper.isUndefined(item.endDate)).length : 0;
    }

    isBlocked = () =>
    {
        return this.getNumberOfNotResolvedImpediment() > 0;
    }

    getMetric = () =>
    {
        let value = FunctionHelper.isDefined(this._card.metricValue) ? this._card.metricValue : 0;
        let title = FunctionHelper.isDefined(this._card.metric) ? this._card.metric.title : '-';
        return {title: title, value: value};
    }

    getConnectedMetricTitle = () =>
    {
        if (FunctionHelper.isDefined(this._card.childrenMetric))
        {
            return this._card.childrenMetric.title;
        }
        if (FunctionHelper.isDefined(this._card.metric))
        {
            return this._card.metric.title;
        }
        return null;
    }

    getCardExecutionStatus = () =>
    {
        if (FunctionHelper.isUndefined(this._card.startExecutionDate) && FunctionHelper.isUndefined(this._card.endExecutionDate))
        {
            return CardExecutionStatus.notStarted;
        }
        if (FunctionHelper.isDefined(this._card.startExecutionDate) && FunctionHelper.isUndefined(this._card.endExecutionDate))
        {
            return CardExecutionStatus.started;
        }
        if (FunctionHelper.isDefined(this._card.endExecutionDate))
        {
            return CardExecutionStatus.finished;
        }
        //TODO: retornar exceção ??
        return CardExecutionStatus.none;
    }

    isArchivedCard = () =>
    {
        //TODO: tem em lugares repetidos
        return this._card.status === CardStatus.archived.name;
    }

    isStarted = () =>
    {
        return FunctionHelper.isDefined(this._card.startExecutionDate);
    }

    isFinished = () =>
    {
        return FunctionHelper.isDefined(this._card.endExecutionDate);
    }

    isStartLate = () =>
    {
        return (CalendarLayoutHelper.getDateStatus(this._card.startPlanningDate, this._card.startExecutionDate) === DateStatus.late);
    }

    isLateFinish = () =>
    {
        return (CalendarLayoutHelper.getDateStatus(this._card.endPlanningDate, this._card.endExecutionDate) === DateStatus.late);
    }

    isStartExecutionDateEarlierThan = (date) =>
    {
        return FunctionHelper.isDefined(this._card.startExecutionDate) && (date === null || moment(this._card.startExecutionDate).isBefore(date));
    }

    isEndExecutionDateLaterThan = (date) =>
    {
        return FunctionHelper.isDefined(this._card.endExecutionDate) && (date === null || moment(this._card.endExecutionDate).isAfter(date));
    }

    isStartPlanningDateEarlierThan = (date) =>
    {
        return FunctionHelper.isDefined(this._card.startPlanningDate) && (date === null || moment(this._card.startPlanningDate).isBefore(date));
    }

    isEndPlanningDateLaterThan = (date) =>
    {
        return FunctionHelper.isDefined(this._card.endPlanningDate) && (date === null || moment(this._card.endPlanningDate).isAfter(date));
    }

    getEndDateStatus = () =>
    {
        return CalendarLayoutHelper.getStatus(this._card.endPlanningDate, this._card.endExecutionDate);
    }

    getStartDateStatus = () =>
    {
        return CalendarLayoutHelper.getStatus(this._card.startPlanningDate, this._card.startExecutionDate);
    }

}

module.exports = CardEntity;
