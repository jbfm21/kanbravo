//ATENCAO: alteracao no avatar para aceitar title, margin, borderColor, isToShowBackgroundColor
//Inclusao do sass blockIcon e assignedMembersIcon
//Elipsistext

'use strict';
import React from 'react';
import * as airflux from 'airflux';

import {ImmutableState} from '../../../../../decorators';
import {FunctionHelper} from '../../../../../commons';

@airflux.FluxComponent
@ImmutableState
export default class HeaderRow extends React.Component
{

    static displayName = 'HeaderRow';

    static propTypes =
    {
        //TODO, Melhorar, criando um cartao mais simples e depois herdando cartao para ter context menu e etc, pois
        //existem lugares que é exibido o cartao somente para verificar como está o design, não tendo ações
        cardStatistic: React.PropTypes.object.isRequired
    };

    constructor()
    {
        super();
    }

    _getDuration(start, end)
    {
        if (FunctionHelper.isUndefined(start) || FunctionHelper.isUndefined(end))
        {
            return '-';
        }
        return FunctionHelper.diffBetweenTwoDates(start, end);
    }

    render()
	{
        let {cardStatistic} = this.props;
        let metricTitle = FunctionHelper.isDefined(cardStatistic.connectionMetric) ? cardStatistic.connectionMetric.title : '-';
        let metricValue = cardStatistic.definedScope.scope.total.value || '-';

        let dates = cardStatistic.definedScope.dates;

        let columnStyle = {padding: '0px', borderBottom: '1px solid black', backgroundColor: 'orange'};
        return (
            <tr>
                <td colSpan="4" className="center aligned" style={columnStyle}>Total</td>
                <td className="center aligned" style={columnStyle}>{metricValue}</td>
                <td className="center aligned" style={columnStyle}>{metricTitle}</td>
                <td className="center aligned" style={columnStyle}>{FunctionHelper.formatDate(dates.startPlanning, 'DD/MM/YYYY', '--/--/----')}</td>
                <td className="center aligned" style={columnStyle}>{FunctionHelper.formatDate(dates.endPlanning, 'DD/MM/YYYY', '--/--/----')}</td>
                <td className="center aligned" style={columnStyle}>{this._getDuration(dates.startPlanning, dates.endPlanning)}</td>
                <td className="center aligned" style={columnStyle}>{FunctionHelper.formatDate(dates.startExecution, 'DD/MM/YYYY', '--/--/----')}</td>
                <td className="center aligned" style={columnStyle}>{FunctionHelper.formatDate(dates.endExecution, 'DD/MM/YYYY', '--/--/----')}</td>
                <td className="center aligned" style={columnStyle}>{this._getDuration(dates.startExecution, dates.endExecution)}</td>
                <td className="center aligned" style={columnStyle}>{cardStatistic.getTotalChildrenMetricValue()}</td>
                <td className="center aligned" style={columnStyle}></td>
                <td className="center aligned" style={columnStyle}></td>
            </tr>
        );
    }
}
