'use strict';

import React from 'react';
import classNames from 'classNames';
import {default as HeaderLane} from './HeaderLane.jsx';
import Immutable from 'immutable';
import * as airflux from 'airflux';

import {ImmutableState} from '../../../decorators';

import {BoardLayoutHelper, LocalStorageManager} from '../../../commons';
import {AgingType} from '../../../enums';

import {default as HeaderSeparator} from './HeaderSeparator.jsx';
import {default as LaneDropZone} from './LaneDropZone.jsx';

var StateRecord = Immutable.Record({isCollapsed: false, wip: 0});

//@ImmutableShouldUpdateComponent (TODO: Ver como fazer isso também com propriedades)
@ImmutableState
@airflux.FluxComponent
export default class Lane extends React.Component
{
    static displayName = 'Lane';

    static propTypes =
    {
        lane: React.PropTypes.object,
        visualStyle: React.PropTypes.object,
        agingExhibitionMode: React.PropTypes.string,
        swimLane: React.PropTypes.object,
        index: React.PropTypes.number,
        cardFilterFunction: React.PropTypes.func,
        numberOfSlibingLanes: React.PropTypes.number
    };

    static defaultProps =
    {
        visualStyle: BoardLayoutHelper.defaultVisualStyle(),
        agingExhibitionMode: AgingType.none.name
    }

    constructor(props)
    {
        super(props);

        const localStorageIsCollapsed = LocalStorageManager.getBoardLaneIsCollapsed(this._getIDForLocalStorage());
        this.state = {data: new StateRecord({isCollapsed: localStorageIsCollapsed})};
    }

    _getIDForLocalStorage = () =>
    {
        const {swimLane, lane} = this.props;
        if (swimLane)
        {
            return swimLane._id + '_' + lane._id;
        }
        return lane._id;
    }

    _handleWipChange = (wip) =>
    {
        this.setImmutableState({wip: wip});
    };

    _handleCollpasedClick = (e) =>
    {
        e.preventDefault();
        const newValue = !this.state.data.isCollapsed;
        LocalStorageManager.setBoardLaneIsCollapsed(this._getIDForLocalStorage(), newValue);
        this.setImmutableState({isCollapsed: newValue});
    };

    _renderHeaderSeparator = () =>
    {
        const {lane, index, numberOfSlibingLanes} = this.props;  //eslint-disable-line
        let {isCollapsed} = this.state.data;  //eslint-disable-line
        if (BoardLayoutHelper.isVerticalOrientation(this.props.visualStyle))
        {
            isCollapsed = false;
        }
        const laneInfo = BoardLayoutHelper.getLaneInformation(lane, index, numberOfSlibingLanes);
        const isHorizontalCollapsed = laneInfo.isHorizontalLane && isCollapsed;
        if (isHorizontalCollapsed)
        {
            return null;
        }
        return (<HeaderSeparator/>);
    }

    render()
	{
        const {lane, index, numberOfSlibingLanes, visualStyle, agingExhibitionMode, cardFilterFunction, swimLane} = this.props;  //eslint-disable-line
        const {wip} = this.state.data;  //eslint-disable-line
        let {isCollapsed} = this.state.data;  //eslint-disable-line
        if (BoardLayoutHelper.isVerticalOrientation(this.props.visualStyle))
        {
            isCollapsed = false;
        }

        const laneInfo = BoardLayoutHelper.getLaneInformation(lane, index, numberOfSlibingLanes);
        const isWipLimitOverflow = lane.wipLimit && (wip > lane.wipLimit);

        let containerClassName = classNames({
            lanes: true,
            top: laneInfo.isTopLevelLane,
            notTop: !laneInfo.isTopLevelLane,
            horizontal: laneInfo.isHorizontalLane,
            vertical: laneInfo.isVerticalLane,
            first: laneInfo.isFirstLane,
            middle: laneInfo.isMiddleLane,
            last: laneInfo.isLastLane,
            leaf: laneInfo.isLeafLane,
            parent: !laneInfo.isLeafLane,
            wipLimitNotOverflowInTopLane: true,
            expandable: !isCollapsed,
            collapsed: isCollapsed
        });

        let innerContainerClassName = classNames({
            [`level${lane.depth}`]: true,
            lane: true,
            horizontal: laneInfo.isHorizontalLane,
            vertical: laneInfo.isVerticalLane,
            first: laneInfo.isFirstLane,
            middle: laneInfo.isMiddleLane,
            last: laneInfo.isLastLane,
            leaf: laneInfo.isLeafLane,
            parent: !laneInfo.isLeafLane,
            expandable: !isCollapsed,
            wipLimitOverflow: isWipLimitOverflow,
            collapsed: isCollapsed
        });

        let subLanesClassName = classNames({
            subLanes: true,
            horizontal: laneInfo.isHorizontalChildrenOrientation,
            vertical: laneInfo.isVerticalChildrenOrientation
        });
        const pathStr = lane.pathStr.replace('/root', '');
        return (
            <div className={containerClassName}>
                <div className={innerContainerClassName} style={{width: '100%', height: '100%'}} title={pathStr}>
                    <div className={'laneTable'}>
                    <HeaderLane
                        visualStyle={visualStyle}
                        agingExhibitionMode={agingExhibitionMode}
                        lane={lane}
                        isLeafLane={laneInfo.isLeafLane}
                        isFirstLane={laneInfo.isFirstLane}
                        isLastLane={laneInfo.isLastLane}
                        isMiddleLane={laneInfo.isMiddleLane}
                        isTopLevelLane={laneInfo.isTopLevelLane}
                        isHorizontalLane={laneInfo.isHorizontalLane}
                        isVerticalLane={laneInfo.isVerticalLane}
                        isCollapsed={isCollapsed}
                        onWipChange={this._handleWipChange}
                        onCollapsed={this._handleCollpasedClick}/>
                    {
                        !laneInfo.isLeafLane && !isCollapsed &&
                            <div className={'subLaneRow'}>
                                <div className={subLanesClassName}>
                                {
                                    lane.children.map(function(subLane, subIndex)
                                    {
                                        return (
                                            <Lane key={`${swimLane._id}_${subLane._id}`}
                                                cardFilterFunction={cardFilterFunction}
                                                swimLane={swimLane}
                                                visualStyle={visualStyle}
                                                agingExhibitionMode={agingExhibitionMode}
                                                lane={subLane}
                                                index={subIndex}
                                                numberOfSlibingLanes={lane.children.length} />
                                        );
                                    })
                                }
                                </div>
                            </div>
                    }
                    {
                        laneInfo.isLeafLane && !isCollapsed &&
                            <LaneDropZone cardFilterFunction={cardFilterFunction} key={`${swimLane._id}_${lane._id}`} swimLane={swimLane} lane={lane} agingExhibitionMode={agingExhibitionMode} visualStyle={visualStyle}/>
                    }
                    </div>
                </div>
            </div>
        );

    }
}
