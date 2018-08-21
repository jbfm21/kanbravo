import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
//import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {injectIntl, intlShape} from 'react-intl';

import {default as DetailRow} from './DetailRow.jsx';
import {default as MetricWidged} from './MetricWidged.jsx';


/*const messages = defineMessages(
{
    startPlanningDateLabel: {id: 'modal.cardForm.connectionTab.resumeStatistic.startPlanningDateLabel', description: '', defaultMessage: 'Início Planejado'},
    endPlanningDateLabel: {id: 'modal.cardForm.connectionTab.resumeStatistic.endPlanningDateLabel', description: '', defaultMessage: 'Término Planejado'},
    startLateLabel: {id: 'modal.cardForm.connectionTab.resumeStatistic.startLateLabel', description: '', defaultMessage: 'Início atrasado'},
    endLateLabel: {id: 'modal.cardForm.connectionTab.resumeStatistic.endLateLabel', description: '', defaultMessage: 'Término atrasado'},
    impedimentLabel: {id: 'modal.cardForm.connectionTab.resumeStatist.Impedimentos', description: '', defaultMessage: 'Impedimentos'},
    remainingDays: {id: 'modal.cardForm.connectionTab.resumeStatistic.remainingDays', description: '', defaultMessage: 'Dias Restantes'},
    velocity: {id: 'modal.cardForm.connectionTab.resumeStatistic.velocity', description: '', defaultMessage: 'Velocidade'}
});*/

class DetailTab extends Component
{
    static displayName = 'DetailTab';

    static propTypes =
    {
        statisticManager: PropTypes.object.isRequired,
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    render()
    {
        let {statisticManager, card} = this.props;
        let cardStatistic = statisticManager.getStatistic(card);

        let childrenStatistic = statisticManager.getChildrenStatistic();

        return (
            <div className="detailStatistic" style={{marginTop: '10px'}}>
                <table className="ui compact selectable stripped celled table listCardsToConnectTable" style={{fontFamily: 'monospace', fontSize: '12px', textAlign: 'center', border: '1px solid black'}}>
                    <thead>
                        <tr>
                            <th rowSpan="2" style={{borderColor: 'black', minWidth: '250px'}}>Cartão</th>
                            <th rowSpan="2" style={{borderColor: 'black'}}>Métrica</th>
                            <th colSpan="2" style={{borderColor: 'black'}}>Planejamento</th>
                            <th colSpan="2" style={{borderColor: 'black'}}>Realizado</th>
                            <th colSpan="2" style={{borderColor: 'black'}}>Atrasos</th>
                            <th rowSpan="2" style={{borderColor: 'black'}}>Cadência <div style={{fontSize: '10px'}}>({cardStatistic.connectionMetric.title} / dia)</div></th>
                            <th colSpan="3" style={{borderColor: 'black'}}>Escopo Definido</th>
                            <th colSpan="3" style={{borderColor: 'black'}}>Escopo Global</th>
                            <th rowSpan="2" style={{borderColor: 'black'}}>Andamento</th>
                        </tr>
                        <tr>
                            <th style={{borderColor: 'black', borderLeft: '1px solid black'}}>Início</th>
                            <th style={{borderColor: 'black'}}>Fim</th>
                            <th style={{borderColor: 'black'}}>Início</th>
                            <th style={{borderColor: 'black'}}>Fim</th>
                            <th style={{borderColor: 'black'}} title="Quantidade de cartões não iniciados com início de execução atrasado">N. inic.</th>
                            <th style={{borderColor: 'black'}} title="Quantidade de cartões não iniciados ou em execução com término de execução atrasado">N. fin.</th>
                            <th style={{borderColor: 'black'}} title="Cadência necessária para atender o escopo detalhado dentro do prazo da última data planejada para o escopo detalhado">Cad. esperada<div style={{fontSize: '10px'}}>(atender no prazo)</div></th>
                            <th style={{borderColor: 'black'}} title="Quantidade de dias restantes (ou atrasados, se negativo) para a última data planejada para o escopo detalhado">Dias restantes</th>
                            <th style={{borderColor: 'black'}} title="Previsão de dias para o término do escopo detalhado considerando a cadência atual">Previsão <div style={{fontSize: '10px'}}>(dias)</div></th>
                            <th style={{borderColor: 'black'}} title="Cadência necessária para atender o escopo planejado dentro do prazo planejado">Cad. esperada<div style={{fontSize: '10px'}}>(atender no prazo)</div></th>
                            <th style={{borderColor: 'black'}} title="Quantidade de dias restantes (ou atrasados, se negativo) para a data de término planejado">Dias restantes</th>
                            <th style={{borderColor: 'black'}} title="Previsão de dias para o término do escopo planejado considerando a cadência atual">Previsão <div style={{fontSize: '10px'}}>(dias)</div></th>
                        </tr>
                    </thead>
                    <DetailRow cardStatistic={cardStatistic} isRoot={true}/>
                    <tbody>
                        <tr key="row_1_info"><td colSpan="16"></td></tr>
                    </tbody>
                    {_.map(childrenStatistic, (item) => <DetailRow key={`row_${item.getCard()._id}`} isRoot={false} cardStatistic={item}/>)}
                </table>
                <MetricWidged card={this.props.card} statisticManager={statisticManager}/>
            </div>
        );
    }
}

module.exports = injectIntl(DetailTab, {withRef: true});
