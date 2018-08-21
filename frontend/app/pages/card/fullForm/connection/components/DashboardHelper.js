'use strict';

import {FunctionHelper, CalendarLayoutHelper} from '../../../../../commons';
import {Status, DateStatus, Period, CardExecutionStatus} from '../../../../../enums';
import {CardEntity} from '../../../../../entities';
import {default as constants} from '../../../../../commons/Constants';


export default class DashboardHelper
{
    static getPeriodTitle(period)
    {
        switch (period)
        {
            case Period.day: return 'dia';
            case Period.week: return 'semana';
            case Period.month: return 'mês';
            case Period.year: return 'ano';
            default: return '-';
        }
    }

    static getStatusColor(status)
    {
        switch (status)
        {
            case Status.bad: return 'yellow';
            case Status.veryBad: return 'red';
            default: return 'white';
        }
    }

    static getDeliveryStatusTitle = (remainingDays, deliveryStatus) =>
    {
        if (deliveryStatus.value === DateStatus.deliveryOnTime && remainingDays.value !== 0) {return 'Dias antecipados';}
        if (deliveryStatus.value === DateStatus.deliveryOnTime && remainingDays.value === 0) {return 'Dias restantes';}
        if (deliveryStatus.value === DateStatus.warning) {return 'Dias restantes';}
        if (deliveryStatus.value === DateStatus.ontime) {return 'Dias restantes';}
        if (deliveryStatus.value === DateStatus.late) {return 'Dias atrasados';}
        if (deliveryStatus.value === DateStatus.deliveryLate) {return 'Dias atrasados';}
        return null;
    }

    static getSituationTitle(cardStatistic)
    {
        let scope = cardStatistic.globalScope.scope;
        let definedScopDatum = cardStatistic.definedScope;
        let resume = cardStatistic.resume;
        let endExecution = cardStatistic.globalScope.dates.endExecution;

        let {startPlanning, endPlanning} = (cardStatistic.globalScope.dates);

        if (FunctionHelper.isUndefined(startPlanning) || FunctionHelper.isUndefined(endPlanning))
        {
            return {title: 'Sem planejamento', subtitle: 'Data de início e fim de planejamento obrigatório'};
        }

        if (FunctionHelper.isDefined(endExecution))
        {
            let date = CalendarLayoutHelper.getFormmattedUtcDate(endExecution, 'DD/MMM');
            let percentualFinished = scope.finished.percentual;
            let scopeText = percentualFinished < 100 ? 'escopo incompleto' : 'escopo completo';
            return resume.isFinishedLate ?
                {title: 'Concluído fora do prazo', subtitle: `em ${date} | ${scopeText}`, color: 'red'} :
                {title: 'Concluído no prazo', subtitle: `(${date} | ${scopeText})`, color: 'green'};
        }

        if (resume.isDeadlineExpired)
        {
            return {title: 'Prazo expirado', subtitle: '', color: 'red'};
        }

        if (resume.isStartDateExpired)
        {
            return {title: 'Início atrasado', subtitle: '', color: 'red'};
        }

        let forecastStatus = definedScopDatum.forecastToFinish.status;
        if (FunctionHelper.isDefined(forecastStatus))
        {
            switch (forecastStatus)
            {
                case Status.veryBad: return {title: 'muito atrasado', subtitle: '(previsão > prazo acordado em 50%)', color: 'red'};
                case Status.bad: return {title: 'atrasado', subtitle: '(previsão > prazo acordado em 15%)', color: 'red'};
                case Status.warning: return {title: 'alerta', subtitle: '(previsão > prazo acordado em 0%)', color: 'yello'};
                case Status.normal: return {title: 'conforme esperado', subtitle: '(previsão = prazo acordado)', color: 'white'};
                case Status.good: return {title: 'pouco adiantado', subtitle: '(previsão < prazo acordado em 0%)', color: 'green'};
                case Status.veryGood: return {title: 'adiantado', subtitle: '(previsão < prazo acordado em 15%)', color: 'green'};
                case Status.excelent: return {title: 'muito adiantado', subtitle: '(previsão < prazo acordado em 50%)', color: 'green'};
                default: break;
            }
        }

        if (scope.notDefined.percentual >= 100)
        {
            return {title: 'Nenhum escopo definido', subtitle: '', color: 'white'};
        }


        if (resume.qntNotFinishedCardLate > 0)
        {
            return {title: 'atrasado', subtitle: 'qntd cartões atrasados: ' + resume.qntNotFinishedCardLate, color: 'red'};
        }

        if (scope.notStarted.percentual >= 100)
        {
            return {title: 'Não iniciado', subtitle: 'ou sem datas de planejamento', color: 'white'};
        }

        if (scope.started.percentual >= 0)
        {
            return {title: 'Não caculado', subtitle: 'Nenhum item foi finalizado ainda', color: 'white'};
        }

        if (scope.finished.percentual >= 0)
        {
            return {title: 'Não calculado', subtitle: '', color: 'white'};
        }


        return {title: '', subtitle: ''};
    }

    static getScopeAltText(cardStatistic)
    {
        let connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        let {total, notStarted, started, finished, notDefined, overflow} = cardStatistic.globalScope.scope;
        let altText = `Planejado: ${total.value || 0} ${connectionMetricTitle}`;

        altText += '\n----------------------------------------- \n\n';

        altText += `Finalizado: ${finished.value || 0} ${connectionMetricTitle} (${finished.percentual}%) \n`;

        altText += `em execução: ${started.value || 0} ${connectionMetricTitle} (${started.percentual}%) \n`;

        altText += `Não iniciado: ${notStarted.value || 0} ${connectionMetricTitle} (${notStarted.percentual}%) \n`;

        altText += `Não definido:  ${notDefined.value || 0} ${connectionMetricTitle} (${notDefined.percentual}%) \n`;

        altText += '\n----------------------------------------- \n\n';

        altText += `Excedente:  ${overflow.value || 0} ${connectionMetricTitle} (${overflow.percentual}%) \n`;
        return altText;
    }

    //TODO: Duplicado com o metodo de cima?? Verificar getScopeAltText
    static getScopeAltText2(statistic, scopeDatum)
    {
        let connectionMetricTitle = statistic.getConnectionMetricTitle(statistic);
        let {notStarted, started, finished, notDefined, overflow, total} = scopeDatum.scope;
        let title = '==================================\n';
        title += 'Resumo: \n';
        title += '==================================\n';
        title += `Finalizado: ${finished.value} ${connectionMetricTitle} (${finished.percentual}%) \n`;
        title += `Em execução: ${started.value} ${connectionMetricTitle}  (${started.percentual}%)\n`;
        title += `Não iniciado: ${notStarted.value} ${connectionMetricTitle}  (${notStarted.percentual}%)\n`;
        title += '\n----------------------------------------- \n\n';
        if (FunctionHelper.isDefined(notDefined)) {title += `Não Definido: ${notDefined.value} ${connectionMetricTitle} (${notDefined.percentual}%) \n`;}
        if (FunctionHelper.isDefined(overflow)) {title += `Excedente: ${overflow.value} ${connectionMetricTitle} (${overflow.percentual}%)\n`;}
        title += `Total: ${total.value} ${connectionMetricTitle} \n`;
        return title;
    }

    static getFinishedAltText(cardStatistic, scopeDatum)
    {
        const {scope} = scopeDatum;
        const connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        const qntFinished = scope.finished.value;
        const qntFinishedPercentual = scope.finished.percentual || 0;
        return `Escopo concluido: ${qntFinished} ${connectionMetricTitle || ''} (${qntFinishedPercentual}%)`;
    }

    static getVelocityToFinishAltText(cardStatistic, scopeDatum)
    {
        const {dates, velocityToFinish, deliveryStatus} = scopeDatum;
        const connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        const periodTitle = DashboardHelper.getPeriodTitle(cardStatistic.resume.period);
        let altText = (deliveryStatus.value === DateStatus.late) ?
            'Cadência esperada não calculada, pois o prazo de entrega encontra-se expirado' :
            `Cadência esperada de ${velocityToFinish.value || '-'} ${connectionMetricTitle}/${periodTitle} para atender o escopo dentro do prazo estipulado: ${CalendarLayoutHelper.getFormmattedUtcDate(dates.endPlanning, 'DD/MMM') || '[não calculado]'}`;

        if (velocityToFinish.comment)
        {
            altText += '\n\n' + velocityToFinish.comment;
        }
        return altText;
    }

    static getForecastAltText(cardStatistic, scopeDatum)
    {
        const {forecastToFinish} = scopeDatum;
        const connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        const periodTitle = DashboardHelper.getPeriodTitle(cardStatistic.resume.period);
        let actualVelocity = cardStatistic.resume.actualVelocity.value;
        let altText = `Com a cadência atual [${actualVelocity} ${connectionMetricTitle}/${periodTitle}], a previsão de entrega é para: ${cardStatistic.getForeCastDateForDefinedScope('DD/MMM') || '[não calculado]'}`;
        if (forecastToFinish.comment)
        {
            altText += '\n\n' + forecastToFinish.comment;
        }
        return altText;
    }

    static getRemaingDayValue(remainingDays)
    {
        if (FunctionHelper.isDefined(remainingDays.value))
        {
            return Math.abs(remainingDays.value);
        }
        return null;
    }

    static getVelocityToFinishInfoToRender = (status, velocityToFinish) =>
    {
        switch (status.value)
        {
            case DateStatus.late: return {label: 'ATR', meta: ''};
            default: return {label: velocityToFinish.value || '-', meta: `${velocityToFinish.percentual || '-'}%`};
        }
    };

    static getCardSituation = (card) =>
    {
        let cardEntity = new CardEntity(card);

        switch (cardEntity.getCardExecutionStatus())
        {
            case CardExecutionStatus.notStarted:
            {
                if (cardEntity.isLateFinish())
                {
                    return {value: 'Não iniciado/prazo expirado', style: {backgroundColor: constants.DATE_LATE_COLOR.backgroundColor, color: constants.DATE_LATE_COLOR.color, padding: '2px', borderRadius: '0px'}};
                }
                if (cardEntity.isStartLate() || cardEntity.isLateFinish())
                {
                    return {value: 'Não iniciado/atrasado', style: {backgroundColor: constants.DATE_LATE_COLOR.backgroundColor, color: constants.DATE_LATE_COLOR.color, padding: '2px', borderRadius: '0px'}};
                }
                return {value: 'Não iniciado', style: {backgroundColor: 'transparent', padding: '0px', borderRadius: '0px'}};
            }
            case CardExecutionStatus.started:
            {
                if (cardEntity.isLateFinish())
                {
                    return {value: 'Em execução/prazo expirado', style: {backgroundColor: constants.DATE_LATE_COLOR.backgroundColor, color: constants.DATE_LATE_COLOR.color, padding: '2px', borderRadius: '0px'}};
                }
                return {value: 'Em execução', style: {backgroundColor: 'transparent', padding: '0px', borderRadius: '0px'}};
            }
            case CardExecutionStatus.finished:
            {
                if (cardEntity.isLateFinish())
                {
                    return {value: 'Finalizado/atrasado', style: {backgroundColor: constants.DATE_LATE_COLOR.backgroundColor, color: constants.DATE_LATE_COLOR.color, padding: '2px', borderRadius: '0px'}};
                }
                return {value: 'Finalizado', style: {backgroundColor: 'transparent', padding: '0px', borderRadius: '0px'}};
            }
            default: return {value: '-', style: {backgroundColor: 'transparent', padding: '0px', borderRadius: '0px'}};
        }
    }
}
