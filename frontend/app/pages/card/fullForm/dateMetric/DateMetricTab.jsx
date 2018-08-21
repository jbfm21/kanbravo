import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import {ImmutableState} from '../../../../decorators';

import {FunctionHelper} from '../../../../commons';
import {LoadServerContent, DateTimeInput} from '../../../../components';

//TODO: implementar shouldUpdate

var StateRecord = Immutable.Record({loading: false, timeSheet: null, showMark: true, showPeriod: true, showImpediment: true, showTimesheet: true});

const messages = defineMessages(
{
    createdDateLabel: {id: 'modal.cardForm.dateMetricTab.createdDate.label', description: 'DateMetric createdDate label', defaultMessage: 'Data de Criação'},
    startLeadTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.startLeadTimeDate.label', description: 'DateMetric startLeadTimeDate label', defaultMessage: 'Início LeadTime'},
    endLeadTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.endLeadTimeDate.label', description: 'DateMetric endLeadTimeDate label', defaultMessage: 'Fim LeadTime'},
    startCycleTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.startCycleTimeDate.label', description: 'DateMetric startCycleTimeDate label', defaultMessage: 'Início CycleTime'},
    endCycleTimeDateLabel: {id: 'modal.cardForm.dateMetricTab.endCycleTimeDate.label', description: 'DateMetric endCycleTimeDate label', defaultMessage: 'Fim CycleTime'},
    lastLaneTransactionDateLabel: {id: 'modal.cardForm.dateMetricTab.lastLaneTransactionDate.label', description: 'DateMetric lastLaneTransactionDate label', defaultMessage: 'Última Movimentação'}
});

@ImmutableState
@airflux.FluxComponent
class DateMetricTab extends Component
{
    static displayName = 'DateMetricTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired,
        onChangeDateMetricData: PropTypes.func.isRequired
    };

    constructor(props)
    {
       super(props);
       this.state = {data: new StateRecord()};
    }

    _handleChangeDateMetricData = (newData) =>
    {
        this.props.onChangeDateMetricData(newData);
        this.forceUpdate();
    }

    render()
    {
        let {loading} = this.state.data;
        let {card} = this.props;
        if (FunctionHelper.isUndefined(card))
        {
            return null;
        }

        if (FunctionHelper.isUndefined(card.dateMetrics))
        {
            return null;
        }

        const {formatMessage} = this.props.intl;
        let {createdDate, startLeadTimeDate, endLeadTimeDate, startCycleTimeDate, endCycleTimeDate, lastLaneTransactionDate} = card.dateMetrics;
        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <LoadServerContent isLoading={loading}/>
                <div style={{display: 'block', fontSize: '12px'}}>
                    <table className="ui striped compact structured center aligned table" style={{border: '0px solid black'}}>
                        <thead>
                            <tr>
                                <th>{formatMessage(messages.createdDateLabel)}</th>
                                <th>{formatMessage(messages.startLeadTimeDateLabel)}</th>
                                <th>{formatMessage(messages.startCycleTimeDateLabel)}</th>
                                <th>{formatMessage(messages.endCycleTimeDateLabel)}</th>
                                <th>{formatMessage(messages.endLeadTimeDateLabel)}</th>
                                <th>{formatMessage(messages.lastLaneTransactionDateLabel)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{borderBottom: '0x solid black'}}>
                                <td><DateTimeInput placeHolder="--/--/-- --:--" lessOrEqualThan={startLeadTimeDate} value={createdDate} propName="createdDate" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                <td><DateTimeInput requireBeforeValue greaterOrEqualThan={createdDate} lessOrEqualThan={startCycleTimeDate} value={startLeadTimeDate} required={false} placeHolder="--/--/-- --:--" propName="startLeadTimeDate" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                <td><DateTimeInput requireBeforeValue greaterOrEqualThan={startLeadTimeDate} lessOrEqualThan={endCycleTimeDate} value={startCycleTimeDate} required={false} placeHolder="--/--/-- --:--" propName="startCycleTimeDate" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                <td><DateTimeInput requireBeforeValue greaterOrEqualThan={startCycleTimeDate} lessOrEqualThan={endLeadTimeDate} value={endCycleTimeDate} required={false} placeHolder="--/--/-- --:--" propName="endCycleTimeDate" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                <td><DateTimeInput requireBeforeValue greaterOrEqualThan={endCycleTimeDate} value={endLeadTimeDate} propName="endLeadTimeDate" required={false} placeHolder="--/--/-- --:--" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                <td><DateTimeInput value={lastLaneTransactionDate} propName="lastLaneTransactionDate" required={false} placeHolder="--/--/-- --:--" change={this._handleChangeDateMetricData} classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = injectIntl(DateMetricTab, {withRef: true});

