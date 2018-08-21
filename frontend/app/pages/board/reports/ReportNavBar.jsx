import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';
import {Icon, Menu} from 'react-semantify';

import {NavLink} from '../../../components';

const messages = defineMessages(
{
    backlog: {id: 'board.reports.navbar.backlog', description: 'Backlog Report', defaultMessage: 'Backlog'},
    archive: {id: 'board.reports.navbar.archive', description: 'Archive Report', defaultMessage: 'Arquivados'},
    leadTime: {id: 'board.reports.navbar.leadTime', description: 'LeadTIme Report', defaultMessage: 'Lead Time'},
    allocation: {id: 'board.reports.navbar.allocation', description: 'Allocation Report', defaultMessage: 'Alocação'}
});

export default class SettingNavBar extends React.Component
{

    static displayName = 'SettingNavBar';

    static propTypes = {
        boardId: React.PropTypes.string
    };

    render()
    {
        let {boardId} = this.props;
        return (
            <Menu className="secondary vertical tabular pointing blue settingMenu">
                <NavLink to={`/boards/${boardId}/reports/archive`} className="item"><Icon className="archive"/><FormattedMessage {...messages.archive} /></NavLink>
                <NavLink to={`/boards/${boardId}/reports/backlog`} className="item"><Icon className="grid layout"/><FormattedMessage {...messages.backlog} /></NavLink>
                <NavLink to={`/boards/${boardId}/reports/leadTime`} className="item"><Icon className="area chart"/><FormattedMessage {...messages.leadTime} /></NavLink>
                <NavLink to={`/boards/${boardId}/reports/allocation`} className="item"><Icon className="users"/><FormattedMessage {...messages.allocation} /></NavLink>
            </Menu>
        );
    }
}
