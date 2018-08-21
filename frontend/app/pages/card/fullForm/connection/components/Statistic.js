//TODO: alguns codigos estao replicados com calendarlayouthelper
'use strict';

import _ from 'lodash';
import moment from 'moment';

import {FunctionHelper, CalendarLayoutHelper} from '../../../../../commons';
import {CardEntity} from '../../../../../entities';
import {CardExecutionStatus, Status, DateStatus, Period} from '../../../../../enums';


class Statistic
{
    constructor (card, connections)
    {
        this._card = card;
        this._cardEntity = new CardEntity(card);
        this._connections = connections;

        this.connectionMetric = null; //amanho Escopo Planejado
        this.connectionMetricValue = null;
        this.listOfUsedMetrics = [];
        this.scopeCards = [];
        this.notStarted = {count: 0, lateStartCards: [], lateFinishedCards: [], cards: [], metricTotalSizes: {}};
        this.started = {count: 0, lateStartCards: [], lateFinishedCards: [], cards: [], metricTotalSizes: {}};
        this.finished = {count: 0, lateStartCards: [], lateFinishedCards: [], cards: [], metricTotalSizes: {}};
        this.total = {count: 0, lateStartCards: [], lateFinishedCards: [], metricTotalSizes: {}};

        this.errors =
        {
            isStartExecutionBlankWithStartExecutionScope: {value: false, msg: null},
            isEndExecutionBlankWithAllFinishedScope: {value: false, msg: null},
            messages: []
        };

        this.resume =
        {
            isStartDateExpired: null,
            isDeadlineExpired: null,
            isFinishedLate: null,
            qntNotStartedCardLate: null,
            qntNotFinishedCardLate: null,
            blockedCards: [],
            actualVelocity: {value: null, comment: null},
            period: Period.day
        };

        this.cardScope =
        {
            scope: {
                total: {value: 0, percentual: 0},
                notStarted: {value: 0, percentual: 0},
                started: {value: 0, percentual: 0},
                finished: {value: 0, percentual: 0},
                remaining: {value: 0, percentual: 0}
            }
        };

        this.globalScope = {
            scope: {
                total: {value: 0, percentual: 0},
                notStarted: {value: 0, percentual: 0},
                started: {value: 0, percentual: 0},
                finished: {value: 0, percentual: 0},
                notDefined: {value: 0, percentual: 0},
                overflow: {value: 0, percentual: 0},
                remaining: {value: 0, percentual: 0},
                isFinished: 0
            },
            dates: {
                startPlanning: null, endPlanning: null,
                startExecution: null, endExecution: null,
                qntPlanningDays: null, qntExecutionDays: null, comment: null
            },
            remainingDays: {value: null, status: null, comment: null},
            velocityToFinish: {value: null, percentual: null, status: null, comment: null},
            forecastToFinish: {value: null, status: null, comment: null},
            deliveryStatus: {value: null, comment: null}
        };

        this.definedScope = {
            scope: {
                total: {value: 0, percentual: 0},
                notStarted: {value: 0, percentual: 0},
                started: {value: 0, percentual: 0},
                finished: {value: 0, percentual: 0},
                remaining: {value: 0, percentual: 0},
                isFinished: 0
            },
            dates: {
                startPlanning: null, endPlanning: null,
                startExecution: null, endExecution: null,
                qntPlanningDays: null, qntExecutionDays: null, comment: null
            },
            remainingDays: {value: null, status: null, comment: null},
            velocityToFinish: {value: null, percentual: null, status: null, comment: null},
            forecastToFinish: {value: null, status: null, comment: null},
            deliveryStatus: {value: null, comment: null}
        };

        const isDefinedChildrenMetric = FunctionHelper.isDefined(this._card.childrenMetricValue) && FunctionHelper.isDefined(this._card.childrenMetric);
        this.connectionMetric = (isDefinedChildrenMetric) ? this._card.childrenMetric : this._cardEntity.getMetric();
        this.connectionMetricValue = (isDefinedChildrenMetric) ? this._card.childrenMetricValue : (this._card.metricValue || null);

        this._setMetricStatistic();
        this._setScope();
        this._setDates();
        this._setRemainingDays();
        this._setActualVelocity();
        this._setExpectedVelocity();
        this._setForecast();
        this._setDeliveryStatus();
        this._setErrors();
    }

    getConnectionMetricTitle()
    {
        return FunctionHelper.isDefined(this.connectionMetric) ? this.connectionMetric.title : '-';
    }

    getCard()
    {
        return this._card;
    }

    isArchived()
    {
        return this._cardEntity.isArchived();
    }

    getTotalChildrenMetricValue = () =>
    {
        let validScopedCards = _(this.scopeCards).filter((item) => FunctionHelper.isDefined(item.childrenMetricValue)).value();
        let sum = _.sumBy(validScopedCards, 'childrenMetricValue');
        return sum;
    }

    listCardsFilterByMetricAndStatus(cardStatus, metricTitle)
    {
        return _.filter(this[cardStatus].cards, (item) =>
        {
            let itemMetricTitle = item.metric ? item.metric.title : '-';
            return itemMetricTitle === metricTitle;
        });
    }

    getForeCastDateForDefinedScope(format)
    {
        const value = this.definedScope.forecastToFinish.value;
        if (FunctionHelper.isUndefined(value))
        {
            return null;
        }
        return moment().add(value, 'days').format(format);
    }

    getForeCastDateForGlobalScope(format)
    {
        const value = this.globalScope.forecastToFinish.value;
        if (FunctionHelper.isUndefined(value))
        {
            return null;
        }
        return moment().add(value, 'days').format(format);
    }

    getMetricPercentual(metricTitle)
    {
        let result = {notStarted: {value: 0, percentual: 0}, started: {value: 0, percentual: 0}, finished: {value: 0, percentual: 0}, total: {value: 0, percentual: 0}};

        const total = this.total.metricTotalSizes[metricTitle];
        if (FunctionHelper.isUndefined(total))
        {
            return result;
        }

        result.notStarted.value = this.notStarted.metricTotalSizes[metricTitle] || 0;
        result.started.value = this.started.metricTotalSizes[metricTitle] || 0;
        result.finished.value = this.finished.metricTotalSizes[metricTitle] || 0;

        result.finished.percentual = FunctionHelper.getPercentual(result.finished.value, total, 0);
        result.started.percentual = FunctionHelper.getPercentual(result.started.value, total, 0);
        result.notStarted.percentual = FunctionHelper.getPercentual(result.notStarted.value, total, 0);
        if (result.notStarted.percentual > 0)
        {
            result.notStarted.percentual = FunctionHelper.fixPercentual(result.notStarted.percentual, [result.notStarted.percentual, result.started.percentual, result.finished.percentual]);
        }
        else
        {
            result.started.percentual = FunctionHelper.fixPercentual(result.started.percentual, [result.started.percentual, result.finished.percentual]);
        }

        result.total = {value: total, percentual: result.notStarted.percentual + result.started.percentual + result.finished.percentual};

        return result;
    }

    _getDeliveryStatusAux(scopeDatum)
    {
        let {scope, remainingDays} = scopeDatum;
        //TODO: colocar tambem o que iniciou e temrinou quando olhar os cartoes netos
        //TODO: reduzir tambem o que iniciou e temrinou quando olhar os cartoes netos
        let isFinished = scope.isFinished;
        if (FunctionHelper.isDefined(remainingDays.value) && (remainingDays.value >= 0))
        {
            return (isFinished) ? {value: DateStatus.deliveryOnTime} : {value: DateStatus.ontime};
        }
        if (FunctionHelper.isDefined(remainingDays.value) && (remainingDays.value < 0))
        {
            return (isFinished) ? {value: DateStatus.deliveryLate} : {value: DateStatus.late};
        }
        return {value: null, comment: 'Situação não calculada pois não foi possível calcular a quantidade de dias planejados para término. Verifique se as datas de planejamento foram corretamente preenchidas.'};
    }

    _setDeliveryStatus()
    {
        this.definedScope.deliveryStatus = this._getDeliveryStatusAux(this.definedScope);
        this.globalScope.deliveryStatus = this._getDeliveryStatusAux(this.globalScope);
    }

    _setMetricStatistic()
    {
        if (FunctionHelper.isUndefined(this._connections))
        {
            return;
        }
        this.total.count = this._connections.length;
        const metricTitle = (this.connectionMetric) ? this.connectionMetric.title : null;

        let totalDatum = this.total;
        let resumeDatum = this.resume;

        _.forEach(this._connections, (item) =>
        {
            let itemCardEntity = new CardEntity(item);
            if ((itemCardEntity.getMetric().title === metricTitle) || (FunctionHelper.isUndefined(metricTitle) && FunctionHelper.isUndefined(item.metric)))
            {
                this.scopeCards.push(item);
            }

            FunctionHelper.pushIfPredicateIsTrue(resumeDatum.blockedCards, item, itemCardEntity.isBlocked());

            const executionStatusProperty = itemCardEntity.getCardExecutionStatus().name;
            let objExecutionDatum = this[executionStatusProperty];

            objExecutionDatum.count++;
            objExecutionDatum.cards.push(item);

            const isCardStartLate = itemCardEntity.isStartLate() && executionStatusProperty === CardExecutionStatus.notStarted.name;
            FunctionHelper.pushIfPredicateIsTrue(objExecutionDatum.lateStartCards, item, isCardStartLate);
            FunctionHelper.pushIfPredicateIsTrue(totalDatum.lateStartCards, item, isCardStartLate);

            const isLateFinished = itemCardEntity.isLateFinish() && (executionStatusProperty === CardExecutionStatus.notStarted.name || executionStatusProperty === CardExecutionStatus.started.name);
            FunctionHelper.pushIfPredicateIsTrue(objExecutionDatum.lateFinishedCards, item, isLateFinished);
            FunctionHelper.pushIfPredicateIsTrue(totalDatum.lateFinishedCards, item, isLateFinished);

            const metric = itemCardEntity.getMetric();
            const isMetricDefined = FunctionHelper.isDefined(metric) && FunctionHelper.isDefined(metric.title);
            if (isMetricDefined)
            {
                FunctionHelper.pushUnique(this.listOfUsedMetrics, metric.title);
                FunctionHelper.sumValueToDictionary(objExecutionDatum.metricTotalSizes, metric.title, metric.value);
                FunctionHelper.sumValueToDictionary(totalDatum.metricTotalSizes, metric.title, metric.value);
            }
        });
    }

    _setScope()
    {

        if (FunctionHelper.isUndefined(this.connectionMetric))
        {
            return;
        }

        const metricTitle = this.connectionMetric.title;

        //Configurando os valores absolutos
        let globalScopeDatum = this.globalScope.scope;
        let definedScopeDatum = this.definedScope.scope;
        let cardScopeDatum = this.cardScope.scope;

        const isDefinedChildrenMetric = FunctionHelper.isDefined(this._card.childrenMetricValue) && FunctionHelper.isDefined(this._card.childrenMetric);
        globalScopeDatum.total.value = Number(isDefinedChildrenMetric ? this._card.childrenMetricValue : (this._card.metricValue || 0));
        globalScopeDatum.notStarted.value = this.notStarted.metricTotalSizes[metricTitle] || 0;
        globalScopeDatum.started.value = this.started.metricTotalSizes[metricTitle] || 0;
        globalScopeDatum.finished.value = this.finished.metricTotalSizes[metricTitle] || 0;
        globalScopeDatum.remaining.value = globalScopeDatum.total.value - globalScopeDatum.finished.value;

        const notDefinedOrOverFlowScope = globalScopeDatum.total.value - globalScopeDatum.notStarted.value - globalScopeDatum.started.value - globalScopeDatum.finished.value;
        const isOverFlow = notDefinedOrOverFlowScope < 0;
        globalScopeDatum.overflow.value = isOverFlow ? Number(Math.abs(notDefinedOrOverFlowScope)) : Number(0);
        globalScopeDatum.notDefined.value = !isOverFlow ? Number(notDefinedOrOverFlowScope) : Number(0);

        definedScopeDatum.notStarted.value = globalScopeDatum.notStarted.value;
        definedScopeDatum.started.value = globalScopeDatum.started.value;
        definedScopeDatum.finished.value = globalScopeDatum.finished.value;
        definedScopeDatum.total.value = definedScopeDatum.notStarted.value + definedScopeDatum.started.value + definedScopeDatum.finished.value;
        definedScopeDatum.remaining.value = definedScopeDatum.total.value - definedScopeDatum.finished.value;

        //Configurando os percentuais
        globalScopeDatum.total.percentual = 100;
        let totalGlobalScope = globalScopeDatum.total.value;
        globalScopeDatum.finished.percentual = FunctionHelper.getPercentual(globalScopeDatum.finished.value, totalGlobalScope, 0);
        globalScopeDatum.started.percentual = FunctionHelper.getPercentual(globalScopeDatum.started.value, totalGlobalScope, 0);
        globalScopeDatum.notStarted.percentual = FunctionHelper.getPercentual(globalScopeDatum.notStarted.value, totalGlobalScope, 0);
        globalScopeDatum.notDefined.percentual = FunctionHelper.getPercentual(globalScopeDatum.notDefined.value, totalGlobalScope, 0);
        if (globalScopeDatum.notDefined.percentual > 0)
        {
            globalScopeDatum.notDefined.percentual = FunctionHelper.fixPercentual(globalScopeDatum.notDefined.percentual, [globalScopeDatum.notStarted.percentual, globalScopeDatum.started.percentual, globalScopeDatum.finished.percentual, globalScopeDatum.notDefined.percentual]);
        }
        else if (globalScopeDatum.notStarted.percentual > 0)
        {
            globalScopeDatum.notStarted.percentual = FunctionHelper.fixPercentual(globalScopeDatum.notStarted.percentual, [globalScopeDatum.notStarted.percentual, globalScopeDatum.started.percentual, globalScopeDatum.finished.percentual, globalScopeDatum.notDefined.percentual]);
        }
        else if (globalScopeDatum.started.percentual > 0)
        {
            globalScopeDatum.started.percentual = FunctionHelper.fixPercentual(globalScopeDatum.started.percentual, [globalScopeDatum.notStarted.percentual, globalScopeDatum.started.percentual, globalScopeDatum.finished.percentual, globalScopeDatum.notDefined.percentual]);
        }
        globalScopeDatum.overflow.percentual = FunctionHelper.getPercentual(globalScopeDatum.overflow.value, globalScopeDatum.total.value, 0);
        globalScopeDatum.remaining.percentual = FunctionHelper.getPercentual(globalScopeDatum.remaining.value, totalGlobalScope, 0);
        globalScopeDatum.isFinished = globalScopeDatum.finished.value && globalScopeDatum.finished.value >= globalScopeDatum.total.value;

        let totalDefinedScope = definedScopeDatum.total.value;
        definedScopeDatum.finished.percentual = FunctionHelper.getPercentual(definedScopeDatum.finished.value, totalDefinedScope, 0);
        definedScopeDatum.started.percentual = FunctionHelper.getPercentual(definedScopeDatum.started.value, totalDefinedScope, 0);
        definedScopeDatum.notStarted.percentual = FunctionHelper.getPercentual(definedScopeDatum.notStarted.value, totalDefinedScope, 0);
        if (definedScopeDatum.notStarted.percentual > 0)
        {
            definedScopeDatum.notStarted.percentual = FunctionHelper.fixPercentual(definedScopeDatum.notStarted.percentual, [definedScopeDatum.notStarted.percentual, definedScopeDatum.started.percentual, definedScopeDatum.finished.percentual]);
        }
        else if (definedScopeDatum.started.percentual > 0)
        {
            definedScopeDatum.started.percentual = FunctionHelper.fixPercentual(definedScopeDatum.started.percentual, [definedScopeDatum.notStarted.percentual, definedScopeDatum.started.percentual, definedScopeDatum.finished.percentual]);
        }
        definedScopeDatum.total.percentual = definedScopeDatum.finished.percentual + definedScopeDatum.started.percentual + definedScopeDatum.notStarted.percentual;
        definedScopeDatum.remaining.percentual = FunctionHelper.getPercentual(definedScopeDatum.remaining.value, totalGlobalScope, 0);
        definedScopeDatum.isFinished = definedScopeDatum.finished.value && definedScopeDatum.finished.value >= definedScopeDatum.total.value;

        cardScopeDatum.total.value = this.notStarted.count + this.started.count + this.finished.count;
        cardScopeDatum.notStarted.value = this.notStarted.count;
        cardScopeDatum.started.value = this.started.count;
        cardScopeDatum.finished.value = this.finished.count;
        cardScopeDatum.remaining.value = cardScopeDatum.total.value - this.finished.count;

        //Configurando os percentuais
        cardScopeDatum.total.percentual = 100;
        let totalCardScope = cardScopeDatum.total.value;
        cardScopeDatum.finished.percentual = FunctionHelper.getPercentual(cardScopeDatum.finished.value, totalCardScope, 0);
        cardScopeDatum.started.percentual = FunctionHelper.getPercentual(cardScopeDatum.started.value, totalCardScope, 0);
        cardScopeDatum.notStarted.percentual = FunctionHelper.getPercentual(cardScopeDatum.notStarted.value, totalCardScope, 0);

        if (cardScopeDatum.notStarted.percentual > 0)
        {
            cardScopeDatum.notStarted.percentual = FunctionHelper.fixPercentual(cardScopeDatum.notStarted.percentual, [cardScopeDatum.notStarted.percentual, cardScopeDatum.started.percentual, cardScopeDatum.finished.percentual]);
        }
        else if (cardScopeDatum.started.percentual > 0)
        {
            cardScopeDatum.started.percentual = FunctionHelper.fixPercentual(cardScopeDatum.started.percentual, [cardScopeDatum.notStarted.percentual, cardScopeDatum.started.percentual, cardScopeDatum.finished.percentual]);
        }
        cardScopeDatum.remaining.percentual = FunctionHelper.getPercentual(cardScopeDatum.remaining.value, totalCardScope, 0);

    }

    _setDates()
    {
        if (FunctionHelper.isUndefined(this._connections))
        {
            return;
        }

        let card = this._card;
        this.total.count = this._connections.length;

        let globalScopeDatesDatum = this.globalScope.dates;
        let definedScopeDatesDatum = this.definedScope.dates;
        let resumeDatum = this.resume;

        globalScopeDatesDatum.startPlanning = FunctionHelper.dateOrNull(card.startPlanningDate);
        globalScopeDatesDatum.endPlanning = FunctionHelper.dateOrNull(card.endPlanningDate);
        globalScopeDatesDatum.startExecution = FunctionHelper.dateOrNull(card.startExecutionDate);
        globalScopeDatesDatum.endExecution = FunctionHelper.dateOrNull(card.endExecutionDate);

        //TODO: verificar se nao existir forLastDetailedEndPlanningDate utilizar o forEndPlanningDate
        //TODO: Confirmar se o inicio é do global ou procura a primeira do escopo definido
        globalScopeDatesDatum.startPlanning = FunctionHelper.dateOrNull(card.startPlanningDate);

        const setDateIfTruePrecondition = (object, propertyName, newValue, preconditionResult) =>
        {
            if (preconditionResult(object[propertyName]))
            {
                object[propertyName] = FunctionHelper.dateOrNull(newValue);
            }
        };
        let hasAtLeasOneDefinedScopeItemWithoutPlanningDate = false;
        _.forEach(this.scopeCards, (item) =>
        {
            let itemCardEntity = new CardEntity(item);
            setDateIfTruePrecondition(definedScopeDatesDatum, 'startPlanning', item.startPlanningDate, itemCardEntity.isStartPlanningDateEarlierThan);

            //Caso exista um item não planejado, considera a data de termino do item maior
            if (FunctionHelper.isUndefined(item.endPlanningDate))
            {
                hasAtLeasOneDefinedScopeItemWithoutPlanningDate = true;
                definedScopeDatesDatum.endPlanning = globalScopeDatesDatum.endPlanning;
            }
            if (!hasAtLeasOneDefinedScopeItemWithoutPlanningDate)
            {
                setDateIfTruePrecondition(definedScopeDatesDatum, 'endPlanning', item.endPlanningDate, itemCardEntity.isEndPlanningDateLaterThan);
            }

            setDateIfTruePrecondition(definedScopeDatesDatum, 'startExecution', item.startExecutionDate, itemCardEntity.isStartExecutionDateEarlierThan);
            if (this.definedScope.scope.isFinished)
            {
                setDateIfTruePrecondition(definedScopeDatesDatum, 'endExecution', item.endExecutionDate, itemCardEntity.isEndExecutionDateLaterThan);
            }
        });


        //Caso as datas de planejamento definido não tenham sido configuradas, utiliza as datas definidas nos cartão global
        if (FunctionHelper.isUndefined(definedScopeDatesDatum.startPlanning)) {definedScopeDatesDatum.startPlanning = globalScopeDatesDatum.startPlanning;}
        if (FunctionHelper.isUndefined(definedScopeDatesDatum.endPlanning)) {definedScopeDatesDatum.endPlanning = globalScopeDatesDatum.endPlanning;}
        if (FunctionHelper.isUndefined(definedScopeDatesDatum.startExecution)) {definedScopeDatesDatum.startExecution = globalScopeDatesDatum.startExecution;}
        if (FunctionHelper.isUndefined(definedScopeDatesDatum.endExecution)) {definedScopeDatesDatum.endExecution = globalScopeDatesDatum.endExecution;}

        //Caso as datas de planejamento global não tenham sido configuradas, utiliza as datas definidas nos cartões filhos
        if (FunctionHelper.isUndefined(globalScopeDatesDatum.startPlanning)) {globalScopeDatesDatum.startPlanning = definedScopeDatesDatum.startPlanning;}
        if (FunctionHelper.isUndefined(globalScopeDatesDatum.endPlanning)) {globalScopeDatesDatum.endPlanning = definedScopeDatesDatum.endPlanning;}
        if (FunctionHelper.isUndefined(globalScopeDatesDatum.startExecution)) {globalScopeDatesDatum.startExecution = definedScopeDatesDatum.startExecution;}

        //So coloca a data de execucao final igual a data do escopo caso o escopo global tenha sido concluido

        if (FunctionHelper.isUndefined(globalScopeDatesDatum.endExecution) && (this.globalScope.scope.isFinished))
        {
            globalScopeDatesDatum.endExecution = definedScopeDatesDatum.endExecution;
        }

        globalScopeDatesDatum.qntPlanningDays = FunctionHelper.diffBetweenStartDayAndEndDay(globalScopeDatesDatum.startPlanning, globalScopeDatesDatum.endPlanning);
        definedScopeDatesDatum.qntPlanningDays = FunctionHelper.diffBetweenStartDayAndEndDay(globalScopeDatesDatum.startPlanning, definedScopeDatesDatum.endPlanning);

        resumeDatum.isStartDateExpired = FunctionHelper.isUndefined(globalScopeDatesDatum.startExecution) &&
            (CalendarLayoutHelper.getDateStatus(globalScopeDatesDatum.startPlanning, globalScopeDatesDatum.startExecution) === DateStatus.late);

        resumeDatum.isDeadlineExpired = FunctionHelper.isUndefined(globalScopeDatesDatum.endExecution) &&
            CalendarLayoutHelper.getDateStatus(globalScopeDatesDatum.endPlanning, globalScopeDatesDatum.endExecution) === DateStatus.late;

        resumeDatum.isFinishedLate = FunctionHelper.isDefined(globalScopeDatesDatum.endExecution) &&
            CalendarLayoutHelper.getDateStatus(globalScopeDatesDatum.endPlanning, globalScopeDatesDatum.endExecution) === DateStatus.late;

        resumeDatum.qntNotStartedCardLate = this.notStarted.lateStartCards.length;

        resumeDatum.qntNotFinishedCardLate = this.notStarted.lateFinishedCards.length + this.started.lateFinishedCards.length;

    }

    _getVelocityStatus(percentual)
    {
        if (percentual > 50) {return Status.veryBad;}
        if (percentual > 15) {return Status.bad;}
        if (percentual > 0) {return Status.warning;}
        if (percentual === 0) {return Status.normal;}
        if (percentual < -50) {return Status.excelent;}
        if (percentual < -15) {return Status.veryGood;}
        if (percentual < 0) {return Status.good;}
        return Status.normal; //percentual === 0
    }

    _getForecastStatus(percentual)
    {
        if (percentual > 50) {return Status.veryBad;}
        if (percentual > 15) {return Status.bad;}
        if (percentual > 0) {return Status.warning;}
        if (percentual === 0) {return Status.normal;}
        if (percentual < -50) {return Status.excelent;}
        if (percentual < -15) {return Status.veryGood;}
        if (percentual < 0) {return Status.good;}
        return Status.normal; //percentual === 0
    }

    _getRemainingDayStatus(objRemainingDays)
    {
        let {value, percentual} = objRemainingDays;
        if (value === -1)
        {
            //Por conta de arredondamento;
            return Status.veryBad;
        }
        if (percentual > 50) {return Status.excelent;}
        if (percentual > 15) {return Status.veryGood;}
        if (percentual > 0) {return Status.warning;}
        if (percentual === 0) {return Status.bad;}
        if (percentual < -50) {return Status.veryBad;}
        if (percentual < -15) {return Status.veryBad;}
        if (percentual < 0) {return Status.veryBad;}
        return Status.normal; //percentual === 0
    }

    _setRemainingDays()
    {
        const setRemainingDaysFn = (scope) =>
        {
            let scopeDatesDatum = scope.dates;
            let scopeRemainingDaysDatum = scope.remainingDays;
            let dateToCompare = FunctionHelper.isDefined(scopeDatesDatum.endExecution) ? scopeDatesDatum.endExecution : new Date();
            const canCalculateRemainingDays = FunctionHelper.isDefined(scopeDatesDatum.endPlanning) & FunctionHelper.isDefined(scopeDatesDatum.qntPlanningDays);
            if (canCalculateRemainingDays)
            {
                scopeRemainingDaysDatum.value = FunctionHelper.diffBetweenStartDayAndEndDay(dateToCompare, scopeDatesDatum.endPlanning);
                scopeRemainingDaysDatum.percentual = FunctionHelper.ruleOfThree(scopeRemainingDaysDatum.value, scopeDatesDatum.qntPlanningDays, 1);
                scopeRemainingDaysDatum.status = this._getRemainingDayStatus(scopeRemainingDaysDatum);
                scopeRemainingDaysDatum.comment = `Dias restantes entre: ${FunctionHelper.formatDate(dateToCompare, 'DD/MM/YYYY', '--/--/----')} e ${FunctionHelper.formatDate(scopeDatesDatum.endPlanning, 'DD/MM/YYYY', '--/--/----')}`;
            }
            else
            {
                scopeRemainingDaysDatum.comment = 'Não foi possível calcular a quantidade de dias restantes, pois não foi possível identificar a data de término planejada ou não foi possível calcular a quantidade de dias planejados.';
            }
        };
        setRemainingDaysFn(this.globalScope);
        setRemainingDaysFn(this.definedScope);
    }

    _setActualVelocity()
    {
        let globalScopeDatum = this.globalScope.scope;
        let globalScopeDatesDatum = this.globalScope.dates;
        let definedScopeDatesDatum = this.definedScope.dates;
        this.resume.actualVelocity.value = 0;


        let hasAtLeastOneFinishedCard = FunctionHelper.isDefined(globalScopeDatum.finished.value) && globalScopeDatum.finished.value > 0;
        let hasAtLeastOneStartExecutionDate = FunctionHelper.isDefined(definedScopeDatesDatum.startExecution);
        let canCalculateActualVelocity = hasAtLeastOneFinishedCard && hasAtLeastOneStartExecutionDate;
        if (canCalculateActualVelocity)
        {
            let dateToComputeExecutionPeriod = FunctionHelper.isDefined(globalScopeDatesDatum.endExecution) ? globalScopeDatesDatum.endExecution : new Date();
            let qntExecutionDays = FunctionHelper.diffBetweenStartDayAndEndDay(definedScopeDatesDatum.startExecution, dateToComputeExecutionPeriod);
            globalScopeDatesDatum.qntExecutionDays = qntExecutionDays;
            definedScopeDatesDatum.qntExecutionDays = qntExecutionDays;
            this.resume.actualVelocity.value = (qntExecutionDays > 0) ? _.round(_.divide(globalScopeDatum.finished.value, qntExecutionDays), 2) : 0;
        }
        else
        {
            this.resume.actualVelocity.comment = 'Não foi possível calcular a velocidade atual, pois: ';
            if (!hasAtLeastOneFinishedCard)
            {
                 this.resume.actualVelocity.comment += '\n\t(-) é necessário ao menos ter um  item finalizado; ';
            }
            if (!hasAtLeastOneStartExecutionDate)
            {
                this.resume.actualVelocity.comment += '\n\t(-) é necessário que o primeiro item possua data de início de execução preenchida; ';
            }
        }
    }

    _setExpectedVelocity()
    {
        const setVelocityFn = (scopeDatum) =>
        {
            let scope = scopeDatum.scope;
            let remainingDaysDatum = scopeDatum.remainingDays;
            let velocityToFinishScopeDatum = scopeDatum.velocityToFinish;

            let hasRemainingDays = remainingDaysDatum.value > 0;
            let hasRemaningScope = scope.remaining.value > 0;

            if (hasRemainingDays && hasRemaningScope)
            {
                ////Tamanho Escopo NaoRealizado em Relação ao Planejado / Dias Restantes
                velocityToFinishScopeDatum.value = _.round(_.divide(scope.remaining.value, remainingDaysDatum.value), 1);
                velocityToFinishScopeDatum.percentual = FunctionHelper.getComparativePercentual(velocityToFinishScopeDatum.value, this.resume.actualVelocity.value, 2);
                velocityToFinishScopeDatum.status = this._getVelocityStatus(velocityToFinishScopeDatum.percentual);
                if (FunctionHelper.isUndefined(velocityToFinishScopeDatum.percentual) && (FunctionHelper.isUndefined(this.resume.actualVelocity.value) || this.resume.actualVelocity.value === 0))
                {
                    velocityToFinishScopeDatum.comment = 'Percentual da vazão esperada em relação a vazão atual não calculado, pois a vazão atual não foi calculada.';
                }
            }
            else
            {
                velocityToFinishScopeDatum.comment = 'Não foi possível calcular a vazão esperada para conclusão, pois: ';
                if (!hasRemainingDays)
                {
                    velocityToFinishScopeDatum.comment += '\n\t(-) o prazo encontra-se expirado; ';
                    velocityToFinishScopeDatum.status = Status.veryBad;
                }
                if (!hasRemaningScope)
                {
                    velocityToFinishScopeDatum.comment += '\n\t(-) todo o escopo encontra-se concluído ou nenhum escopo foi definido ainda; ';
                }
            }
        };
        setVelocityFn(this.globalScope);
        setVelocityFn(this.definedScope);
    }

    _setForecast()
    {
        const setForecastFn = (scope) =>
        {
            let scopeDatum = scope.scope;
            let forecastToFinishScopeDatum = scope.forecastToFinish;
            let remainingDaysForEndScopeDatum = scope.remainingDays;
            let actualVelocity = this.resume.actualVelocity.value;

            let isActualVelocityCalculated = FunctionHelper.isDefined(actualVelocity) && actualVelocity > 0;
            let hasRemainingScope = scopeDatum.remaining.value > 0;

            let canCalculateForeCast = isActualVelocityCalculated && hasRemainingScope;
            if (canCalculateForeCast)
            {
                forecastToFinishScopeDatum.value = Math.trunc(_.divide(scopeDatum.remaining.value, actualVelocity));
                if (remainingDaysForEndScopeDatum.value > 0)
                {
                    forecastToFinishScopeDatum.percentual = FunctionHelper.getComparativePercentual(forecastToFinishScopeDatum.value, remainingDaysForEndScopeDatum.value, 2);
                    forecastToFinishScopeDatum.status = this._getForecastStatus(forecastToFinishScopeDatum.percentual);
                }
                else
                {
                    forecastToFinishScopeDatum.percentual = 0;
                    forecastToFinishScopeDatum.status = Status.veryBad;
                }
            }
            else
            {
                forecastToFinishScopeDatum.comment = 'Previsão não calculada, pois: ';
                if (!isActualVelocityCalculated)
                {
                    forecastToFinishScopeDatum.comment += '\n\t(-) não foi possível calcular a vazão atual. É necessário que ao menos um item tenha sido finalizado.;';
                }
                if (!hasRemainingScope)
                {
                    forecastToFinishScopeDatum.comment += '\n\t(-) todo escopo já foi executado;';
                }
            }
        };
        setForecastFn(this.globalScope);
        setForecastFn(this.definedScope);
    }

    _setErrors()
    {
        let cardTitle = this._card.title;
        if (FunctionHelper.isUndefined(this._card.startExecutionDate) &&
            (this.globalScope.scope.started.value > 0 ||
            this.globalScope.scope.finished.value > 0 ||
            this.definedScope.scope.finished.value > 0 ||
            this.definedScope.scope.started.value > 0
        ))
        {
            this.errors.isStartExecutionBlankWithStartExecutionScope.value = true;
            this.errors.isStartExecutionBlankWithStartExecutionScope.msg = 'Cartão iniciado sem data de início preenchida';
            this.errors.messages.push(`Cartão ${cardTitle} iniciado sem data de início de execução preenchida (Início Sugerido: ${FunctionHelper.formatDate(this.globalScope.dates.startExecution, 'DD/MM/YYYY', '')})`);
        }

        if (FunctionHelper.isUndefined(this._card.endExecutionDate)
        && (
            this.globalScope.scope.finished.percentual >= 100 ||
            this.definedScope.scope.finished.percentual >= 100
        ))
        {
            this.errors.isEndExecutionBlankWithAllFinishedScope.value = true;
            this.errors.isEndExecutionBlankWithAllFinishedScope.msg = 'Cartão finalizado sem data de término preenchida';
            let message = `Cartão ${cardTitle} finalizado sem data de término de execução preenchida.`;
            if (FunctionHelper.isDefined(this.globalScope.dates.endExecution))
            {
                message += `(Término Sugerido: ${FunctionHelper.formatDate(this.globalScope.dates.endExecution, 'DD/MM/YYYY', '')})`;
            }
            this.errors.messages.push(message);
        }

        if (FunctionHelper.isDefined(this.globalScope.dates.endPlanning) && FunctionHelper.isDefined(this.definedScope.dates.endPlanning))
        {
            if (this.globalScope.dates.endPlanning < this.definedScope.dates.endPlanning)
            {
                this.errors.messages.push(`A data de término planejada do cartão ${cardTitle} [${FunctionHelper.formatDate(this.globalScope.dates.endPlanning, 'DD/MM/YYYY', '')}] é menor que a última data de término planejada dos cartões conectados finalzado [${FunctionHelper.formatDate(this.definedScope.dates.endPlanning, 'DD/MM/YYYY', '')}]`);
            }
        }

        if (FunctionHelper.isDefined(this.globalScope.dates.endExecution) && FunctionHelper.isDefined(this.definedScope.dates.endExecution))
        {
            if (this.globalScope.dates.endExecution < this.definedScope.dates.endExecution)
            {
                this.errors.messages.push(`A data de término de execução do cartão ${cardTitle} [${FunctionHelper.formatDate(this.globalScope.dates.endExecution, 'DD/MM/YYYY', '')}] é menor que a última data de término de execução dos cartões conectados finalzado [${FunctionHelper.formatDate(this.definedScope.dates.endExecution, 'DD/MM/YYYY', '')}]`);
            }
        }
        if (FunctionHelper.isDefined(this.globalScope.dates.endExecution) && this.globalScope.scope.finished.percentual < 100)
        {
            this.errors.messages.push(`A data de término de execução do cartão ${cardTitle} [${FunctionHelper.formatDate(this.globalScope.dates.endExecution, 'DD/MM/YYYY', '')}] foi preenchida, entretanto o escopo não foi entregue por completo [${this.globalScope.scope.finished.percentual}%]`);
        }

        if (this._card.grandChildrenCardsBasedCalculation)
        {
            let lastVisitedMetric = null;
            for (let connectedCard of this._connections)
            {
                const connectedMetric = new CardEntity(connectedCard).getConnectedMetricTitle();
                if (FunctionHelper.isDefined(connectedMetric) && FunctionHelper.isUndefined(lastVisitedMetric))
                {
                     lastVisitedMetric = connectedMetric;
                }
                else if (lastVisitedMetric !== connectedMetric)
                {
                    this.errors.messages.push('Os cartões conectados não possuem a mesma métrica definida. Favor ajustar as métricas');
                    break;
                }
            }
        }
    }
}

module.exports = Statistic;
