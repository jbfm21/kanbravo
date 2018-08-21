'use strict';
import React from 'react';
import _ from 'lodash';
import {Icon, Label} from 'react-semantify';
import {Avatar} from '../../../components';
import {FunctionHelper} from '../../../commons';
import {UIActions} from '../../../actions';
import {UserEntity} from '../../../entities';
import {EventType} from '../../../enums';


export default class EventComponent extends React.Component
{
    static displayName = 'EventComponent';

    static propTypes =
    {
        event: React.PropTypes.object,
        title: React.PropTypes.string
    };

    constructor(props)
    {
        super(props);
    }

    _getAvatar = (user) =>
    {
        return new UserEntity(user).avatar;
    }

    _handleCardFormModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        const card = this.props.event.card;
        let cloneCard = _.assign({}, card);
        UIActions.showCardFormModal.asFunction(card.board, cloneCard);
    };

    _renderEvent = () =>
    {
        let {event} = this.props;
        switch (event.type)
        {
            case EventType.startPlanningDate.name:
            {
                let style = {marginLeft: '5px'};
                return (
                    <span>
                        <Label className="mini" style={{fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>IP</Label>
                        <span style={style}>{event.title}</span>
                    </span>
                );
            }
            case EventType.endPlanningDate.name:
            {
                let style = {marginLeft: '5px'};
                return (
                    <span>
                        <Label className="mini" style={{fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>TP</Label>
                        <span style={style}>{event.title}</span>
                    </span>
                );
            }
            case EventType.startExecutionDate.name:
            {
                let style = {marginLeft: '5px'};
                return (
                    <span>
                        <Label className="mini brown" style={{fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>IR</Label>
                        <span style={style}>{event.title}</span>
                    </span>
                );
            }
            case EventType.endExecutionDate.name:
            {
                let style = {marginLeft: '5px'};
                return (
                    <span>
                        <Label className="mini brown" style={{fontWeight: 'bold', fontSize: '12px', padding: '3px'}}>TR</Label>
                        <span style={style}>{event.title}</span>
                    </span>
                );
            }
            case EventType.reminder.name:
            {
                let icon = event.completed ? 'alarm mute outline' : 'alarm';
                return (<span><Icon className={icon}/>{event.title} - {event.card.title}</span>);
            }
            case EventType.timesheet.name:
                let avatar = this._getAvatar(event.user);
                let formattedEffectiveWork = FunctionHelper.formatMinutesToHourAndMinutes(event.minutes);
                return (
                    <div style={{display: 'inline-flex'}}>
                        <Avatar avatar={avatar} hostStyle={{width: '13px', height: '13px', marginRight: '5px', display: 'inline-flex'}}/>
                        <span style={{marginLeft: '5px'}}>{`${formattedEffectiveWork} - ${event.card.title}`}</span>
                    </div>
                );
            default: break;
        }
        return event.title;
    }
    render()
	{
        return (
            <div onClick={this._handleCardFormModalShow}>{this._renderEvent()}</div>
        );
    }
}

