'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';

import {LocalStorageManager, BoardLayoutHelper} from '../../../commons';
import {ImmutableState} from '../../../decorators';
import {SwimLaneType} from '../../../enums';
import {UserEntity} from '../../../entities';
import {default as Lane} from './Lane.jsx';
import {default as SwimLaneHeader} from './SwimLaneHeader.jsx';
import {default as SwimLaneHeaderCollapsed} from './SwimLaneHeaderCollapsed.jsx';

var StateRecord = Immutable.Record({isCollapsed: false, wip: 0});

@ImmutableState
@airflux.FluxComponent
export default class SwimLane extends React.Component
{
    static displayName = 'SwimLane';

    static propTypes =
    {
        isEmpty: React.PropTypes.bool,
        board: React.PropTypes.object,
        selectedVisualStyle: React.PropTypes.object,
        selectedAgingExhibitionMode: React.PropTypes.string,
        selectedSwimLaneStyle: React.PropTypes.object,
        swimLane: React.PropTypes.object,
        cardMetrics: React.PropTypes.object,
        swimLaneIndex: React.PropTypes.number,
        cardFilterFunction: React.PropTypes.func.isRequired
    };

    static defaultProps =
    {
        isEmpty: false
    };

    constructor(props)
    {
        super(props);
        const localStorageIsCollapsed = LocalStorageManager.getBoardLaneIsCollapsed(this._getIDForLocalStorage());
        if (props.isEmpty)
        {
            this.state = {data: new StateRecord({isCollapsed: true})};
        }
        else
        {
            this.state = {data: new StateRecord({isCollapsed: localStorageIsCollapsed})};
        }
    }

     _getIDForLocalStorage = () =>
    {
        const {swimLane, selectedSwimLaneStyle} = this.props;
        if (swimLane._id === SwimLaneType.notClassified.name) //valor configurado em SwimLaneBoard.jsx
        {
            return this.props.board._id + '_' + selectedSwimLaneStyle.type + '_nc';
        }
        switch (selectedSwimLaneStyle.type)
        {
            case SwimLaneType.members.name: return this.props.board._id + '_' + new UserEntity(swimLane.user).nickname;
            default: return this.props.board._id + '_' + swimLane._id;
        }
    }

    _handleCollpasedClick = (e) =>
    {
        e.preventDefault();

        const newValue = !this.state.data.isCollapsed;
        LocalStorageManager.setBoardLaneIsCollapsed(this._getIDForLocalStorage(), newValue);
        this.setImmutableState({isCollapsed: newValue});
    };

    render()
    {
        let {isCollapsed} = this.state.data;
        const {board, selectedAgingExhibitionMode, cardMetrics, selectedVisualStyle, selectedSwimLaneStyle, swimLane, swimLaneIndex, cardFilterFunction} = this.props;
        //const swimLaneCardMetrics = LaneHelper.getSwimLaneWip(board.layout, selectedSwimLaneStyle, swimLane);
        const isWipLimitOverFlow = cardMetrics && swimLane.wipLimit && (cardMetrics.wipCards > swimLane.wipLimit);
        const wipClassName = isWipLimitOverFlow ? 'wipLimitOverflow' : 'wipLimitNotOverflowSwimLane';
        if (BoardLayoutHelper.isVerticalOrientation(selectedVisualStyle))
        {
            isCollapsed = false;
        }
        return (
            <div>
            {
                !isCollapsed &&
                    <div className="kboard">
                        <div className={`lanes top horizontal first parent ${wipClassName} expandable`}>
                            <SwimLaneHeader swimLane={swimLane} swimLaneStyle={selectedSwimLaneStyle} swimLaneCardMetrics={cardMetrics} onCollapsed={this._handleCollpasedClick} isCollapsed={isCollapsed}/>
                            {
                                board.layout.rootNode.children.map(function(lane, laneIndex)
                                {
                                    return <Lane cardFilterFunction={cardFilterFunction.bind(this, swimLane)} swimLane={swimLane} key={`${swimLane._id}_${swimLaneIndex}_${lane._id}`} lane={lane} numberOfSlibingLanes={board.layout.rootNode.children.length} index={laneIndex} visualStyle={selectedVisualStyle} agingExhibitionMode={selectedAgingExhibitionMode}/>;
                                })
                            }
                        </div>
                    </div>
            }
            {
                (isCollapsed) &&
                    <div>
                        <div className={`lanes top horizontal first parent ${wipClassName} expandable`}>
                            <SwimLaneHeaderCollapsed swimLane={swimLane} swimLaneStyle={selectedSwimLaneStyle} swimLaneCardMetrics={cardMetrics} onCollapsed={this._handleCollpasedClick} isCollapsed={isCollapsed}/>
                        </div>
                    </div>
            }
            </div>
        );
    }
}
