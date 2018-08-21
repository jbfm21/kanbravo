import React, {Component, PropTypes} from 'react';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Content} from 'react-semantify';

import {FunctionHelper} from '../../../../../commons';
import {default as Statistic} from './Statistic';

const messages = defineMessages(
{
    metricLabel: {id: 'modal.cardForm.ManageConnectionTab.metricLabel', description: '', defaultMessage: 'Métrica.'},
    metricValueLabel: {id: 'modal.cardForm.ManageConnectionTab.metricValueLabel', description: '', defaultMessage: 'Valor'},
    metricTypeLabel: {id: 'modal.cardForm.ManageConnectionTab.metricTypeLabel', description: '', defaultMessage: 'Unidade'},
    planningLabel: {id: 'modal.cardForm.ManageConnectionTab.planningLabel', description: '', defaultMessage: 'Planejamento'},
    startDateLabel: {id: 'modal.cardForm.ManageConnectionTab.startDateLabel', description: '', defaultMessage: ' de '},
    endDateLabel: {id: 'modal.cardForm.ManageConnectionTab.endDateLabel', description: '', defaultMessage: ' até '},
    notDefinedValue: {id: 'modal.cardForm.ManageConnectionTab.notDefinedValue', description: '', defaultMessage: 'Qntd. não planejada'},
    overflowValue: {id: 'modal.cardForm.ManageConnectionTab.overflowValue', description: '', defaultMessage: 'Qntd. excendete'}
});

@airflux.FluxComponent
class ResumeTableWidged extends Component
{
    static displayName = 'ResumeTableWidged';

    static propTypes =
    {
        intl: intlShape.isRequired,
        card: PropTypes.object.isRequired,
        connections: PropTypes.any.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    render()
    {
        let {card, connections} = this.props; //eslint-disable-line
        let statistic = new Statistic(card, connections);
        let metricTitle = FunctionHelper.isDefined(statistic.connectionMetric) ? statistic.connectionMetric.title : '-';
        let metricValue = FunctionHelper.isDefined(statistic.connectionMetricValue) ? statistic.connectionMetricValue : '-';

        let notDefinedScopeValue = statistic.globalScope.scope.notDefined.value;
        let overflowScopeValue = statistic.globalScope.scope.overflow.value;

        if (FunctionHelper.isArrayNullOrEmpty(connections))
        {
             return (
                 <div style={{marginTop: '10px'}}>
                    <Content className="k-new-setting" style={{marginBottom: '5px'}}>
                        <table className="ui compact selectable stripped celled table listCardsToConnectTable" style={{fontFamily: 'sans-serif', fontSize: '11px', width: '50%'}}>
                            <thead>
                                <tr>
                                    <th colSpan="2" className="center aligned one wide" style={{padding: '0px'}}>
                                        <FormattedMessage {...messages.planningLabel}/>:
                                        <FormattedMessage {...messages.startDateLabel}/>
                                        {FunctionHelper.formatDate(card.startPlanningDate, 'DD/MMM/YYYY', '--/--/----')}
                                        <FormattedMessage {...messages.endDateLabel}/>
                                        {FunctionHelper.formatDate(card.endPlanningDate, 'DD/MMM/YYYY', '--/--/----')}</th>
                                    <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}>
                                        <FormattedMessage {...messages.metricLabel}/>: {metricValue} {metricTitle}
                                        <span style={{marginLeft: '10px'}}>(<FormattedMessage {...messages.notDefinedValue}/>: {metricValue})</span>
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </Content>
                </div>
            );
        }

        return (
            <div style={{marginTop: '10px'}}>
                <Content className="k-new-setting" style={{marginBottom: '5px'}}>
                    <table className="ui compact selectable stripped celled table listCardsToConnectTable" style={{fontFamily: 'sans-serif', fontSize: '11px', width: '50%'}}>
                        <thead>
                            <tr>
                                <th colSpan="2" className="center aligned one wide" style={{padding: '0px'}}>
                                    <FormattedMessage {...messages.planningLabel}/>:
                                    <FormattedMessage {...messages.startDateLabel}/>
                                    {FunctionHelper.formatDate(card.startPlanningDate, 'DD/MMM/YYYY', '--/--/----')}
                                    <FormattedMessage {...messages.endDateLabel}/>
                                    {FunctionHelper.formatDate(card.endPlanningDate, 'DD/MMM/YYYY', '--/--/----')}</th>
                                <th colSpan="3" className="center aligned one wide" style={{padding: '0px'}}>
                                    <FormattedMessage {...messages.metricLabel}/>: {metricValue} {metricTitle}
                                    {notDefinedScopeValue > 0 && <span style={{marginLeft: '10px'}}>(<FormattedMessage {...messages.notDefinedValue}/>: {notDefinedScopeValue})</span>}
                                    {overflowScopeValue > 0 && <span style={{marginLeft: '10px'}}>(<FormattedMessage {...messages.overflowValue}/>: {overflowScopeValue})</span>}
                                </th>
                            </tr>
                        </thead>
                    </table>
                </Content>
            </div>
        );
    }
}

module.exports = injectIntl(ResumeTableWidged, {withRef: true});

