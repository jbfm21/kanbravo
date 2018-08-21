import React, {Component, PropTypes} from 'react';
import {Card, Content, Header} from 'react-semantify';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

import {Description, Statistics, Float, BasicProgress, ProgressBar} from '../../../../../../components';
import {default as StatisticInfoWidged} from './StatisticInfoWidged.jsx';

const messages = defineMessages(
{
    finishedLabel: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.finishedLabel', description: '', defaultMessage: 'concluído'},
    cards: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.finishedMetaValue', description: '', defaultMessage: 'Cartões'},
    finishedCardLabel: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.finishedCardLabel', description: '', defaultMessage: 'Finalizados'},
    startedLabel: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.startedLabel', description: '', defaultMessage: 'Em Execução'},
    notStartedLabel: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.notStartedLabel', description: '', defaultMessage: 'Não Iniciado'},
    notStartedCardLateLabel: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.notStartedCardLateLabel', description: '', defaultMessage: 'Início Atrasado'},
    notFinishedCardLate: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.notFinishedCardLate', description: '', defaultMessage: 'Térm. Atrasado'},
    blockedCards: {id: 'modal.cardForm.connectionTab.resumeTab.cardStatisticWidged.blockedCards', description: '', defaultMessage: 'Bloqueados'}
});


export default class CardStatisticWidged extends Component
{
    static propTypes =
    {
        widgedStyle: PropTypes.object,
        cardStatistic: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    render()
    {
        const {cardStatistic, widgedStyle} = this.props;
        const {formatMessage} = this.props.intl;

        const cardScope = cardStatistic.cardScope.scope;
        const {qntNotStartedCardLate, qntNotFinishedCardLate, blockedCards} = cardStatistic.resume;

        const style = {
            valueLabel: {padding: '2px', fontSize: 'inherit', textAlign: 'inherit'},
            titleLabel: {fontSize: 'inherit', textAlign: 'inherit'},
            statistic: {marginRight: '10px', textAlign: 'center'},
            progressBarStyle: {fontSize: 'inherit'}
        };

        return (
            <Card style={{border: '1px solid black', boxShadow: null, fontSize: '12px', marginTop: '0px', marginBottom: '0px'}}>
                <Content style={{display: 'inline'}}>
                    <Float className="right">
                        <div style={widgedStyle.widgedTitle.value}>{cardScope.finished.percentual}%</div>
                        <div style={widgedStyle.widgedTitle.label}><FormattedMessage {...messages.finishedLabel}/></div>
                    </Float>
                    <Header style={{display: 'inline'}}><FormattedMessage {...messages.cards}/></Header>
                    <Description style={{margin: '0px', height: '18px'}}>
                        <div style={{display: 'flex', height: '22px'}}>
                            <BasicProgress style={{width: '100%', height: '18px', borderRadius: '0px', fontSize: '12px'}}>
                                <ProgressBar className="progress-bar-finished" show="percent" percent={cardScope.finished.percentual} style={style.progressBar}/>
                                <ProgressBar className="progress-bar-started" show="percent" percent={cardScope.started.percentual} style={style.progressBar}/>
                                <ProgressBar className="progress-bar-notStarted" show="percent" percent={cardScope.notStarted.percentual} style={style.progressBar}/>
                            </BasicProgress>
                        </div>
                    </Description>
                </Content>
                <Content>
                    <Statistics className="six mini" style={{fontSize: '11px'}}>
                        <StatisticInfoWidged title={formatMessage(messages.finishedCardLabel)} value={cardScope.finished.value} widgedStyle={style}/>
                        <StatisticInfoWidged title={formatMessage(messages.startedLabel)} value={cardScope.started.value} widgedStyle={style}/>
                        <StatisticInfoWidged title={formatMessage(messages.notStartedLabel)} value={cardScope.notStarted.value} isToRender widgedStyle={style}/>
                        <StatisticInfoWidged title={formatMessage(messages.notStartedCardLateLabel)} value={qntNotStartedCardLate} isToRender={qntNotStartedCardLate > 0} widgedStyle={style} valueClassName="red"/>
                        <StatisticInfoWidged title={formatMessage(messages.notFinishedCardLate)} value={qntNotFinishedCardLate} isToRender={qntNotFinishedCardLate > 0} widgedStyle={style} valueClassName="red"/>
                        <StatisticInfoWidged title={formatMessage(messages.blockedCards)} value={blockedCards} isToRender={blockedCards > 0} widgedStyle={style} valueClassName="red" />
                    </Statistics>
                </Content>
            </Card>
        );
    }
}

module.exports = injectIntl(CardStatisticWidged);
