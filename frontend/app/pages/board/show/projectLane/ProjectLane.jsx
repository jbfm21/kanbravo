'use strict';

import React from 'react';
import classNames from 'classNames';
import {default as HeaderLane} from './HeaderLane.jsx';
import * as airflux from 'airflux';

import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {default as constants} from '../../../../commons/Constants';

import {default as HeaderSeparator} from './HeaderSeparator.jsx';
import {default as ProjectCard} from './ProjectCard.jsx';


//@ImmutableShouldUpdateComponent (TODO: Ver como fazer isso também com propriedades)
@ImmutableState
@airflux.FluxComponent
export default class Lane extends React.Component
{
    static displayName = 'Lane';

    static propTypes =
    {
        projectCardStatistic: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
    }

    render()
	{
        let {lane, index, isFirstLane, isLastLane, loading} = this.props;  //eslint-disable-line

        let isFirstDepth = true;
        let orientationClassName = 'horizontal';
        let expandableClassName = 'expandable';

        let containerClassName = classNames({
            top: isFirstDepth,
            [orientationClassName]: true,
            lanes: true,
            lastLane: false,
            wipLimitNotOverflowInTopLane: true,
            wipLimitOverflow: false,
            collapsed: false
        });

        let containerStyle = {verticalAlign: 'top'};

        let innerContainerClassName = classNames({
            lastLane: isLastLane,
            ['level1']: true,
            [orientationClassName]: true,
            [expandableClassName]: true,
            lane: true
        });

        let innerContainerStyle = {minWidth: constants.CARD_WIDTH + 'px'};
        let innerContainerStyleForLastLane = null;
        if (innerContainerStyleForLastLane)
        {
            //TODO: Retirado o maxWidth
            //innerContainerStyle['maxWidth'] = innerContainerStyleForLastLane.maxWidth; //eslint-disable-line
        }

        let cards = this.props.projectCardStatistic.projects;  //eslint-disable-line
        return (
            <div className={containerClassName} style={containerStyle}>
                <div style={innerContainerStyle}>
                    <div className={innerContainerClassName} style={innerContainerStyle}>
                        <HeaderLane/>
                        <HeaderSeparator/>
                        <div className="cards dropzone">
                            <ul className={'ui one specials cards laneContent'}>
                                {
                                    FunctionHelper.isDefined(cards) &&
                                        cards.map(function(card)
                                        {
                                            return (
                                                <li key={FunctionHelper.uuid()}>
                                                    <ProjectCard key={FunctionHelper.uuid()} card={card}/>
                                                </li>
                                            );
                                        })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}
