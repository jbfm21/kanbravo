import React, {Component, PropTypes} from 'react';
import {Card, Content, Header} from 'react-semantify';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

import {Meta, Statistics, Float} from '../../../../../../components';
import {FunctionHelper} from '../../../../../../commons';

import {DashboardHelper} from '../../components';


import {default as StatisticInfoWidged} from './StatisticInfoWidged.jsx';

const messages = defineMessages(
{
    finishedLabel: {id: 'modal.cardForm.connectionTab.resumeTab.scopedWidged.finishedLabel', description: '', defaultMessage: 'concluído'},
    finishedMetaValue: {id: 'modal.cardForm.connectionTab.resumeTab.scopedWidged.finishedMetaValue', description: '', defaultMessage: '{finished} de {total} {metricTitle}'},
    remainingDaysTitle: {id: 'modal.cardForm.connectionTab.resumeTab.scopedWidged.remainingDaysTitle', description: '', defaultMessage: 'Dias previsto'},
    expectedVelocityTitle: {id: 'modal.cardForm.connectionTab.resumeTab.scopedWidged.expectedVelocityTitle', description: '', defaultMessage: 'Cad. esperada'}
});

class ScopeWidged extends Component
{
    static propTypes =
    {
        widgedStyle: PropTypes.object,
        cardStatistic: PropTypes.object.isRequired,
        scopeDatum: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        intl: intlShape.isRequired
    };

    render()
    {
        const {cardStatistic, scopeDatum, title, widgedStyle} = this.props;
        const {scope, remainingDays, velocityToFinish, forecastToFinish, deliveryStatus} = scopeDatum;
        const {formatMessage} = this.props.intl;
        const connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        const qntFinished = scope.finished.value;
        const qntFinishedPercentual = scope.finished.percentual || 0;
        const qntTotal = scope.total.value;
        const isFinished = scope.isFinished;

        const velocityToFinishInfoToRender = DashboardHelper.getVelocityToFinishInfoToRender(deliveryStatus, velocityToFinish);

        const style = {
            statistic: {marginRight: '10px', textAlign: 'center'},
            valueLabel: {padding: '2px', fontSize: 'inherit', textAlign: 'inherit'},
            titleLabel: {fontSize: 'inherit', textAlign: 'inherit'},
            metaInfoLabel: {fontSize: '10px'}
        };

        return (
            <Card style={{border: '1px solid black', boxShadow: null, width: '215px', fontSize: '12px', marginTop: '0px', marginBottom: '0px'}}>
                <Content style={{display: 'inline'}}>
                    <Float className="right" title={DashboardHelper.getFinishedAltText(cardStatistic, scopeDatum)}>
                        <div style={widgedStyle.widgedTitle.value}>{qntFinishedPercentual}%</div>
                        <div style={widgedStyle.widgedTitle.label}><FormattedMessage {...messages.finishedLabel}/></div>
                    </Float>
                    <Header style={{display: 'inline'}}>{title}</Header>
                    <Meta><FormattedMessage {...messages.finishedMetaValue} values={{finished: qntFinished || '0', total: qntTotal || '0', metricTitle: connectionMetricTitle}}/></Meta>
                </Content>
                <Content>
                    <Statistics className="three mini" style={{fontSize: '11px'}}>
                        <StatisticInfoWidged
                            isToRender={FunctionHelper.isDefined(DashboardHelper.getDeliveryStatusTitle(remainingDays, deliveryStatus))}
                            title={DashboardHelper.getDeliveryStatusTitle(remainingDays, deliveryStatus)}
                            value={FunctionHelper.isDefined(DashboardHelper.getRemaingDayValue(remainingDays)) ? DashboardHelper.getRemaingDayValue(remainingDays) : '-'}
                            isToRenderMeta={FunctionHelper.isDefined(remainingDays.percentual) && remainingDays.percentual !== 0}
                            meta={`${remainingDays.percentual}%`}
                            altText={remainingDays.comment}
                            valueClassName={DashboardHelper.getStatusColor(remainingDays.status)} widgedStyle={style}
                        />
                        <StatisticInfoWidged isToRender={!isFinished}
                            title={formatMessage(messages.remainingDaysTitle)}
                            value={forecastToFinish.value || '-'}
                            isToRenderMeta={FunctionHelper.isDefined(forecastToFinish.percentual) && forecastToFinish.percentual > 0}
                            meta={`${forecastToFinish.percentual}%`}
                            altText={DashboardHelper.getForecastAltText(cardStatistic, scopeDatum)}
                            valueClassName={DashboardHelper.getStatusColor(forecastToFinish.status)} widgedStyle={style}
                        />
                        <StatisticInfoWidged isToRender={!isFinished}
                            title={formatMessage(messages.expectedVelocityTitle)}
                            value={velocityToFinishInfoToRender.label}
                            meta={velocityToFinishInfoToRender.meta}
                            altText={DashboardHelper.getVelocityToFinishAltText(cardStatistic, scopeDatum)}
                            valueClassName={DashboardHelper.getStatusColor(velocityToFinish.status)} widgedStyle={style}
                        />
                    </Statistics>
                </Content>
            </Card>
        );
    }
}

module.exports = injectIntl(ScopeWidged);
