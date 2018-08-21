import React from 'react';
import {VictoryAxis, VictoryLine, VictoryLabel, VictoryTooltip, VictoryScatter, VictoryContainer} from 'victory';
import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import {FunctionHelper} from '../../../../../../commons';

const PlanningDateBorderLine = (props) =>
{
    const date = props.date;
    if (FunctionHelper.isUndefined(date))
    {
        return null;
    }
    const datum = [{x: date, y: 0}, {x: date, y: props.totalScope}];
    return (<VictoryLine containerComponent={<VictoryContainer responsive={false}/>} data={datum} domain={props.domain} scale={props.scale} style={props.style} />);
};

const ScopeBorderLine = (props) =>
{
    const minDateDomain = props.domain.x[0];
    const maxDateDomain = props.domain.x[1];
    const datum = [{x: minDateDomain, y: props.totalScope}, {x: maxDateDomain, y: props.totalScope}];
    return (<VictoryLine containerComponent={<VictoryContainer responsive={false}/>} data={datum} domain={props.domain} scale={props.scale} style={props.style} />);
};

const CurrentDateLine = (props) =>
{
    const maxScopeDomain = props.domain.y[1];
    const datum = [{x: props.currentDate, y: 0}, {x: props.currentDate, y: maxScopeDomain}];
    return (<VictoryLine containerComponent={<VictoryContainer responsive={false}/>} data={datum} domain={props.domain} scale={props.scale} style={props.style} />);
};

const ExpectedVelocityLine = (props) =>
{
    const endPlanningDate = props.endPlanningDate;
    if (FunctionHelper.isUndefined(endPlanningDate))
    {
        return null;
    }
    const minDateDomain = props.domain.x[0];
    const datum = [{x: minDateDomain, y: 0}, {x: endPlanningDate, y: props.totalScope}];
    return (<VictoryLine containerComponent={<VictoryContainer responsive={false}/>} data={datum} domain={props.domain} scale={props.scale} style={props.style}/>);
};

const CurrentDateExpectedDeliveryScatter = (props) =>
{
    const _calculateExpectedDeliveryScope = () =>
    {
        const totalScope = props.domain.y[1];
        const totalDays = FunctionHelper.diffBetweenTwoDates(props.domain.x[0], props.domain.x[1]);
        if (totalDays === 0)
        {
            return 0;
        }
        const expectedScopePerDay = totalScope / totalDays;
        const numberOfDaysUntilCurrentDate = FunctionHelper.diffBetweenTwoDates(props.domain.x[0], props.currentDate);
        const currentExpectedDeliverScope = Number((expectedScopePerDay * numberOfDaysUntilCurrentDate).toFixed(0));

        return currentExpectedDeliverScope;
    };
    const endPlanningDate = props.endPlanningDate;
    if (FunctionHelper.isUndefined(endPlanningDate))
    {
        return null;
    }

    const y = Math.min(_calculateExpectedDeliveryScope(), props.domain.y[1]);
    const label = `Dia: ${FunctionHelper.formatDate(props.currentDate, 'DD/MM/YYYY', '')} \n Qntd esperada: ${y}`;
    const data = [{x: props.currentDate, y: y, label: label}];

    return (
        <VictoryScatter key="lineExecutionDate_point"
            labelComponent={<VictoryTooltip style={{fontSize: '10px', maxWidth: '50px', zIndex: 500}}/>}
            containerComponent={<VictoryContainer responsive={false}/>}
            data={data}
            interpolation="monotoneX" scale={props.scale}
            domain={props.domain}
            size={3}
            style={props.style}
        />
    );
};

const CardLine = (props) =>
{
    return (<VictoryLine containerComponent={<VictoryContainer responsive={false}/>} data={props.datum} domain={props.domain} interpolation="monotoneX" scale={props.scale} style={props.style}/>);
};

const CardLineScatter = (props) =>
{
    return (
        <VictoryScatter
            labelComponent={<VictoryTooltip style={{fontSize: '10px', maxWidth: '50px', zIndex: 500}}/>}
            containerComponent={<VictoryContainer responsive={false}/>}
            data={props.datum}
            interpolation="monotoneX" scale={props.scale}
            domain={props.domain}
            size={3}
            style={props.style}
        />
    );
};

export default class ResumeChart extends React.Component
{
    static displayName = 'ResumeChart';

    static propTypes =
    {
        statistic: React.PropTypes.object
    };

    constructor(props)
    {
       super(props);
       this.styles = {
            parent: {background: '#ccdee8', boxSizing: 'border-box', display: 'inline', padding: 0, margin: 20, fontFamily: 'sans-serif', width: '100%', height: 'auto'},
            title: {textAnchor: '"start', verticalAnchor: 'end', fill: '#000000', fontFamily: 'inherit', fontSize: '18px', fontWeight: 'bold'},
            labelNumber: {textAnchor: 'middle', fill: '#ffffff', fontFamily: 'inherit', fontSize: '14px'},

            axisYears: {axis: {stroke: 'black', strokeWidth: 1},
                ticks: {size: (tick) => tick.getDate() === 1 ? 10 : 5, stroke: 'black', strokeWidth: 1},
                tickLabels: {fill: 'black', fontFamily: 'inherit', fontSize: 12}
            },

            axisScope: {grid: {stroke: '#ffffff', strokeWidth: 2},
                axis: {stroke: 'blue', strokeWidth: 0}, ticks: {strokeWidth: 0}, tickLabels: {fill: 'blue', fontFamily: 'inherit', fontSize: 12}
            },

            lineCurrentDate: {data: {stroke: 'black', strokeWidth: 1, strokeDasharray: '5, 5'}},
            lineBorder: {data: {stroke: '#e95f46', strokeWidth: 2}},

            lineConstantCadencyLabel: {fill: 'black', fontFamily: 'inherit', fontSize: 12, fontStyle: 'italic'},
            lineConstantCadency: {data: {stroke: '#000000', strokeWidth: 1}},

            lineExecutionDateLabel: {fill: 'blue', fontFamily: 'inherit', fontSize: 12, fontStyle: 'italic'},
            lineExecutionDate: {data: {stroke: 'blue', strokeWidth: 4.5, opacity: 0.5}},
            lineExecutionDateScatter: {data: {fill: 'blue', fontSize: '10px'}},

            linePlanningDateLabel: {fill: 'red', fontFamily: 'inherit', fontSize: 12, fontStyle: 'italic'},
            linePlanningDate: {data: {stroke: 'red', strokeWidth: 2.0}},
            linePlanningDateScatter: {data: {fill: 'red', fontSize: '10px'}},

            expectedDeliveryScatter: {data: {fill: 'black', fontSize: '10px'}}
        };
    }

    _getMaxDateDomain(cardStatistic, currentDate, plannedCards, finishedCards)
    {
        const maxDateStatisticDate = d3.max(finishedCards.concat(plannedCards), function(item) { return item.x; });
        return FunctionHelper.maxDate(maxDateStatisticDate, cardStatistic.globalScope.dates.endPlanning, currentDate);
    }

    _getPlannedDatesDataSet()
    {
        const accumulativeSum = function (arr)
        {
            const builder = function (acc, n)
            {
                const lastItem = acc.length > 0 ? acc[acc.length - 1] : {key: null, y: 0};
                const x = moment(n.key, 'YYYYMMDD').toDate();
                const y = lastItem.y + n.value;
                const label = `Dia: ${moment(n.key, 'YYYYMMDD').format('DD/MM')} \n Qntd. planejada p/o dia: ${n.value} \n Qntd. acumulada até o dia: ${y}`;
                const newItem = {x: x, y: y, label: label};
                acc.push(newItem);
                return acc;
            };
            return _.reduce(arr, builder, []);
        };

        const plannedCardsWithEndPlanningDates = _(this.props.statistic.scopeCards).filter((c) => FunctionHelper.isDefined(c.endPlanningDate)).sortBy((c) => FunctionHelper.dateOrNull(c.endPlanningDate)).value();
        const data = d3.nest()
            .key(function(d) { return FunctionHelper.getMomentDate(d.endPlanningDate).format('YYYYMMDD');})
            .rollup(function(d) {return d3.sum(d, function(g) {return g.metricValue; });}).entries(plannedCardsWithEndPlanningDates);

        return accumulativeSum(data);
    }

    _getExecutionDataSet()
    {
        const accumulativeSum = function (arr)
        {
            const builder = function (acc, n)
            {
                const lastItem = acc.length > 0 ? acc[acc.length - 1] : {key: null, y: 0};
                const x = moment(n.key, 'YYYYMMDD').toDate();
                const y = lastItem.y + n.value;
                const label = `Dia: ${moment(n.key, 'YYYYMMDD').format('DD/MM')} \n Entregues no dia: ${n.value} | Acumulado: ${y}`;
                const newItem = {x: x, y: y, label: label};
                acc.push(newItem);
                return acc;
            };
            return _.reduce(arr, builder, []);
        };

        const finishedScopedCards = _(this.props.statistic.scopeCards).filter((c) => FunctionHelper.isDefined(c.endExecutionDate)).sortBy((c) => FunctionHelper.dateOrNull(c.endExecutionDate)).value();
        const data = d3.nest()
            .key(function(d) { return FunctionHelper.getMomentDate(d.endExecutionDate).format('YYYYMMDD');})
            .rollup(function(d) {return d3.sum(d, function(g) {return g.metricValue; });}).entries(finishedScopedCards);

        return accumulativeSum(data);
    }

    render()
    {
        const {statistic} = this.props;
        if (FunctionHelper.isUndefined(statistic))
        {
            return null;
        }

        const minDateDomain = FunctionHelper.minDate(statistic.globalScope.dates.startPlanning, statistic.globalScope.dates.startPlanning, statistic.globalScope.dates.startExecution, statistic.definedScope.dates.startExecution);

        if (FunctionHelper.isUndefined(minDateDomain))
        {
            return null;
        }

        const styles = this.styles;
        const scale = {x: 'time', y: 'linear'};

        const finishedCardHistory = this._getExecutionDataSet();
        const plannedCardDataSet = this._getPlannedDatesDataSet();
        const currentDate = (FunctionHelper.isDefined(statistic.globalScope.dates.endExecution)) ? FunctionHelper.getMomentDate(statistic.globalScope.dates.endExecution).toDate() : new Date();

        const maxDateDomain = this._getMaxDateDomain(statistic, currentDate, plannedCardDataSet, finishedCardHistory);
        const maxScopeDomain = statistic.globalScope.scope.total.value + statistic.globalScope.scope.overflow.value;
        const domain = {x: [minDateDomain, maxDateDomain], y: [0, maxScopeDomain]};
        const totalScope = statistic.globalScope.scope.total.value;
        const endPlanningDate = statistic.globalScope.dates.endPlanning ? FunctionHelper.getMomentDate(statistic.globalScope.dates.endPlanning).toDate() : null;

        finishedCardHistory.unshift({x: domain.x[0], y: 0});
        plannedCardDataSet.unshift({x: domain.x[0], y: 0});

        return (
            <svg style={styles.parent} viewBox="0 0 500 350">
                <VictoryLabel x={25} y={25} style={styles.lineConstantCadencyLabel} text={"Fluxo constante"}/>
                <VictoryLabel x={200} y={25} style={styles.linePlanningDateLabel} text={"Planejado acumulado"}/>
                <VictoryLabel x={360} y={25} style={styles.lineExecutionDateLabel} text={"Finalizado acumulado"}/>
                <VictoryAxis containerComponent={<VictoryContainer responsive={false}/>} scale="time" domain={[domain.x[0], domain.x[1]]} style={styles.axisYears}/>,
                <VictoryAxis containerComponent={<VictoryContainer responsive={false}/>} dependentAxis domain={[domain.y[0], domain.y[1]]} orientation="left" style={styles.axisScope} />
                <CurrentDateExpectedDeliveryScatter endPlanningDate={endPlanningDate} currentDate={currentDate} domain={domain} scale={scale} style={styles.expectedDeliveryScatter}/>
                <PlanningDateBorderLine date={minDateDomain} totalScope={totalScope} domain={domain} scale={scale} style={styles.lineBorder}/>
                <PlanningDateBorderLine date={endPlanningDate} totalScope={totalScope} domain={domain} scale={scale} style={styles.lineBorder}/>
                <ScopeBorderLine totalScope={totalScope} domain={domain} scale={scale} style={styles.lineBorder}/>
                <CurrentDateLine currentDate={currentDate} domain={domain} scale={scale} style={styles.lineCurrentDate}/>
                <ExpectedVelocityLine endPlanningDate={endPlanningDate} totalScope={totalScope} domain={domain} scale={scale} style={styles.lineConstantCadency}/>
                <CardLine datum={plannedCardDataSet} domain={domain} scale={scale} style={styles.linePlanningDate}/>
                <CardLineScatter datum={plannedCardDataSet} domain={domain} scale={scale} style={styles.linePlanningDateScatter}/>
                <CardLine datum={finishedCardHistory} domain={domain} scale={scale} style={styles.lineExecutionDate}/>
                <CardLineScatter datum={finishedCardHistory} domain={domain} scale={scale} style={styles.lineExecutionDateScatter}/>
            </svg>
        );
    }
}
