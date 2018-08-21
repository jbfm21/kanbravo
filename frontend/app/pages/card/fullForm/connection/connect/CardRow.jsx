//ATENCAO: alteracao no avatar para aceitar title, margin, borderColor, isToShowBackgroundColor
//Inclusao do sass blockIcon e assignedMembersIcon
//Elipsistext

'use strict';
import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';
import {Icon} from 'react-semantify';
import Immutable from 'immutable';

import {ImmutableState} from '../../../../../decorators';
import {Avatar} from '../../../../../components';
import {FunctionHelper, CalendarLayoutHelper} from '../../../../../commons';

var StateRecord = Immutable.Record({});

const ValueField = (props) =>
{
    if (FunctionHelper.isUndefined(props.value))
    {
        if (FunctionHelper.isUndefined(props.emptyValue))
        {
            return <span>{props.emptyValue}</span>;
        }
        return null;
    }
    let value = null;
    if (_.isString(props.value))
    {
        value = props.value;
    }
    else if (FunctionHelper.isDefined(props.value.title))
    {
        value = props.value.title;
    }
    else
    {
        value = props.value;
    }
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            <div className="not padding item">
                {value}
            </div>
        </div>
    );
};

const DateField = (props) =>
{
    if (FunctionHelper.isUndefined(props.value))
    {
        return null;
    }
    let dateStatus = CalendarLayoutHelper.getStatus(props.value, props.compareTo);
    return (
        <div className="cardDateRow">
            <span title={dateStatus.message} className="ui not padding item label date" style={{backgroundColor: dateStatus.color.backgroundColor, color: dateStatus.color.color}}>{dateStatus.planningMomentDate.format('DD/MMM')}</span>
        </div>
    );
};

const AvatarField = (props) =>
{
    if (FunctionHelper.isUndefined(props.value))
    {
        return null;
    }
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            <div title={props.value.title} className="not padding item">
                <Avatar isToShowBackGroundColor isSquareImageDimension avatar={props.value.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
            </div>
        </div>
    );
};

const PriorityField = (props) =>
{
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            {FunctionHelper.isDefined(props.priorityObject) &&
                <div title={props.priorityObject.title} className="not padding item">
                    <Avatar isToShowBackGroundColor isSquareImageDimension avatar={props.priorityObject.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                </div>}
            {FunctionHelper.isDefined(props.priorityNumberValue) &&
                <div title={`Prioridade: ${props.priorityNumberValue}`} className="not padding item">
                    {props.priorityNumberValue}
                </div>}
        </div>
    );
};

@airflux.FluxComponent
@ImmutableState
export default class CardRow extends React.Component
{

    static displayName = 'CardRow';

    static propTypes =
    {
        //TODO, Melhorar, criando um cartao mais simples e depois herdando cartao para ter context menu e etc, pois
        //existem lugares que é exibido o cartao somente para verificar como está o design, não tendo ações
        card: React.PropTypes.object.isRequired,
        ratingTypes: React.PropTypes.any.isRequired,
        onSetParent: React.PropTypes.func.isRequired
    };

    static defaultProps =
    {
    }

    constructor()
    {
        super();
        this.state = {data: new StateRecord({})};
    }

    _renderRatings(card, ratingTypes)
    {
        let itemsToRender = [];
        _.forEach(ratingTypes, (ratingType) =>
        {
            let foundRating = _.find(card.ratings, function(rating) {return ratingType._id === rating.ratingType._id;});
            let value = FunctionHelper.isDefined(foundRating) ? ` ${((foundRating.votes / ratingType.maxRating) * 100).toFixed(1)}%` : '-';
            let altText = FunctionHelper.isDefined(foundRating) ? ` ${((foundRating.votes / ratingType.maxRating) * 100).toFixed(1)}% | ${foundRating.votes}` : '-';
            itemsToRender.push(<td key={`connectCardTab_ratingValue_${ratingType._id}`} className="center aligned" style={{padding: '0px'}} title={`${altText}`}>{value}</td>);
        });
        return itemsToRender;
    }

    render()
	{
        let {card, ratingTypes} = this.props;
        if (FunctionHelper.isUndefined(card))
        {
            return null;
        }

        let plugIconStyle = FunctionHelper.isDefined(this.props.card.parent) ? {color: 'blue', opacity: 1} : {color: 'lightgray', opacity: 0.5};
        let grandChildrenCardsBasedCalculationValue = FunctionHelper.isDefined(card.grandChildrenCardsBasedCalculation) ? (<Icon className="large checkmark " />) : '-';
        let metricValue = FunctionHelper.isDefined(card.metric) ? `${card.metricValue} ${card.metric.title}` : null;
        console.log('a', card.metric, metricValue);
        return (
            <tr>
                <td className="center aligned" style={{padding: '0px'}} style={{maxWidth: '20px'}}>
                    <Icon className="large plug" style={plugIconStyle} onClick={this.props.onSetParent.bind(this, card)}/>
                </td>
                <td className="left aligned" style={{padding: '0px'}}>
                    <div className="ui image header" style={{display: 'flex'}}>
                        {FunctionHelper.isDefined(card.project) && FunctionHelper.isDefined(card.project.avatar) &&
                            <Avatar hostStyle={{marginRight: '2px'}} isToShowBackGroundColor isSquareImageDimension avatar={card.project.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                        }
                        <div className="content" style={{fontSize: '14px'}}>
                            {card.title}
                        </div>
                    </div>
                </td>
                <td className="center aligned" style={{padding: '0px'}}><PriorityField priorityNumberValue={card.priorityNumberValue} priorityObject={card.priority}/></td>
                <td className="center aligned" style={{padding: '0px'}}><AvatarField value={card.itemSize}/></td>
                <td className="center aligned" style={{padding: '0px'}}><ValueField value={metricValue}/></td>
                <td className="center aligned" style={{padding: '0px'}}><DateField value={card.startPlanningDate} compareTo={card.startExecutionDate}/></td>
                <td className="center aligned" style={{padding: '0px'}}><DateField value={card.endPlanningDate} compareTo={card.endExecutionDate}/></td>
                <td className="center aligned" style={{padding: '0px'}}><ValueField value={card.childrenMetricValue} emptyValue={'-'}/></td>
                <td className="center aligned" style={{padding: '0px'}}><ValueField value={card.childrenMetric}/></td>
                <td className="center aligned" style={{padding: '0px'}}><ValueField value={grandChildrenCardsBasedCalculationValue} emptyValue={'-'}/></td>
                {this._renderRatings(card, ratingTypes)}
            </tr>
        );
    }
}
