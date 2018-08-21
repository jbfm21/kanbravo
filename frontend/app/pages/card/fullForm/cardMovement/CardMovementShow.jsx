import React, {Component, PropTypes} from 'react';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {ImmutableState} from '../../../../decorators';
import {FunctionHelper, TreeUtils} from '../../../../commons';
import {Content} from '../../../../components';

//TODO: Implementar adição e remoção

const messages = defineMessages(
{
    startDate: {id: 'modal.cardForm.cardMovementTab.startDate', description: '', defaultMessage: 'Início'},
    endDate: {id: 'modal.cardForm.cardMovementTab.endDate', description: '', defaultMessage: 'Fim'},
    totalDuration: {id: 'modal.cardForm.cardMovementTab.totalDuration', description: '', defaultMessage: 'Total'},
    duration: {id: 'modal.cardForm.cardMovementTab.duration', description: '', defaultMessage: 'Duração'},
    execution: {id: 'modal.cardForm.cardMovementTab.execution', description: '', defaultMessage: 'Tempo em Exec.'},
    waiting: {id: 'modal.cardForm.cardMovementTab.effort', description: '', defaultMessage: 'Tempo de Espera'},
    percentExecution: {id: 'modal.cardForm.cardMovementTab.effort', description: '', defaultMessage: '% Exec.'}
});

@ImmutableState
@airflux.FluxComponent
class CardMovementShow extends Component
{
    static displayName = 'CardMovementShow';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        cardMovementHistory: PropTypes.object.isRequired,
        cardMovementTreeRoot: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    _handleCollapse = (node) =>
    {
        node.showChildren = !node.showChildren;
        this.forceUpdate();
    }

    render()
    {
        let {cardMovementHistory, cardMovementTreeRoot} = this.props;
        let itemsToRender = [];
        if (FunctionHelper.isDefined(cardMovementHistory) && FunctionHelper.isDefined(cardMovementTreeRoot))
        {
            let renderItem = (node) =>
            {
                let durationStyle = FunctionHelper.isDefined(node.endDate) ? {margin: '0px', padding: '0px', whiteSpace: 'nowrap'} : {padding: '0px', margin: '0px', whiteSpace: 'nowrap', color: 'gray', opacity: '0.7', fontStyle: 'italic'};
                let isTotalDurationLessThenOneMinute = FunctionHelper.isDefined(node.startDate) && FunctionHelper.isDefined(node.endDate) && (FunctionHelper.isUndefined(node.totalDuration) || node.totalDuration === 0);
                let totalDuration = (isTotalDurationLessThenOneMinute) ? '-' : FunctionHelper.formatMinutesToDayHourAndMinutes(node.totalDuration);
                itemsToRender.push(
                    <tr className={`movementTableRRow level${node.depth}`} key={`nodeItem_${node.key}`}>
                        <td className="left aligned title tableData">
                            <div className={`bold nowrap ellipsis text title tableData level${node.depth}`} title="{node.title}">
                                {
                                    node.children.length > 0 && node.showChildren && <i className="black square outline tiny minus icon left position pointer mouse" onClick={this._handleCollapse.bind(this, node)}/>
                                }
                                {
                                    node.children.length > 0 && !node.showChildren && <i className="black square outline tiny plus icon left position pointer mouse" onClick={this._handleCollapse.bind(this, node)}/>
                                }
                                {
                                    //So para ocupar espaco do botão de colapsar
                                    node.children.length === 0 && <i className="black square outline tiny plus icon left position pointer mouse" style={{opacity: '0'}}/>
                                }
                                {node.title}
                            </div>
                        </td>
                        <td className="center aligned" style={{padding: '0px', margin: '0px', whiteSpace: 'nowrap'}}>{FunctionHelper.formatDate(node.startDate, 'DD/MM/YYYY HH:mm', '')}</td>
                        <td className="center aligned" style={{padding: '0px', margin: '0px', whiteSpace: 'nowrap'}}>{FunctionHelper.formatDate(node.endDate, 'DD/MM/YYYY HH:mm', '')}</td>
                        <td className="center aligned" style={durationStyle}>{totalDuration}</td>
                        <td className="center aligned" style={durationStyle}>{FunctionHelper.formatMinutesToDayHourAndMinutes(node.workingDuration)}</td>
                        <td className="center aligned" style={durationStyle}>{FunctionHelper.formatMinutesToDayHourAndMinutes(node.waitingDuration)}</td>
                        <td className="center aligned" style={durationStyle}>{FunctionHelper.isDefined(node.percentualWorking) && `${node.percentualWorking.toFixed(2)}%`}</td>
                    </tr>
                );
            };
            TreeUtils.transverseAllNodesInPreOrderAndDoAction(cardMovementTreeRoot, renderItem, {isToTransverseChildren: (node) => node.showChildren});
        }
        return (
            <Content className="k-edit-setting k-text withScrollBar" style={{maxHeight: '500px'}}>
                <table className="ui celled structured compact table movementTable">
                    <thead className="center aligned">
                        <tr>
                            <th rowSpan="2" className="title tableData"></th>
                            <th rowSpan="2" className="date tableData"><FormattedMessage {...messages.startDate}/></th>
                            <th rowSpan="2" className="date tableData" style={{minWidth: '70px'}}><FormattedMessage {...messages.endDate}/></th>
                            <th rowSpan="2" className="textDate tableData"><FormattedMessage {...messages.totalDuration}/></th>
                            <th colSpan="3" className="tableData"><FormattedMessage {...messages.duration}/></th>
                        </tr>
                        <tr>
                            <th className="textDate tableData"><FormattedMessage {...messages.execution}/></th>
                            <th className="textDate tableData"><FormattedMessage {...messages.waiting}/></th>
                            <th className="number tableData"><FormattedMessage {...messages.percentExecution}/></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        itemsToRender.map((item) => item)
                    }
                    </tbody>
                </table>
            </Content>
        );
    }
}

module.exports = injectIntl(CardMovementShow, {withRef: true});

