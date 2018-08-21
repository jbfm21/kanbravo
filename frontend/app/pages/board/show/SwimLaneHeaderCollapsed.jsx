'use strict';

import React from 'react';
import * as airflux from 'airflux';
import {Icon} from 'react-semantify';

import {Avatar} from '../../../components';
import {FunctionHelper, BoardLayoutHelper} from '../../../commons';
import {UserEntity} from '../../../entities';
import {SwimLaneType} from '../../../enums';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

const messages = defineMessages(
{
    notStartedTitle: {id: 'swimLaneHeaderCollapsed.notStartedTitle', description: '', defaultMessage: 'não iniciados: '}
});


@airflux.FluxComponent
class SwimLaneHeaderCollapsed extends React.Component
{
    static displayName = 'SwimLaneHeaderCollapsed';

    static propTypes =
    {
        swimLaneStyle: React.PropTypes.object,
        swimLane: React.PropTypes.object,
        swimLaneCardMetrics: React.PropTypes.object,
        isCollapsed: React.PropTypes.bool.isRequired,
        onCollapsed: React.PropTypes.func.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    componentWillMount()
	{
    }

    _getAvatarSwimLane = (swimLaneStyle, swimLane) =>
    {
        if (swimLane._id === SwimLaneType.notClassified.name) //valor configurado em SwimLaneBoard.jsx
        {
            return null;
        }
        let avatar = null;
        switch (swimLaneStyle.type)
        {
            case SwimLaneType.members.name:
                avatar = new UserEntity(swimLane.user).avatar;
                break;
            default:
                avatar = swimLane.avatar;
                break;
        }
        return (<Avatar isToShowBackGroundColor isToShowBorder={true} isToShowSmallBorder isSquareImageDimension={true} avatar={avatar} hostStyle={{width: null, height: null, display: 'inline-flex'}} style={{width: '20px', padding: '0px'}}/>);
    }

    _getTitle = (swimLane, swimLaneStyle) =>
    {
        if (swimLane._id === SwimLaneType.notClassified.name) //valor configurado em SwimLaneBoard.jsx
        {
            return swimLane.title;
        }
        switch (swimLaneStyle.type)
        {
            case SwimLaneType.members.name: return new UserEntity(swimLane.user).nickname;
            default: return swimLane.title;
        }
    }

    render()
    {
        //TODO: repetido com swimlaneheader
        const {swimLaneStyle, swimLane, swimLaneCardMetrics, onCollapsed} = this.props;
        const wipOverflowColor = BoardLayoutHelper.getWipOverFlowColor(swimLaneCardMetrics.wipCards, swimLane.wipLimit || 0);
        const isToShowWipLimitValue = FunctionHelper.isDefined(swimLane.wipLimit) && swimLane.wipLimit > 0;
        const isWipLimitOverFlow = swimLane.wipLimit && (swimLaneCardMetrics.wipCards > swimLane.wipLimit);
        const wipClassName = isWipLimitOverFlow ? 'wipLimitOverflow' : 'wipLimitNotOverflowSwimLane';
        const title = this._getTitle(swimLane, swimLaneStyle);
        const avatar = this._getAvatarSwimLane(swimLaneStyle, swimLane);
        return (
            <div className={`lanes top horizontal first parent ${wipClassName} collapsed`}>
                <div className="level1 lane horizontal first parent swimLaneCollapsed" style={{width: '100%', height: '100%'}}>
                    <div className="laneTable" style={{backgroundColor: 'inherit'}}>
                        <div className="header default mouse showBoard top horizontal first parent" style={{height: '23px', backgroundColor: 'white'}}>
                            <div style={{display: 'inline-flex'}}>
                                <Icon className="tiny black plus square outline mini pointer mouse" style={{marginLeft: '7px'}} onClick={onCollapsed}/>
                                <div className={`ui circular tiny label numberOfCardInLane ${wipOverflowColor}`} style={{height: '5px'}}>
                                    {swimLaneCardMetrics.wipCards}
                                    {isToShowWipLimitValue && <span>{`/${swimLane.wipLimit}`}</span>}
                                </div>
                                <div className="swimLaneTitle uppercase text" >{avatar} <span>{title}</span> <span style={{fontSize: '10px'}}>(<FormattedMessage {...messages.notStartedTitle}/>{swimLaneCardMetrics.totalCards - swimLaneCardMetrics.wipCards})</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = injectIntl(SwimLaneHeaderCollapsed);
