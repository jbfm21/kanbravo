'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {Icon, List, Item} from 'react-semantify';
import classNames from 'classNames';

import {BoardLayoutHelper, FunctionHelper} from '../../../commons';
import {UIActions} from '../../../actions';

import {ImmutableState} from '../../../decorators';
import {Avatar} from '../../../components';
import {default as LaneHelper} from './LaneHelper';


var StateRecord = Immutable.Record({wip: 0});

@airflux.FluxComponent
@ImmutableState
export default class HeaderLane extends React.Component
{
    static displayName = 'HeaderLane';

    static propTypes =
    {
        lane: React.PropTypes.object.isRequired,
        isFirstLane: React.PropTypes.bool.isRequired,
        isLastLane: React.PropTypes.bool.isRequired,
        isMiddleLane: React.PropTypes.bool.isRequired,
        isLeafLane: React.PropTypes.bool.isRequired,
        isTopLevelLane: React.PropTypes.bool.isRequired,
        isHorizontalLane: React.PropTypes.bool.isRequired,
        isVerticalLane: React.PropTypes.bool.isRequired,
        isCollapsed: React.PropTypes.bool.isRequired,
        onCollapsed: React.PropTypes.func.isRequired,
        visualStyle: React.PropTypes.object,
        onWipChange: React.PropTypes.func.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(UIActions.refreshHeaderWip, this._listenToRefreshHeaderWip);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
    {
        const wip = LaneHelper.getLaneWip(this.props.lane);
        if (wip !== this.state.wip)
        {
            this.props.onWipChange(wip);
            this.setImmutableState({wip: wip});
        }
    }

    _listenToRefreshHeaderWip(lane) //eslint-disable-line
    {
        //TODO: Verificar se tem como fazer o cálculo somente das raias alteradas, para melhorar a performance
        const wip = LaneHelper.getLaneWip(this.props.lane);
        if (wip !== this.state.wip)
        {
            this.props.onWipChange(wip);
            this.setImmutableState({wip: wip});
            this.forceUpdate();
        }
    }

    _isToShow = (visualEntityName) =>
    {
        const {visualStyle} = this.props;
        return BoardLayoutHelper.isToShow(visualStyle, visualEntityName);
    };

    _renderCollapsedButtom = () =>
    {
        const {visualStyle, isCollapsed, isHorizontalLane, isTopLevelLane, isVerticalLane} = this.props;
        const collapsedIcon = (isCollapsed) ? 'plus' : 'minus';
        //TODO: implementar colapsar quando orientacao for vertical
        const isToShowCollapseButton = ((isHorizontalLane && isTopLevelLane) || (isVerticalLane)) && (!visualStyle || (visualStyle && visualStyle.orientation !== 'vertical'));
        if (!isToShowCollapseButton)
        {
            return null;
        }
        return <Icon style={{lineHeight: 1.8}} className={`item black ${collapsedIcon} square outline mini pointer mouse no-print`} onClick={this.props.onCollapsed} />;

    }

    _renderLaneTypeIcon = () =>
    {
        const {lane} = this.props;
        const isToShowLaneTypeIcon = FunctionHelper.isDefined(lane.laneType) && this._isToShow('laneType');
        if (!isToShowLaneTypeIcon)
        {
            return null;
        }
        const laneTypeAvatar = BoardLayoutHelper.getLaneTypeAvatar(lane.laneType, null);
        return <Avatar isToShowBackGroundColor hostStyle={{width: null, height: null, lineHeight: 1.8}} hostClassName="item" style={{width: '7px', height: '7px', fontSize: '10px', lineHeight: '1.4'}} avatar={laneTypeAvatar}/>;
    }

    _renderActivityIcon = () =>
    {
        const {lane} = this.props;
        const isToShowActivityIcon = FunctionHelper.isNotNullOrEmpty(lane.activity) && this._isToShow('laneActivity');
        if (!isToShowActivityIcon)
        {
            return null;
        }
        return (
            <Item style={{lineHeight: 1.8}}>
                <span className={'ui mini label'} style={{padding: '3px'}}>{lane.activity}</span>
            </Item>);
    }

    _renderPolicyIcon = () =>
    {
        const {lane} = this.props;
        const isToShowPolicyIcon = FunctionHelper.isNotNullOrEmpty(lane.policy) && this._isToShow('lanePolicy');
        if (!isToShowPolicyIcon)
        {
            return null;
        }
        return (<Item style={{lineHeight: 1.8}}>
                    <Icon className={'info circle icon right position no-print'} title={lane.policy} />
                </Item>
        );
    }

    _getWipOverFlowColorClassName = () =>
    {
        const {lane} = this.props;
        const {wip} = this.state.data;
        return BoardLayoutHelper.getIsLaneWipOverFlowColor(lane, wip);
    }

    _renderLeftMargin = () =>
    {
        return (<Item style={{minWidth: '5px', width: '5px', maxWidth: '5px', margin: '0px', padding: '0px'}} />);
    }

    _renderWip = () =>
    {
        const {lane, isHorizontalLane, isCollapsed} = this.props;
        const {wip} = this.state.data;
        const isToShowWipLimitValue = FunctionHelper.isDefined(lane.wipLimit) && lane.wipLimit > 0 && !(isHorizontalLane && isCollapsed);
        const wipOverFlowColorClassName = this._getWipOverFlowColorClassName();
        return (
            <Item style={{lineHeight: 1.8}}>
                <div className={`ui small ${wipOverFlowColorClassName} label right position default mouse cardLimit`} style={{marginTop: '0px', padding: '4px'}}>
                    {wip}
                    {
                        isToShowWipLimitValue &&
                            <span>{`/${lane.wipLimit}`}</span>
                    }
                </div>
            </Item>);
    }

    render()
	{
        const {lane, isCollapsed, visualStyle, isFirstLane, isMiddleLane, isLeafLane, isTopLevelLane, isHorizontalLane, isVerticalLane, isLastLane, loading} = this.props; //eslint-disable-line
        const upperCaseStyle = isTopLevelLane ? 'uppercase' : '';

        const isToShowLaneInNotCollapsedFormat = (!isCollapsed || (isCollapsed && isVerticalLane));
        const isToShowLaneInCollapsedFormat = isCollapsed && isHorizontalLane;

        const containerClassName = classNames({
            header: true,
            'default mouse': true,
            showBoard: true,
            top: isTopLevelLane,
            notTop: !isTopLevelLane,
            horizontal: isHorizontalLane,
            vertical: isVerticalLane,
            first: isFirstLane,
            middle: isMiddleLane,
            last: isLastLane,
            leaf: isLeafLane,
            parent: !isLeafLane
        });

        return (
            <div className={containerClassName}>
                {
                     isToShowLaneInNotCollapsedFormat &&
                         <List className="horizontal laneHeaderInfo" style={{padding: '0px', display: 'inline-flex', width: '100%'}}>
                            {this._renderCollapsedButtom()}
                            {this._renderLeftMargin()}
                            {this._renderLaneTypeIcon()}
                            {this._renderActivityIcon()}
                            <Item style={{width: '100%', lineHeight: 1.8}}>
                                <div className={`title ${upperCaseStyle} text`} style={{whiteSpace: 'nowrap', textAlign: 'center', width: 'inherit'}}>{lane.title}</div>
                            </Item>
                            {this._renderPolicyIcon()}
                            {this._renderWip()}
                            {this._renderLeftMargin()}
                         </List>
                }
                {
                    isToShowLaneInCollapsedFormat &&
                        <div>
                            <Icon className="tiny black plus square outline mini pointer mouse" style={{marginTop: '5px', marginLeft: '2px'}} onClick={this.props.onCollapsed} />
                            <div className={`ui ${this._getWipOverFlowColorClassName()} circular tiny label numberOfCardInLane`}>
                                {this.state.data.wip}
                            </div>
                            <p className="title rotate uppercase text">{lane.title}</p>
                        </div>
                }
            </div>
        );
    }
}
