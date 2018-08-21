'use strict';
import React from 'react';

import * as airflux from 'airflux';
import _ from 'lodash';
import {FunctionHelper, BoardLayoutHelper} from '../../../../commons';

import {default as MemberWipPanelStore} from './MemberWipPanelStore';
import {default as LaneHelper} from '../LaneHelper';
import {default as BoardShowStore} from '../BoardShowStore.jsx';


import {List, Item} from 'react-semantify';
import {Avatar} from '../../../../components';
import {UserEntity} from '../../../../entities';
import {UIActions} from '../../../../actions';

@airflux.FluxComponent
export default class MemberWipPanel extends React.Component
{

    static displayName = 'MemberWipPanel';

    constructor(props)
    {
        super(props);
        this.listenTo(MemberWipPanelStore, this._listenToMemberWipPanelStoreChange);
    }

    _listenToMemberWipPanelStoreChange(store) //eslint-disable-line
    {
        if (store.actionState === UIActions.refreshMemberWipPanel)
        {
            this.forceUpdate();
        }
    }

    render()
	{
        const membersWips = LaneHelper.getMemberWip(BoardShowStore.getSelectedBoard().layout);
        if (FunctionHelper.isUndefined(membersWips) || _.isEmpty(membersWips))
        {
            return null;
        }
        let itemsToRender = [];
        let usersToRender = [];
        _.forOwn(membersWips, function(value, key) //eslint-disable-line
        {
            usersToRender.push(value);
        });

        usersToRender = _.sortBy(usersToRender, ['member.user.givenname', 'member.user.surname']);

        _.forEach(usersToRender, function (value)
        {
            const userEntity = new UserEntity(value.member.user);
            const avatar = userEntity.avatar;
            const wipOverflowColor = BoardLayoutHelper.getWipOverFlowColor(value.totalCards, value.member.wipLimit);
            const isToShowWipLimitValue = FunctionHelper.isDefined(value.member.wipLimit) && value.member.wipLimit > 0;
            itemsToRender.push(
                <Item key={`wippanel_${value.member._id}`} style={{display: 'inline-flex'}}>
                    <Avatar isToShowBackGroundColor avatar={avatar} hostStyle={{width: null, height: null}} style={{width: '25px', height: '25px', lineHeight: 1.5}} />
                    <div style={{fontWeight: 'bold', color: wipOverflowColor, lineHeight: 1.5, marginLeft: '5px'}}>
                        {value.totalCards}
                        {isToShowWipLimitValue && <span>{`/${value.member.wipLimit}`}</span>}
                    </div>
                </Item>
            );
        });
        return (
            <List className="horizontal divided" style={{borderTop: '1px solid black', borderBottom: '1px solid black', padding: '0px', display: 'inline-flex', width: '100%', backgroundColor: '#ddd'}}>
                {itemsToRender}
            </List>
        );
    }
}

