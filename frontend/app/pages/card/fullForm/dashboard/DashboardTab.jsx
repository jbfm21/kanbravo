import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {Grid, Column, Row, Header, Segment} from 'react-semantify';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import * as d3 from 'd3';
import moment from 'moment';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FunctionHelper} from '../../../../commons';
import {Description, LoadServerContent, DonutChart, TimeLineChart, Segments, FormToast} from '../../../../components';
import {default as InformationOnlyAfterCardIsCreated} from '../message/InformationOnlyAfterCardIsCreated.jsx';

import {default as DashboardStore} from './DashboardStore';

//TODO: implementar shouldUpdate

var StateRecord = Immutable.Record({isLoading: false, actionMessage: null, timeSheet: null});

const messages = defineMessages(
{
    effortLabel: {id: 'modal.cardForm.dashboardTab.effort.label', description: 'Dashboard effort label', defaultMessage: 'Esforço'},
    hoursAbreviationLabel: {id: 'modal.cardForm.dashboardTab.hoursAbreviation.label', description: 'Dashboard hoursAbreviation label', defaultMessage: 'hrs'},
    activityDaysLabel: {id: 'modal.cardForm.dashboardTab.activityDays.label', description: 'Dashboard activityDays label', defaultMessage: 'dias trabalhados'},
    continuosDaysLabel: {id: 'modal.cardForm.dashboardTab.continuosDays.label', description: 'Dashboard continuosDays label', defaultMessage: 'dias corridos'}
});

@ImmutableState
@airflux.FluxComponent
class DashboardTab extends Component
{
    static displayName = 'dashboardTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(DashboardStore, this._listenToDashboardStore);
       this.state = {data: new StateRecord()};
    }

    _listenToDashboardStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.timesheet.list.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.cardSetting.timesheet.list.completed:
                this.setImmutableState({timeSheet: store.state.timeSheet, isLoading: false, actionMessage: ''});
                break;
            case KanbanActions.cardSetting.timesheet.list.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;
            default: break;
        }
    }

    _renderHourTimeLineChart()
    {
        const {timeSheet} = this.state.data;
        const {formatMessage} = this.props.intl;

        if (FunctionHelper.isUndefined(timeSheet))
        {
            return null;
        }

        const color = ['#53c79f', '#e58c72', '#7a6fca', '#ca6f96', '#64b0cc', '#e5c072'];

        let dataChart = d3.nest()
                .key(d => `${d.user.givenname} ${d.user.surname}`)
                .rollup(v => d3.sum(v, d => d.minutes))
                .entries(timeSheet);

        let totalHours = d3.nest().rollup(v => d3.sum(v, d => d.minutes)).entries(timeSheet);
        totalHours = FunctionHelper.formatMinutesToHourAndMinutes(totalHours);

        let totalOfActivityDays = d3.map(timeSheet, d => moment(d.startDate).format('DD/MM/YYYY')).size();
        let startWorkingDate = moment(d3.min(timeSheet, d => moment(d.startDate)));
        var totalContinuousDays = moment().diff(startWorkingDate, 'days');

        return (
            <DonutChart id="bs_chart" data={dataChart} color={color} height={300} width={500} enable3d innerRadiusRatio={3} label="key" point="value">
                <legend radius={10}></legend>
                <label formatter={FunctionHelper.formatMinutesToHourAndMinutes}></label>
                <innerLabel fill={'black'} y="0" fontSize={'30px'}>{totalHours} {formatMessage(messages.hoursAbreviationLabel)}</innerLabel>
                <innerLabel fill={'black'} y="25" fontSize={'15px'}>{totalOfActivityDays} {formatMessage(messages.activityDaysLabel)}</innerLabel>
                <innerLabel fill={'black'} y="40" fontSize={'15px'}>{totalContinuousDays} {formatMessage(messages.continuosDaysLabel)}</innerLabel>
            </DonutChart>
        );

    }

    _renderTotalHourByUserPieChart()
    {
        let {timeSheet} = this.state.data;
        if (FunctionHelper.isUndefined(timeSheet))
        {
            return null;
        }

        var parseDate = d3.timeParse('%m-%d-%Y');

        let dataChart = d3.nest()
                .key(d => moment(d.startDate).format('MM-DD-YYYY'))
                .rollup(v => d3.sum(v, d => d.minutes))
                .entries(timeSheet);
        let data = dataChart.map(item => {return {day: item.key, count: item.value, date: parseDate(item.key)};});

        const margin = {top: 20, right: 30, bottom: 20, left: 50};

        return (
            <TimeLineChart data={data} xData="date" width={500} yData="count" margin={margin} yMaxBuffer={10} id="line-chart">
                <defs>
                    <gradient color1="#fff" color2="#53c79f" id="area"/>
                </defs>
                <yGrid orient="left" className="y-grid" ticks={5}/>
                <xAxis orient="bottom" className="axis" tickFormat="%d/%m" ticks={10}/>
                <yAxis orient="left" className="axis" ticks={5}/>
                <area className="area" fill="url(#area)"/>
                <path className="line shadow" strokeLinecap="round"/>
                <dots r="5" removeFirstAndLast={false}/>
                <tooltip textStyle1="tooltip-text1" textStyle2="tooltip-text1" bgStyle="tooltip-bg" keyLabel="Data" keyFormat={(v) => moment(v).format('DD/MM')} valueLabel="Horas" valueFormat={(v) => FunctionHelper.formatMinutesToHourAndMinutes(v)}/>
            </TimeLineChart>
        );
    }

    render()
    {
        let {isLoading, actionMessage} = this.state.data;
        if (FunctionHelper.isUndefined(this.props.card._id))
        {
            return (<InformationOnlyAfterCardIsCreated/>);
        }
        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <LoadServerContent isLoading={isLoading}/>
                <FormToast message={actionMessage} kind={'negative'} />
                <Description style={{marginLeft: '5px', width: '100%'}}>
                    <Grid className="divided form">
                        <Row>
                            <Column className="eight wide">
                                <Segments>
                                    <Segment><Header className="blue">Horas por dia</Header></Segment>
                                    <Segment>
                                        {this._renderHourTimeLineChart()}
                                    </Segment>
                                </Segments>
                            </Column>
                            <Column className="eight wide">
                                <Segments>
                                    <Segment><Header className="blue">Total de Horas</Header></Segment>
                                    <Segment>
                                        {this._renderTotalHourByUserPieChart()}
                                    </Segment>
                                </Segments>
                            </Column>
                        </Row>
                   </Grid>
                </Description>
            </div>
        );
    }
}

module.exports = injectIntl(DashboardTab, {withRef: true});
