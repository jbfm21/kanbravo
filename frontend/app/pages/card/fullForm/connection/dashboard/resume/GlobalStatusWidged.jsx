import React, {Component, PropTypes} from 'react';
import {Card, Content, Header, Label} from 'react-semantify';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {Description, Meta, Statistics, Float, BasicProgress, ProgressBar, Panel} from '../../../../../../components';
import {DashboardHelper} from '../../components';

import {default as StatisticInfoWidged} from './StatisticInfoWidged.jsx';
import {default as ScopeProgressBar} from './ScopeProgressBar.jsx';

const messages = defineMessages(
{
    velocityTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusWidged.velocityTitle', description: '', defaultMessage: 'Vazão ({metric})'},
    velocityAltText: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusWidged.velocityAltText', description: '', defaultMessage: 'Vazão atual: {velocity} {metric}/{period} \n\n {comment}'},
    overflowTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusWidged.overflowTitle', description: '', defaultMessage: 'Excedente'},
    overflowAltText: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusWidged.overflowAltText', description: '', defaultMessage: 'Escopo detalhado a mais que o planejado: {overflow} {metric}'}
});


class GlobalStatusWidged extends Component
{
    static propTypes =
    {
        widgedStyle: PropTypes.object,
        cardStatistic: PropTypes.object.isRequired,
        statisticManager: PropTypes.object.isRequired,
        title: PropTypes.string,
        intl: intlShape.isRequired,
        isToShowIntermediateProgressBar: PropTypes.bool
    };

    _renderScopeProgressBar = (sm, cs) =>
    {
        let {isToShowIntermediateProgressBar} = this.props;
        const style = {
            descriptionContainer: {margin: '0px', height: '50px', marginTop: '20px'},
            descriptionPanel: {display: 'flex', minWidth: '250px'},
            noGrandChildrenCardsBasedCalculationProgressBar: {container: {width: '100%', height: '18px', borderRadius: '0px', fontSize: '12px'}, progressBar: {fontSize: 'inherit'}},
            granChildrenProgress: {fontSize: 'inherit', borderRight: '1px solid white'},
            granChildrenInnerProgress: {container: {width: '100%', height: '21px', borderRadius: '0px', borderTop: '1px solid white', fontSize: '10px'}, progressBar: {fontSize: 'inherit'}}
        };

        const altText = DashboardHelper.getScopeAltText(cs);
        if (!sm.isGrandChildrenCardsBasedCalculationAndHasDefinedScope() || !isToShowIntermediateProgressBar)
        {
            return (
                <Description style={style.descriptionContainer}>
                    <Panel style={style.descriptionPanel} title={altText}>
                        <ScopeProgressBar scope={cs.globalScope.scope} widgedStyle={style.noGrandChildrenCardsBasedCalculationProgressBar}/>
                    </Panel>
                </Description>
            );
        }

        const grandChildrenScopes = sm.getGrandChildrenFinishedPercentual();
        const totalFinishedPercentual = sm.getGrandChildrenGlobalTotalFinishedPercentual();
        const {notStarted, started, finished, notDefined} = cs.globalScope.scope;
        const notFinishedProgressBarLabel = totalFinishedPercentual === 0 ? '0%' : '';
        return (
            <Description style={style.descriptionContainer}>
                <Panel style={style.descriptionPanel} title={altText}>
                    <BasicProgress style={{width: '100%', height: '40px', marginBottom: '0px', borderRadius: '0px', fontSize: '12px', margin: '0px'}}>
                        <ProgressBar className="progress-bar-finished" percent={finished.percentual} style={style.granChildrenProgress}>
                            {finished.percentual}%
                            {isToShowIntermediateProgressBar && <ScopeProgressBar scope={grandChildrenScopes.finished} widgedStyle={style.granChildrenInnerProgress}/>}
                        </ProgressBar>
                        <ProgressBar className="progress-bar-started" percent={started.percentual} style={style.granChildrenProgress}>
                            {started.percentual}%
                            {isToShowIntermediateProgressBar && <ScopeProgressBar scope={grandChildrenScopes.started} widgedStyle={style.granChildrenInnerProgress}/>}
                        </ProgressBar>
                        <ProgressBar className="progress-bar-notStarted" percent={notStarted.percentual} style={style.granChildrenProgress}>
                            {notStarted.percentual}%
                            {isToShowIntermediateProgressBar && <ScopeProgressBar scope={grandChildrenScopes.notStarted} widgedStyle={style.granChildrenInnerProgress}/>}
                        </ProgressBar>
                        <ProgressBar className="progress-bar-notDetailed" show="percent" percent={notDefined.percentual} style={style.granChildrenProgress}/>
                    </BasicProgress>
                </Panel>
                {isToShowIntermediateProgressBar && <Panel style={style.descriptionPanel}>
                    <BasicProgress style={{width: '100%', height: '18px', borderRadius: '0px', fontSize: '10px', marginBottom: '0px', borderTop: '1px solid white', borderRight: '1px solid white'}}>
                        <ProgressBar className="progress-bar-finished" show="percent" percent={totalFinishedPercentual} style={{fontSize: 'inherit'}}/>
                        <ProgressBar show="labelOnly" label={notFinishedProgressBarLabel} percent={100 - totalFinishedPercentual} style={{fontSize: 'inherit'}}/>
                    </BasicProgress>
                </Panel>}
            </Description>
        );
    }

    render()
    {
        const {statisticManager, cardStatistic, title} = this.props;
        const {formatMessage} = this.props.intl;
        const connectionMetricTitle = cardStatistic.getConnectionMetricTitle();
        const periodTitle = DashboardHelper.getPeriodTitle(cardStatistic.resume.period);
        const actualVelocity = cardStatistic.resume.actualVelocity;
        const {overflow} = cardStatistic.globalScope.scope;
        const textSituation = DashboardHelper.getSituationTitle(cardStatistic);
        const hasOverflowScope = overflow.value > 0;

        const statisticWidgedStyle = {
            statistic: {marginRight: '10px', textAlign: 'center'},
            metaInfoLabel: {fontSize: '10px', textAlign: 'inherit'},
            valueLabel: {textAlign: 'inherit'},
            titleLabel: {textAlign: 'inherit'}
        };


        return (
            <Card style={{border: '1px solid black', boxShadow: null, width: '450px', marginTop: '0px', marginBottom: '0px'}}>
                <Content style={{display: 'inline'}}>
                    <Float className="right" style={{textAlign: 'center'}} >
                        <Label className={textSituation.color} style={{fontSize: '16px', padding: '7px', fontFamily: 'monospace'}}>{textSituation.title}</Label>
                        <Meta style={{fontSize: '13px'}}>{textSituation.subtitle}</Meta>
                    </Float>
                    <Header style={{display: 'inline'}}>
                        {title}
                    </Header>
                    {this._renderScopeProgressBar(statisticManager, cardStatistic)}
                </Content>
                <Content>
                    <Statistics className="three mini" style={{fontSize: '10px'}}>
                        <StatisticInfoWidged
                            title={formatMessage(messages.velocityTitle, {metric: `${connectionMetricTitle}/${periodTitle}`})}
                            value={actualVelocity.value || '-'}
                            altText={formatMessage(messages.velocityAltText, {velocity: actualVelocity.value || '-', metric: connectionMetricTitle, period: periodTitle, comment: actualVelocity.comment || ''})}
                            widgedStyle={statisticWidgedStyle}
                        />
                        <StatisticInfoWidged isToRender={hasOverflowScope}
                            title={formatMessage(messages.overflowTitle)}
                            value={`${overflow.percentual}%`}
                            altText={formatMessage(messages.overflowAltText, {overflow: overflow.value, metric: connectionMetricTitle})}
                            widgedStyle={statisticWidgedStyle}
                        />
                    </Statistics>
                </Content>
            </Card>
        );
    }
}

module.exports = injectIntl(GlobalStatusWidged);
