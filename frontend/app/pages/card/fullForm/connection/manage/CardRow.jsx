//ATENCAO: alteracao no avatar para aceitar title, margin, borderColor, isToShowBackgroundColor
//Inclusao do sass blockIcon e assignedMembersIcon
//Elipsistext

'use strict';
import React from 'react';
import * as airflux from 'airflux';
//import _ from 'lodash';
import {Icon} from 'react-semantify';
import Immutable from 'immutable';

import {KanbanActions} from '../../../../../actions';
import {ImmutableState} from '../../../../../decorators';
import {Avatar, DateInput, NumberInput} from '../../../../../components';
import {FunctionHelper, CalendarLayoutHelper} from '../../../../../commons';
import {default as ComboField} from '../../components/ComboField.jsx';

var StateRecord = Immutable.Record({});

const ExecutionDateInput = (props) =>
{
    const valueToShow = FunctionHelper.isDefined(props.value) ? CalendarLayoutHelper.getMomentDate(props.value).utc().format('DD/MMM') : '--/--/--';
    return (
        <DateInput
            propName={props.propName}
            value={props.value}
            lessOrEqualThan={props.lessOrEqualThan}
            greaterOrEqualThan={props.greaterOrEqualThan}
            change={props.onChange}
            classLoading="loading"
            required={false}
            classInvalid="k-inlineEdit invalid"
        >
            <div className="cardDateRow">
                <span className="ui not padding white label date" style={{backgroundColor: 'white'}}>{valueToShow}</span>
            </div>
        </DateInput>
    );
};

const PlanningDateInput = (props) =>
{

    const dateStatus = FunctionHelper.isDefined(props.value) ? CalendarLayoutHelper.getStatus(props.value, props.compareTo) : null;
    return (
        <DateInput
            propName={props.propName}
            value={props.value}
            lessOrEqualThan={props.lessOrEqualThan}
            greaterOrEqualThan={props.greaterOrEqualThan}
            change={props.onChange}
            placeHolder="--/--/--"
            classLoading="loading"
            required={false}
            classInvalid="k-inlineEdit invalid">
                {FunctionHelper.isDefined(dateStatus) && <div className="cardDateRow">
                    <span title={dateStatus.message} className="ui not padding item label date" style={{backgroundColor: dateStatus.color.backgroundColor, color: dateStatus.color.color}}>{dateStatus.planningMomentDate.utc().format('DD/MMM')}</span>
                </div>}
        </DateInput>
    );
};

const DurationValue = (props) =>
{
    if (FunctionHelper.isUndefined(props.start) || FunctionHelper.isUndefined(props.end))
    {
        return <span>{props.emptyValue}</span>;
    }
    return (<span>{FunctionHelper.diffBetweenTwoDates(props.start, props.end)}</span>);
};

const SizeValue = (props) =>
{
    const value = props.value;
    if (FunctionHelper.isUndefined(value))
    {
        return null;
    }
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            <div title={value.title} className="not padding item">
                <Avatar isToShowBackGroundColor isSquareImageDimension avatar={value.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
            </div>
        </div>
    );
};

const PriorityValue = (props) =>
{
    const priorityObject = props.priorityObject;
    const priorityNumber = props.priorityNumberValue;
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            {FunctionHelper.isDefined(priorityObject) &&
                <div title={priorityObject.title} className="not padding item">
                    <Avatar isToShowBackGroundColor isSquareImageDimension avatar={priorityObject.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} />
                </div>
            }
            {FunctionHelper.isDefined(priorityNumber) &&
                <div title={`Prioridade: ${priorityNumber}`} className="not padding item">
                    {priorityNumber}
                </div>
            }
        </div>
    );
};

const GrandChildrenCardsBasedCalculationInput = (props) =>
{
    const value = props.value;
    if (FunctionHelper.isUndefined(value))
    {
        return <span>{props.emptyValue}</span>;
    }
    const checkmarkStyle = value ? {cursor: 'pointer', color: 'blue', opacity: 1} : {cursor: 'pointer', color: 'lightgray', opacity: 0.5};
    return (
        <div className="properties ui borderless fluid five not padding horizontal list icon without borderRadius iconInfos" style={{border: '0px'}} >
            <div className="not padding item">
                <Icon className="large checkmark" style={checkmarkStyle} onClick={props.onClick}/>
            </div>
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
        cardForm: React.PropTypes.object,
        onUpdateCard: React.PropTypes.func.isRequired,
        onSetParent: React.PropTypes.func,
        columnStyle: React.PropTypes.object
    };

    static defaultProps =
    {
    }

    constructor()
    {
        super();
        this.state = {data: new StateRecord({})};
    }

    _getFormValue(propertyName, card, cardForm)
    {
        if (this.props.cardForm)
        {
            if (cardForm.cleanedData.hasOwnProperty(propertyName))
            {
                return cardForm.cleanedData[propertyName];
            }
            return cardForm.data[propertyName];
        }
        return card[propertyName];
    }

    _handleSelectedItem = (fieldName, selectedItem) =>
    {
        this.props.onUpdateCard(this.props.card, {[fieldName]: selectedItem});
    }

    _handleOnToggleChildrenCardsBasedCalculation = () =>
    {
        this.props.onUpdateCard(this.props.card, {grandChildrenCardsBasedCalculation: !this.props.card.grandChildrenCardsBasedCalculation});
    }

    _renderRatings(card) //eslint-disable-line
    {
        /*let itemsToRender = [];
        _.forEach(ratingTypes, (ratingType) =>
        {
            let foundRating = _.find(card.ratings, function(rating) {return ratingType._id === rating.ratingType._id;});
            let value = FunctionHelper.isDefined(foundRating) ? ` ${((foundRating.votes / ratingType.maxRating) * 100).toFixed(1)}% | ${foundRating.votes}` : '-';
            itemsToRender.push(<td key={`connectCardTab_ratingValue_${ratingType._id}`} className="center aligned" style={{padding: '0px'}}>{value}</td>);
        });
        return itemsToRender;
        */
        return null;
    }

    render()
	{
        let {card, onSetParent, cardForm} = this.props;
        if (FunctionHelper.isUndefined(card))
        {
            return null;
        }

        let plugIconStyle = FunctionHelper.isDefined(this.props.card.parent) ? {fontSize: '15px', cursor: 'pointer', color: 'blue', opacity: 1} : {fontSize: '15px', cursor: 'pointer', color: 'lightgray', opacity: 0.5};
        let columnStyle = {padding: '0px'};
        columnStyle = FunctionHelper.assign(columnStyle, this.props.columnStyle);

        const startPlanningDateValue = this._getFormValue('startPlanningDate', card, cardForm);
        const endPlanningDateValue = this._getFormValue('endPlanningDate', card, cardForm);
        const startExecutionDateValue = this._getFormValue('startExecutionDate', card, cardForm);
        const endExecutionDateValue = this._getFormValue('endExecutionDate', card, cardForm);
        const metricValue = this._getFormValue('metricValue', this.props.card, this.props.cardForm);

        const cardAvatar = FunctionHelper.isDefined(card.project) && FunctionHelper.isDefined(card.project.avatar) ? <Avatar hostStyle={{marginRight: '2px'}} isToShowBackGroundColor isSquareImageDimension avatar={card.project.avatar} style={{marginLeft: '2px', fontSize: null, width: '25px', padding: '0px'}} /> : null;
        const boardTitle = FunctionHelper.isDefined(card.board) ? card.board.title : '-';
        const cardTitleAltText = `Quadro: ${boardTitle}`;

        return (
            <tr>
                <td className="center aligned" style={columnStyle}>
                    {onSetParent && <Icon className="plug" style={plugIconStyle} onClick={this.props.onSetParent.bind(this, card)}/>}
                </td>
                <td className="left aligned" style={columnStyle} title={cardTitleAltText}>
                    <div className="ui image header" style={{display: 'flex'}}>
                        {cardAvatar}<div className="content" style={{fontSize: '12px'}}>{card.title}</div>
                    </div>
                </td>
                <td className="center aligned" style={columnStyle}>
                    <PriorityValue priorityObject={card.priority} priorityNumberValue={card.priorityNumberValue}/>
                </td>
                <td className="center aligned" style={columnStyle}>
                    <SizeValue value={card.itemSize}/>
                </td>
                <td className="center aligned" style={columnStyle}>
                    <NumberInput
                        propName="metricValue"
                        value={metricValue}
                        placeHolder="-"
                        change={this.props.onUpdateCard.bind(this, card)}
                        required={false}
                        normalStyle={{textAlign: 'center', margin: '2px', padding: '0px', cursor: 'pointer'}}
                        style={{border: '1px solid black', textAlign: 'left', width: '150px !important', margin: '2px', padding: '0px'}}
                        classLoading="isLoading"
                        classInvalid="k-inlineEdit invalid"
                    />
                </td>
                <td className="center aligned smallSelect" style={columnStyle}>
                    <ComboField
                        fieldName="metric"
                        label={''}
                        style={{maxWidth: '160px'}}
                        showAvatar={false}
                        placeHolder="-"
                        getSuggestionFunc={KanbanActions.boardSetting.metricType.search}
                        selectedItem={card.metric}
                        onSelectItem={this._handleSelectedItem}
                        boardId={FunctionHelper.getId(card.board)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <PlanningDateInput
                        propName="startPlanningDate"
                        value={startPlanningDateValue}
                        compareTo={startExecutionDateValue}
                        lessOrEqualThan={endPlanningDateValue}
                        onChange={this.props.onUpdateCard.bind(this, card)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <PlanningDateInput
                        propName="endPlanningDate"
                        value={endPlanningDateValue}
                        compareTo={endExecutionDateValue}
                        greaterOrEqualThan={startPlanningDateValue}
                        onChange={this.props.onUpdateCard.bind(this, card)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <DurationValue
                        start={startPlanningDateValue}
                        end={endPlanningDateValue}
                        emptyValue={'-'}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <ExecutionDateInput propName="startExecutionDate"
                        value={startExecutionDateValue}
                        lessOrEqualThan={endExecutionDateValue}
                        onChange={this.props.onUpdateCard.bind(this, card)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <ExecutionDateInput
                        propName="endExecutionDate"
                        value={endExecutionDateValue}
                        greaterOrEqualThan={startExecutionDateValue}
                        onChange={this.props.onUpdateCard.bind(this, card)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <DurationValue
                        start={startExecutionDateValue}
                        end={endExecutionDateValue}
                        emptyValue={'-'}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <NumberInput
                        propName="childrenMetricValue"
                        value={card.childrenMetricValue}
                        placeHolder="-"
                        change={this.props.onUpdateCard.bind(this, card)}
                        required={false}
                        normalStyle={{textAlign: 'center', margin: '2px', padding: '0px', cursor: 'pointer'}}
                        style={{border: '1px solid black', textAlign: 'left', width: '150px !important', margin: '2px', padding: '0px'}}
                        classLoading="isLoading"
                        classInvalid="k-inlineEdit invalid"
                    />
                </td>
                <td className="center aligned smallSelect" style={columnStyle}>
                    <ComboField
                        fieldName="childrenMetric"
                        label={''}
                        showAvatar={false}
                        style={{maxWidth: '160px'}}
                        placeHolder="-"
                        getSuggestionFunc={KanbanActions.boardSetting.metricType.search}
                        selectedItem={card.childrenMetric}
                        onSelectItem={this._handleSelectedItem}
                        boardId={FunctionHelper.getId(card.board)}
                    />
                </td>
                <td className="center aligned" style={columnStyle}>
                    <GrandChildrenCardsBasedCalculationInput
                        value={card.grandChildrenCardsBasedCalculation}
                        emptyValue={'-'}
                        onClick={this._handleOnToggleChildrenCardsBasedCalculation}
                    />
                </td>
                {this._renderRatings(card)}
            </tr>
        );
    }
}
