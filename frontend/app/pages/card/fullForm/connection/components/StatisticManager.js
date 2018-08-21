//TODO: alguns codigos estao replicados com calendarlayouthelper
'use strict';
import _ from 'lodash';
import {default as Statistic} from './Statistic';
import {FunctionHelper} from '../../../../../commons';

class StatisticManager
{
    constructor (card, connections)
    {
        this._card = card;
        this._connections = connections;
        this.statistics = {};
        this.statistics[this._card._id] = new Statistic(card, connections);
        this.grandChildrenStatistic = null;

        let scopedCards = [];
        let totalMetricValue = 0;
        let definedMetric = null;
        if (this._card.grandChildrenCardsBasedCalculation)
        {
            _.forEach(connections, (connection) =>
            {
                let connectionChildrens = FunctionHelper.isDefined(connection.children) ? connection.children : [];
                this.statistics[connection._id] = new Statistic(connection, connectionChildrens);
                scopedCards.push(...this.statistics[connection._id].scopeCards);
                totalMetricValue += this.statistics[connection._id].globalScope.scope.total.value;
                if (FunctionHelper.isUndefined(definedMetric))
                {
                    definedMetric = this.statistics[connection._id].connectionMetric;
                }
            });
            if (scopedCards.length > 0)
            {
                this.grandChildrenStatistic = new Statistic({title: 'grandChildrenStatistic', metricValue: totalMetricValue, metric: definedMetric}, scopedCards);
            }
        }
    }

    isGrandChildrenCardsBasedCalculationAndHasDefinedScope()
    {
        return this._card.grandChildrenCardsBasedCalculation && FunctionHelper.isDefined(this.grandChildrenStatistic);
    }

    getAllErrors()
    {
        let result = [];
        _.forOwn(this.statistics, function(value, key) //eslint-disable-line
        {
            result.push(...value.errors.messages);
        });
        return result;
    }

    getChildrenStatistic()
    {
        let result = [];
        let that = this;
        _.forOwn(this.statistics, function(value, key)
        {
            if (key !== that._card._id)
            {
                result.push(value);
            }
        });
        return result;
    }

    getCurrentStatistic()
    {
        return this.statistics[FunctionHelper.getId(this._card)];
    }

    getStatistic(card)
    {
        return this.statistics[FunctionHelper.getId(card)];
    }


    getGrandChildrenGlobalTotalFinishedPercentual()
    {
        //TODO; rever o pq nao esta utilizando o campo this.grandChildrenStatistic e sim calcuando tudo de novo
        let {notStarted, started, finished} = this.getStatistic(this._card).globalScope.scope;
        let grandChildrenScopes = this.getGrandChildrenFinishedPercentual(); //TODO: Fazer cache
        let totalFinishedPercentual = finished.percentual;
        if (grandChildrenScopes.started.finished.value > 0)
        {
            totalFinishedPercentual += FunctionHelper.inverseRuleOfThree(grandChildrenScopes.started.finished.percentual, started.percentual);
        }
        if (grandChildrenScopes.notStarted.finished.value > 0)
        {
            totalFinishedPercentual += FunctionHelper.inverseRuleOfThree(grandChildrenScopes.notStarted.finished.percentual, notStarted.percentual);
        }
        return totalFinishedPercentual;
    }

    getGrandChildrenFinishedPercentual() //TODO: Fazer cache
    {
        //TODO; rever o pq nao esta utilizando o campo this.grandChildrenStatistic e sim calcuando tudo de novo
        return {
            finished: this._getGrandChildrenFinishedPercentual('finished'),
            started: this._getGrandChildrenFinishedPercentual('started'),
            notStarted: this._getGrandChildrenFinishedPercentual('notStarted')
        };
    }

    _getGrandChildrenFinishedPercentual(cardStatus)
    {
       let scope = {
                total: {value: 0, percentual: null},
                notStarted: {value: 0, percentual: null},
                started: {value: 0, percentual: null},
                finished: {value: 0, percentual: null},
                notDefined: {value: 0, percentual: null},
                overflow: {value: 0, percentual: null},
                remaining: {value: 0, percentual: null}
        };

        if (this._card.grandChildrenCardsBasedCalculation)
        {
            let cardStatistic = this.statistics[FunctionHelper.getId(this._card)];
            _.forEach(cardStatistic[cardStatus].cards, (connectedCard) =>
            {
                let grandChildrenStatistic = this.getStatistic(connectedCard);
                if (FunctionHelper.isDefined(grandChildrenStatistic))
                {
                    scope.total.value += grandChildrenStatistic.globalScope.scope.total.value;
                    scope.finished.value += grandChildrenStatistic.globalScope.scope.finished.value;
                    scope.started.value += grandChildrenStatistic.globalScope.scope.started.value;
                    scope.notStarted.value += grandChildrenStatistic.globalScope.scope.notStarted.value;
                    scope.notDefined.value += grandChildrenStatistic.globalScope.scope.notDefined.value;
                    scope.overflow.value += grandChildrenStatistic.globalScope.scope.overflow.value;
                    scope.remaining.value += grandChildrenStatistic.globalScope.scope.remaining.value;
                }
            });
        }

        scope.total.percentual = 100;
        scope.finished.percentual = FunctionHelper.getPercentual(scope.finished.value, scope.total.value, 0);
        scope.started.percentual = FunctionHelper.getPercentual(scope.started.value, scope.total.value, 0);
        scope.notStarted.percentual = FunctionHelper.getPercentual(scope.notStarted.value, scope.total.value, 0);
        scope.notDefined.percentual = FunctionHelper.getPercentual(scope.notDefined.value, scope.total.value, 0);
        scope.overflow.percentual = FunctionHelper.getPercentual(scope.overflow.value, scope.total.value, 0);
        scope.remaining.percentual = FunctionHelper.getPercentual(scope.remaining.value, scope.total.value, 0);

        if (scope.notDefined.percentual > 0)
        {
            scope.notDefined.percentual = FunctionHelper.fixPercentual(scope.notDefined.percentual, [scope.notStarted.percentual, scope.started.percentual, scope.finished.percentual, scope.notDefined.percentual]);
        }
        else if (scope.notStarted.percentual > 0)
        {
            scope.notStarted.percentual = FunctionHelper.fixPercentual(scope.notStarted.percentual, [scope.notStarted.percentual, scope.started.percentual, scope.finished.percentual, scope.notDefined.percentual]);
        }
        else if (scope.started.percentual > 0)
        {
            scope.started.percentual = FunctionHelper.fixPercentual(scope.started.percentual, [scope.notStarted.percentual, scope.started.percentual, scope.finished.percentual, scope.notDefined.percentual]);
        }


        return scope;
    }
}

module.exports = StatisticManager;
