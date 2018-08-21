'use strict';
import React from 'react';

import {FunctionHelper} from '../../../../commons';

export default class ProjectCard extends React.Component
{

    static displayName = 'ProjectKCard';

    static propTypes =
    {
        card: React.PropTypes.object.isRequired
    };

    _renderBottomColor(projectCard) //eslint-disable-line
    {
        let backgroundColor = FunctionHelper.convertRgbaToString(projectCard.avatar.backgroundColor);
        return (
            <div style={{height: '7px', backgroundColor: backgroundColor}}></div>
        );
    }

    _renderHeader(card)
    {
        let backgroundColor = 'black';
        return (
            <div className="externalIdHeader" style={{width: '100%', maxHeight: '18px', display: 'inline-flex', backgroundColor: backgroundColor}}>
                <span style={{marginLeft: '5px', width: '100%', fontSize: '12px', fontWeight: 'bold'}}>
                    {card.title}
                </span>
            </div>
        );
    }

    _renderLaneStatistics(card)
    {
        return (
            <div style={{fontSize: '12px', marginTop: '2px'}}>
                {
                    FunctionHelper.isDefined(card.lanes) &&
                        card.lanes.map(function(lane)
                        {
                            return (
                                <div key={FunctionHelper.uuid()}><span style={{fontWeight: 'bold'}}>{lane.title}:</span>{lane.cards}</div>);
                        })
                }
            </div>
        );
    }
    render()
	{
        let {card} = this.props;
        return (
            <div className="ui card kanbanCard" onDoubleClick={this._handleCardFormModalShow}>
                <div className="cardItem" style={{backgroundColor: 'white'}} >
                    {this._renderHeader(card)}
                    {this._renderLaneStatistics(card)}
                    {this._renderBottomColor(card)}
                </div>
            </div>
        );
    }
}
