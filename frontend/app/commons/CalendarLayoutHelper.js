//TODO: Intercionalizar
//TODO: alguns codigos estao replicados com o cardentity
'use strict';
import moment from 'moment';
import {default as FunctionHelper} from './FunctionHelper';
import {default as constants} from './Constants';
import {DateStatus} from '../enums';

export default class CalendarLayoutHelper
{
    static getStatusMessage(momentPlannedDate, momentExecutionDate, haveExecutionDate, daysBetweenPlannedDateAndEndExecutionDate, status)
    {
        if (haveExecutionDate)
        {
            return daysBetweenPlannedDateAndEndExecutionDate >= 0 ?
                `Atendido no Prazo (${status}) - ${momentExecutionDate.format('DD/MM/YYYY')}` :
                `Atendido fora do Prazo (${status}). Planejado para [${momentPlannedDate.format('DD/MM/YYYY')}] realizado em [${momentExecutionDate.format('DD/MM/YYYY')}]`;
        }
        return (daysBetweenPlannedDateAndEndExecutionDate >= 0) ?
            `Ainda dentro prazo. Falta(m) ${status} (Prazo: ${momentPlannedDate.format('DD/MM/YYYY')})` :
            `Prazo expirado a ${status} (Prazo: ${momentPlannedDate.format('DD/MM/YYYY')})`;
    }

    static getStatusColor(daysBetweenPlannedAndExecution, executionDate)
    {
        if (executionDate)
        {
            return daysBetweenPlannedAndExecution >= 0 ? constants.DATE_INDATE_COLOR : constants.DATE_LATE_COLOR;
        }
        if (daysBetweenPlannedAndExecution > constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE)
        {
            return constants.DATE_INDATE_COLOR;
        }
        if ((daysBetweenPlannedAndExecution >= 0) && (daysBetweenPlannedAndExecution <= constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE))
        {
            return constants.DATE_WARNING_COLOR;
        }
        return constants.DATE_LATE_COLOR;
    }

    static getStatusState(daysBetweenPlannedAndExecution, executionDate)
    {
        //TODO: Substituir pela enumeracao,mas verificar antes se estes valores não estao sendo utilizados direto no className para renderizar as cores do SemanticUI
        if (executionDate)
        {
            return daysBetweenPlannedAndExecution >= 0 ? 'positive' : 'negative';
        }
        if (daysBetweenPlannedAndExecution > constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE)
        {
            return 'positive';
        }
        if ((daysBetweenPlannedAndExecution >= 0) && (daysBetweenPlannedAndExecution <= constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE))
        {
            return 'warning';
        }
        return 'negative';
    }

    static getFormmattedUtcDate(date, format)
    {
        let momentDate = this.getMomentDate(date);
        if (momentDate === null)
        {
            return null;
        }
        return momentDate.utc().format(format);
    }

    static getFormmattedDate(date, format)
    {
        let momentDate = this.getMomentDate(date);
        if (momentDate === null)
        {
            return null;
        }
        return momentDate.format(format);
    }

    static getMomentDate(date)
    {
        let dateToCheck = (date instanceof Date) ? date.toString() : date;
        if (FunctionHelper.isUndefined(date))
        {
            return null;
        }
        if (dateToCheck.endsWith('00:00:00.000Z'))
        {
             return moment(dateToCheck.replace('Z', ''));
        }
        return moment(date);
    }

    static getStatus(planningDate, executionDate)
    {
        if (!planningDate)
        {
            return null;
        }
        let momentPlannedDate = this.getMomentDate(planningDate);

        let haveExecutionDate = FunctionHelper.isDefined(executionDate);
        let momentExecutionDate = (haveExecutionDate) ? this.getMomentDate(executionDate) : moment();
        let daysBetweenPlannedAndExecutionDate = FunctionHelper.diffBetweenTwoDates(momentExecutionDate, momentPlannedDate);
        let msg = CalendarLayoutHelper.getStatusMessage(momentPlannedDate, momentExecutionDate, haveExecutionDate, daysBetweenPlannedAndExecutionDate, momentPlannedDate.from(momentExecutionDate, true));
        let color = CalendarLayoutHelper.getStatusColor(daysBetweenPlannedAndExecutionDate, executionDate);
        let statusState = CalendarLayoutHelper.getStatusState(daysBetweenPlannedAndExecutionDate, executionDate);
        return {planningMomentDate: momentPlannedDate, executionMomentDate: momentExecutionDate, message: msg, color: color, status: statusState};
    }

    static getDateStatus(planningDate, executionDate)
    {
        if (!planningDate)
        {
            return null;
        }
        let momentPlannedDate = this.getMomentDate(planningDate);
        let haveExecutionDate = FunctionHelper.isDefined(executionDate);
        let momentExecutionDate = (haveExecutionDate) ? this.getMomentDate(executionDate) : moment();
        let daysBetweenPlannedAndExecutionDate = FunctionHelper.diffBetweenTwoDates(momentExecutionDate, momentPlannedDate);
        if ((daysBetweenPlannedAndExecutionDate > -1) && (daysBetweenPlannedAndExecutionDate <= 0))
        {
            daysBetweenPlannedAndExecutionDate = 0;
        }
        if (executionDate)
        {
            return daysBetweenPlannedAndExecutionDate >= 0 ? DateStatus.ontime : DateStatus.late;
        }
        if (daysBetweenPlannedAndExecutionDate > constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE)
        {
            return DateStatus.ontime;
        }
        if ((daysBetweenPlannedAndExecutionDate >= 0) && (daysBetweenPlannedAndExecutionDate <= constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE))
        {
            return DateStatus.warning;
        }
        return DateStatus.late;
    }
}
