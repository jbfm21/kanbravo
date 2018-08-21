import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import {injectIntl, intlShape} from 'react-intl';
import Immutable from 'immutable';

import {Label} from 'react-semantify';

import {FunctionHelper, CalendarLayoutHelper, BoardLayoutHelper} from '../../../../../../commons';
import {BasicProgress, ProgressBar, FaIcon} from '../../../../../../components';
import {ImmutableState} from '../../../../../../decorators';
import {CardStatus} from '../../../../../../enums';
import {DashboardHelper} from '../../components';

var StateRecord = Immutable.Record({showChildren: false});

const CardDateRowStatus = (props) =>
{
    let {status} = props;
    if (!status) {return null;}
    return (
        <div className="cardDateRow">
            <span title={status.message} className="ui item label" style={{backgroundColor: status.color.backgroundColor, padding: '2px', color: status.color.color, borderRadius: '0px'}}>{status.planningMomentDate.format('DD/MMM')}</span>
        </div>
    );
};

const Duration = (props) =>
{
    let {start, end, emptyValue} = props;
    if (FunctionHelper.isUndefined(start) || FunctionHelper.isUndefined(end))
    {
        return <span>{emptyValue}</span>;
    }
    return (<span>{FunctionHelper.diffBetweenTwoDates(FunctionHelper.dateOrNull(start), FunctionHelper.dateOrNull(end))}</span>);
};


const CardDate = (props) =>
{
    let {date, error, format} = props;
    if (!date) {return null;}
    if (error.value)
    {
        return (<div className="cardDateRow" title={error.msg}>
            <Label style={{color: 'white', backgroundColor: 'red', padding: '2px', borderRadius: '0px'}}>Preencher</Label>
        </div>);
    }
    return (
        <div className="cardDateRow">
            <span>{CalendarLayoutHelper.getFormmattedDate(date, format)}</span>
        </div>
    );
};

const RemainingDays = (props) =>
{
    let {value} = props;
    if (FunctionHelper.isUndefined(value))
    {
        return null;
    }
    let style = BoardLayoutHelper.getRemainingDaysColor(value);
    style['padding'] = '2px'; //eslint-disable-line
    style['borderRadius'] = '0px'; //eslint-disable-line
    return (
        <div className="cardDateRow">
            <Label style={style}>{value}</Label>
        </div>
    );
};

const CollapsedIcon = (props) =>
{
    if (!props.isRoot && props.hasChildren)
    {
        if (props.showChildren)
        {
            return <i className="black square outline tiny minus icon left position pointer mouse" onClick={props.onClick}/>;
        }
        return <i className="black square outline tiny plus icon left position pointer mouse" onClick={props.onClick}/>;
    }
    if (!props.hasChildren)
    {
        return <i className="black square outline tiny plus icon left position pointer mouse" style={{opacity: '0'}}/>;
    }
    return null;
};

const ArchivedIcon = (props) =>
{
    if (props.card.status === CardStatus.archived.name)
    {
        return <FaIcon className="icon fa-archive " style={{fontSize: '12px'}}/>;
    }
    return null;
};

@ImmutableState
class DetailStatisticRow extends Component
{
    static displayName = 'DetailStatisticRow';

    static propTypes =
    {
        cardStatistic: PropTypes.object.isRequired,
        isRoot: PropTypes.bool.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.state = {data: new StateRecord()};
    }

    _handleCollapse = () =>
    {
        this.setImmutableState({showChildren: !this.state.data.showChildren});
        this.forceUpdate();
    }

    _renderChildren = (card) =>
    {
        let startPlanningDateStatus = (FunctionHelper.isDefined(card.startPlanningDate)) ? CalendarLayoutHelper.getStatus(card.startPlanningDate, card.startExecutionDate) : null;
        let endPlanningDateStatus = (FunctionHelper.isDefined(card.endPlanningDate)) ? CalendarLayoutHelper.getStatus(card.endPlanningDate, card.endExecutionDate) : null;
        let startExecutionDate = FunctionHelper.isDefined(card.startExecutionDate) ? card.startExecutionDate : null;
        let endExecutionDate = FunctionHelper.isDefined(card.endExecutionDate) ? card.endExecutionDate : null;
        let cardSituation = DashboardHelper.getCardSituation(card);
        return (
            <tr key={`childRow_${card._id}`}>
                <td style={{textAlign: 'left'}}>
                    <ArchivedIcon card={card}/>
                    <span style={{marginLeft: '5px'}}>{card.title}</span>
                </td>
                <td style={{textAlign: 'left'}}>
                    <span style={{marginLeft: '5px'}}>{card.board.title}</span>
                </td>
                <td>{card.metricValue}</td>
                <td><Label style={cardSituation.style}>{cardSituation.value}</Label></td>
                <td><CardDateRowStatus status={startPlanningDateStatus}/></td>
                <td><CardDateRowStatus status={endPlanningDateStatus}/></td>
                <td><Duration emptyValue="-" start={card.startPlanningDate} end={card.endPlanningDate}/></td>
                <td><CardDate date={startExecutionDate} error={{value: false}} format="DD/MMM"/></td>
                <td><CardDate date={endExecutionDate} error={{value: false}} format="DD/MMM"/></td>
                <td><Duration emptyValue="-" start={startExecutionDate} end={endExecutionDate}/></td>
            </tr>
        );
    }

    render()
    {
        let that = this;
        let {cardStatistic, isRoot} = this.props;
        let {showChildren} = this.state.data;
        let card = cardStatistic.getCard();
        let {startPlanning, endPlanning, startExecution, endExecution} = cardStatistic.globalScope.dates;

        let startPlanningDateStatus = (FunctionHelper.isDefined(startPlanning)) ? CalendarLayoutHelper.getStatus(startPlanning, startExecution) : null;
        let endPlanningDateStatus = (FunctionHelper.isDefined(endPlanning)) ? CalendarLayoutHelper.getStatus(endPlanning, endExecution) : null;
        let startExecutionDate = FunctionHelper.isDefined(startExecution) ? startExecution : null;
        let endExecutionDate = FunctionHelper.isDefined(endExecution) ? endExecution : null;

        let latedNotStartedCardAltText = 'Cartões não iniciados: \n' + _.join(_.map(cardStatistic.notStarted.lateStartCards, item => item.title), '\n');
        let latedNotFinishedCardAltText = 'Cartões não finalizados: \n' + _.join(_.map(cardStatistic.notStarted.lateFinishedCards, item => item.title), '\n');
        latedNotFinishedCardAltText += _.join(_.map(cardStatistic.started.lateFinishedCards, item => item.title), '\n');

        const hasChildren = FunctionHelper.isArrayNotEmpty(cardStatistic.scopeCards);

        //TODO: melhor a descrição: caso seja um cartao raiz e que nao use como base de calculo os netos, exibe tambem os filhos no detalhamento
        const grandChildrenCardsBasedCalculation = cardStatistic.getCard().grandChildrenCardsBasedCalculation;

        const className = isRoot ? 'root' : null;

        const {notStarted, started, finished, notDefined} = cardStatistic.globalScope.scope;
        const altText = DashboardHelper.getScopeAltText2(cardStatistic, cardStatistic.globalScope);


        const _renderScopeColumData = (scopeDatum) =>
        {
            const remainingDays = scopeDatum.remainingDays.value;

            const isDeadlineExpired = (FunctionHelper.isDefined(remainingDays) && remainingDays < 0);
            const velocityToFinishRenderedItem = isDeadlineExpired ?
                <td key={FunctionHelper.uuid()}><Label className="date" style={{color: 'white', backgroundColor: '#ff7f6d', padding: '2px', borderRadius: '0px'}}>prazo expirado</Label></td> :
                <td key={FunctionHelper.uuid()} title={scopeDatum.velocityToFinish.comment}>{scopeDatum.velocityToFinish.value || '-'}</td>;

            return ([
                velocityToFinishRenderedItem,
                <td key={FunctionHelper.uuid()}><RemainingDays value={remainingDays}/></td>,
                <td key={FunctionHelper.uuid()} title={scopeDatum.forecastToFinish.value}>{scopeDatum.forecastToFinish.value || '-'}</td>
            ]);
        };

        return (
            <tbody className={className}>
                <tr>
                    <td style={{textAlign: 'left'}} rowSpan="1">
                        <CollapsedIcon isRoot={isRoot} hasChildren={hasChildren} showChildren={showChildren} onClick={this._handleCollapse.bind(this)}/>
                        <ArchivedIcon card={card}/>
                        <span style={{marginLeft: '2px'}}>{card.title}</span>
                    </td>
                    <td>{cardStatistic.getCard().metricValue}</td>
                    <td><CardDateRowStatus status={startPlanningDateStatus}/></td>
                    <td><CardDateRowStatus status={endPlanningDateStatus}/></td>
                    <td><CardDate date={startExecutionDate} error={cardStatistic.errors.isStartExecutionBlankWithStartExecutionScope} format="DD/MMM"/></td>
                    <td><CardDate date={endExecutionDate} error={cardStatistic.errors.isEndExecutionBlankWithAllFinishedScope} format="DD/MMM"/></td>
                    <td><div title={latedNotStartedCardAltText}>{cardStatistic.notStarted.lateStartCards.length}</div></td>
                    <td><div title={latedNotFinishedCardAltText}>{cardStatistic.resume.qntNotFinishedCardLate}</div></td>
                    <td>{cardStatistic.resume.actualVelocity.value}</td>
                    {_renderScopeColumData(cardStatistic.definedScope)}
                    {_renderScopeColumData(cardStatistic.globalScope)}
                    <td>
                        <div style={{display: 'flex', minWidth: '150px'}} title={altText}>
                            <BasicProgress style={{width: '100%', height: '17px', borderRadius: '0px', margin: '0px'}}>
                                <ProgressBar className="progress-bar-finished" show="labelOnly" label={`${finished.percentual}%`} percent={finished.percentual} style={{fontSize: '11px'}}/>
                                <ProgressBar className="progress-bar-started" show="labelOnly" label={`${started.percentual}%`} percent={started.percentual} style={{fontSize: '11px'}}/>
                                <ProgressBar className="progress-bar-notStarted" show="labelOnly" label={`${notStarted.percentual}%`} percent={notStarted.percentual} style={{fontSize: '11px'}}/>
                                <ProgressBar className="progress-bar-notDetailed" show="labelOnly" label={`${notDefined.percentual}%`} percent={notDefined.percentual} style={{fontSize: '11px'}}/>
                            </BasicProgress>
                        </div>
                    </td>
                </tr>

                { ((hasChildren && showChildren) || (isRoot && !grandChildrenCardsBasedCalculation)) &&
                    <tr>
                        <td colSpan="16" style={{borderBottom: '2px solid black', borderTop: '1px solid black', backgroundColor: 'white'}}>
                            <div style={{marginTop: '10px', marginLeft: '5px', textAlign: 'left'}}>
                                Total Planejado: {cardStatistic.connectionMetricValue} {cardStatistic.getConnectionMetricTitle()}|
                                Definido: {cardStatistic.definedScope.scope.total.value} |
                                Falta Definir: {cardStatistic.globalScope.scope.notDefined.value}
                            </div>
                            <table className="ui compact selectable stripped celled table listCardsToConnectTable childTable" style={{fontFamily: 'monospace', fontSize: '11px', textAlign: 'center', border: '2px solid blue', marginTop: '10px', marginBottom: '10px', marginLeft: '5px', marginRight: '5px', width: '98%'}}>
                                <thead>
                                    <tr>
                                        <th rowSpan="2" style={{minWidth: '250px'}}>Cartão</th>
                                        <th rowSpan="2" style={{minWidth: '100px'}}>Quadro</th>
                                        <th rowSpan="2">{cardStatistic.getConnectionMetricTitle()}</th>
                                        <th rowSpan="2">Situação</th>
                                        <th colSpan="3">Planejamento</th>
                                        <th colSpan="3">Realizado</th>
                                    </tr>
                                    <tr>
                                        <th style={{border: '1px solid black'}}>Início</th>
                                        <th>Fim</th>
                                        <th>Duração</th>
                                        <th>Início</th>
                                        <th>Fim</th>
                                        <th>Duração</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {_.map(cardStatistic.scopeCards, (scopeCard) => that._renderChildren(scopeCard))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                }
            </tbody>
        );
    }
}

module.exports = injectIntl(DetailStatisticRow, {withRef: true});
