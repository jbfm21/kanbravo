import React, {Component, PropTypes} from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import {default as ResumeChart} from './ResumeChart.jsx';

import {Panel, Cards} from '../../../../../../components';
import {FunctionHelper} from '../../../../../../commons';
import {ErrorWidged} from '../../components';

import {default as CardStatisticWidged} from './CardStatisticWidged.jsx';
import {default as ScopeWidged} from './ScopeWidged.jsx';
import {default as GlobalStatusWidged} from './GlobalStatusWidged.jsx';

const messages = defineMessages(
{
    globalStatusTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusTitle', description: '', defaultMessage: 'Situação'},
    definedScopeTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusTitle', description: '', defaultMessage: 'Escopo Definido'},
    globalScopeTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusTitle', description: '', defaultMessage: 'Escopo Global'},
    grandChildrenScopeTitle: {id: 'modal.cardForm.connectionTab.resumeTab.globalStatusTitle', description: '', defaultMessage: 'Sit. 3° nível'}
});

class ResumeTab extends Component
{
    static displayName = 'ResumeTab';

    static propTypes =
    {
        statisticManager: PropTypes.object.isRequired,
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.widgedStyle = {
           widgedTitle:
           {
               value: {fontSize: '16px', fontWeight: 'bold', textAlign: 'center'},
               label: {fontSize: '10px', textAlign: 'center'}
           }
       };
    }

    render()
    {
        let {statisticManager, card} = this.props;
        let {formatMessage} = this.props.intl;
        let cardStatistic = statisticManager.getStatistic(card);

        let grandChildrenStatistic = statisticManager.grandChildrenStatistic;

        const chartStyle = {width: '600px', height: '400px'};

        return (
            <div style={{marginTop: '2px'}}>
                <ErrorWidged statisticManager={statisticManager}/>
                <Cards style={{marginTop: '2px', marginBottom: '0px'}}>
                    <GlobalStatusWidged isToShowIntermediateProgressBar={true} statisticManager={statisticManager} cardStatistic={cardStatistic} title={formatMessage(messages.globalStatusTitle)}/>
                    <ScopeWidged cardStatistic={cardStatistic} scopeDatum={cardStatistic.definedScope} title={formatMessage(messages.definedScopeTitle)} widgedStyle={this.widgedStyle} />
                    <ScopeWidged cardStatistic={cardStatistic} scopeDatum={cardStatistic.globalScope} title={formatMessage(messages.globalScopeTitle)} widgedStyle={this.widgedStyle} />
                    <CardStatisticWidged cardStatistic={cardStatistic} widgedStyle={this.widgedStyle}/>
                </Cards>
                {FunctionHelper.isDefined(grandChildrenStatistic) && <Cards style={{marginTop: '5px', marginBottom: '0px'}}>
                    <GlobalStatusWidged isToShowIntermediateProgressBar={false} statisticManager={statisticManager} cardStatistic={grandChildrenStatistic} title={formatMessage(messages.grandChildrenScopeTitle)}/>
                    <ScopeWidged cardStatistic={grandChildrenStatistic} scopeDatum={grandChildrenStatistic.definedScope} title={formatMessage(messages.definedScopeTitle)} widgedStyle={this.widgedStyle} />
                    <ScopeWidged cardStatistic={grandChildrenStatistic} scopeDatum={grandChildrenStatistic.globalScope} title={formatMessage(messages.globalScopeTitle)} widgedStyle={this.widgedStyle} />
                    <CardStatisticWidged cardStatistic={grandChildrenStatistic} widgedStyle={this.widgedStyle}/>
                </Cards>}
                <Panel style={{width: '100%', height: chartStyle.height, display: 'flex'}}>
                    <Panel style={{width: chartStyle.width, height: 'inherit', display: 'inherit'}}>
                        <ResumeChart statistic={cardStatistic} />
                    </Panel>
                    <Panel isToRender={FunctionHelper.isDefined(grandChildrenStatistic)} style={{width: chartStyle.width, height: chartStyle.height, display: 'flex'}}>
                        <ResumeChart statistic={grandChildrenStatistic} />
                    </Panel>
                </Panel>
            </div>
        );
    }
}

module.exports = injectIntl(ResumeTab, {withRef: true});
