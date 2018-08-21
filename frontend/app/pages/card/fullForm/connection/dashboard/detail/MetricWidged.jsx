import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import {Content} from 'react-semantify';
import {CardExecutionStatus} from '../../../../../../enums';

class MetricStatistic extends Component
{
    static displayName = 'MetricStatistic';

    static propTypes =
    {
        card: PropTypes.any.isRequired,
        statisticManager: PropTypes.any.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    render()
    {
        let {statisticManager, card} = this.props;
        let statistic = statisticManager.getStatistic(card);

        let itemsToRender = [];
        let listOfUsedMetrics = statistic.listOfUsedMetrics;
        _.forEach(listOfUsedMetrics, (metricTitle) =>
        {
            let metricValues = statistic.getMetricPercentual(metricTitle);

            let notStartedAlternativeText = 'Cartões não iniciados: \n' + _.join(_.map(statistic.listCardsFilterByMetricAndStatus(CardExecutionStatus.notStarted.name, metricTitle), item => `${item.title} (${item.metricValue} ${metricTitle})`), '\n');
            let startedAlternativeText = 'Cartões iniciados: \n' + _.join(_.map(statistic.listCardsFilterByMetricAndStatus(CardExecutionStatus.started.name, metricTitle), item => `${item.title} (${item.metricValue} ${metricTitle})`), '\n');
            let finishedAlternativeText = 'Cartões finalizados: \n' + _.join(_.map(statistic.listCardsFilterByMetricAndStatus(CardExecutionStatus.finished.name, metricTitle), item => `${item.title} (${item.metricValue} ${metricTitle})`), '\n');
            itemsToRender.push(
                <div key={metricTitle} style={{display: 'flex', height: '22px'}}>
                    <span style={{fontSize: '12px', color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', width: '100px'}}>{metricValues.total.total} {metricTitle}</span>
                    <div className="progress" style={{width: '100%', height: '20px'}}>
                        <div className="progress-bar progress-bar-finished" style={{width: `${metricValues.finished.percentual}%`}} title={finishedAlternativeText}>
                            {metricValues.finished.total} ({metricValues.finished.percentual}%)
                        </div>
                        <div className="progress-bar progress-bar-started" style={{width: `${metricValues.started.percentual}%`}} title={startedAlternativeText}>
                            {metricValues.started.total} ({metricValues.started.percentual}%)
                        </div>
                        <div className="progress-bar progress-bar-notStarted" style={{width: `${metricValues.notStarted.percentual}%`}} title={notStartedAlternativeText}>
                            {metricValues.notStarted.total} ({metricValues.notStarted.percentual}%)
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <Content style={{marginTop: '15px'}}>
                <h4 className="ui horizontal divider header">Resumo das métricas utilizadas</h4>
                {itemsToRender}
            </Content>
        );
    }
}

module.exports = MetricStatistic;
