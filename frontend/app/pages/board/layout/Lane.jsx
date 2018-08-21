'use strict';

import React from 'react';
import classNames from 'classNames';
import {default as HeaderLane} from './HeaderLane.jsx';
import Immutable from 'immutable';
import * as airflux from 'airflux';

import {ImmutableState} from '../../../decorators';
import {FunctionHelper, BoardLayoutHelper} from '../../../commons';

import {default as HeaderSeparator} from './HeaderSeparator.jsx';
import {default as KCard} from '../show/KCard.jsx';

var StateRecord = Immutable.Record({isCollapsed: false});

//@ImmutableShouldUpdateComponent (TODO: Ver como fazer isso também com propriedades)
@ImmutableState
@airflux.FluxComponent
export default class Lane extends React.Component
{
    static displayName = 'Lane';

    static propTypes =
    {
        lane: React.PropTypes.object,
        index: React.PropTypes.number,
        numberOfSlibingLanes: React.PropTypes.number,
        isLoading: React.PropTypes.bool.isRequired,
        onMoveLeft: React.PropTypes.func.isRequired,
        onMoveRight: React.PropTypes.func.isRequired,
        onIncreaseCardWide: React.PropTypes.func.isRequired,
        onDecreaseCardWide: React.PropTypes.func.isRequired,
        onRemoveLane: React.PropTypes.func.isRequired,
        onAddChildLane: React.PropTypes.func.isRequired,
        onCloneLane: React.PropTypes.func.isRequired,
        onSplitLaneHorizontal: React.PropTypes.func.isRequired,
        onSplitLaneVertical: React.PropTypes.func.isRequired,
        onChangeTitle: React.PropTypes.func.isRequired,
        onChangeActivity: React.PropTypes.func.isRequired,
        onChangePolicy: React.PropTypes.func.isRequired,
        onChangeWipLimit: React.PropTypes.func.isRequired,
        onChangeLaneType: React.PropTypes.func.isRequired,
        onToggleDataMetric: React.PropTypes.func.isRequired
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord({isCollapsed: this.props.lane.isCollapsed})};
    }

    _handleCollpasedClick = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isCollapsed: !this.state.data.isCollapsed});
    };

    _renderDropzone()
    {
        const {lane, index, numberOfSlibingLanes} = this.props;  //eslint-disable-line
        const laneInfo = BoardLayoutHelper.getLaneInformation(lane, index, numberOfSlibingLanes);
        const cards = lane.cards;  //eslint-disable-line
        return (
            <div className="cards dropzone" style={{width: laneInfo.dropZoneWidth + 'px', maxWidth: laneInfo.dropZoneWidth + 'px'}}>
                <ul className={`ui ${FunctionHelper.toWords(lane.cardsWide)} specials cards laneContent`}>
                {
                    FunctionHelper.isDefined(cards) && cards.map(function(card, cardIndex)
                    {
                        return (
                            <li key={`${lane._id}_${cardIndex}_${card._id}`} style={{opacity: '0.5'}}>
                                <KCard key={`${card._id}`} card={card} isReadOnly/>
                            </li>
                        );
                    })
                }
                </ul>
            </div>
        );
    }

    _renderSubLane()
    {
        const that = this;
        const {lane, index, numberOfSlibingLanes, isLoading} = this.props;  //eslint-disable-line
        const laneInfo = BoardLayoutHelper.getLaneInformation(lane, index, numberOfSlibingLanes);
        const subLanesClassName = classNames({
            subLanes: true,
            horizontal: laneInfo.isHorizontalChildrenOrientation,
            vertical: laneInfo.isVerticalChildrenOrientation
        });
        return (
            <div className={'subLaneRow'}>
                <div className={subLanesClassName}>
                {
                    FunctionHelper.isDefined(lane.children) && lane.children.map(function(subLane, subIndex)
                    {
                        return (
                            <Lane
                                isLoading={isLoading}
                                key={`${subLane._id}`}
                                lane={subLane} index={subIndex} numberOfSlibingLanes={lane.children.length}
                                onMoveLeft={that.props.onMoveLeft} onMoveRight={that.props.onMoveRight}
                                onIncreaseCardWide={that.props.onIncreaseCardWide} onDecreaseCardWide={that.props.onDecreaseCardWide}
                                onRemoveLane={that.props.onRemoveLane} onAddChildLane={that.props.onAddChildLane} onCloneLane={that.props.onCloneLane}
                                onSplitLaneHorizontal={that.props.onSplitLaneHorizontal} onSplitLaneVertical={that.props.onSplitLaneVertical}
                                onChangeTitle={that.props.onChangeTitle} onChangeWipLimit={that.props.onChangeWipLimit}
                                onChangeActivity={that.props.onChangeActivity} onChangePolicy={that.props.onChangePolicy}
                                onChangeLaneType={that.props.onChangeLaneType}
                                onToggleDataMetric={that.props.onToggleDataMetric}
                            />
                        );
                    })
                }
                </div>
            </div>
        );
    }

    render()
	{
        const that = this;
        const {lane, index, isLoading, numberOfSlibingLanes} = this.props;  //eslint-disable-line
        const {isCollapsed} = this.state.data;  //eslint-disable-line
        const laneInfo = BoardLayoutHelper.getLaneInformation(lane, index, numberOfSlibingLanes);

        const containerClassName = classNames({
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
            expandable: true
        });

        const innerContainerClassName = classNames({
            [`level${lane.depth}`]: true,
            lane: true,
            horizontal: laneInfo.isHorizontalLane,
            vertical: laneInfo.isVerticalLane,
            first: laneInfo.isFirstLane,
            middle: laneInfo.isMiddleLane,
            last: laneInfo.isLastLane,
            leaf: laneInfo.isLeafLane,
            parent: !laneInfo.isLeafLane,
            expandable: true
        });

        const cards = lane.cards;  //eslint-disable-line
        const pathStr = lane.pathStr.replace('/root', '');
        return (
            <div className={containerClassName}>
                <div className={innerContainerClassName} style={{width: '100%'}} title={pathStr}>
                    <div className={'laneTable'}>
                        <HeaderLane
                            lane={lane}
                            isLoading={isLoading}
                            isLeafLane={laneInfo.isLeafLane}
                            isFirstLane={laneInfo.isFirstLane}
                            isLastLane={laneInfo.isLastLane}
                            isMiddleLane={laneInfo.isMiddleLane}
                            isTopLevelLane={laneInfo.isTopLevelLane}
                            isHorizontalLane={laneInfo.isHorizontalLane}
                            isVerticalLane={laneInfo.isVerticalLane}
                            isCollapsed={isCollapsed} onCollapsed={this._handleCollpasedClick}
                            onMoveLeft={this.props.onMoveLeft} onMoveRight={this.props.onMoveRight}
                            onIncreaseCardWide={this.props.onIncreaseCardWide} onDecreaseCardWide={this.props.onDecreaseCardWide}
                            onRemoveLane={this.props.onRemoveLane} onAddChildLane={this.props.onAddChildLane} onCloneLane={this.props.onCloneLane}
                            onSplitLaneHorizontal={this.props.onSplitLaneHorizontal} onSplitLaneVertical={this.props.onSplitLaneVertical}
                            onChangeTitle={that.props.onChangeTitle} onChangeWipLimit={that.props.onChangeWipLimit}
                            onChangeActivity={that.props.onChangeActivity} onChangePolicy={that.props.onChangePolicy}
                            onChangeLaneType={that.props.onChangeLaneType}
                            onToggleDataMetric={that.props.onToggleDataMetric}
                        />
                        <HeaderSeparator/>
                        {!laneInfo.isLeafLane && this._renderSubLane()}
                        {laneInfo.isLeafLane && this._renderDropzone()}
                    </div>
                </div>
            </div>
        );

    }
}
