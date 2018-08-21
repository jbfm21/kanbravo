import React from 'react';
import * as airflux from 'airflux';

import {Grid, Column} from 'react-semantify';

import {RouterNavigator} from '../../../commons';
import {default as SettingNavbar} from './SettingNavbar.jsx';

@airflux.FluxComponent
export default class BoardSettingPage extends React.Component
{
    static displayName = 'BoardSettingPage';

    static propTypes =
    {
        children: React.PropTypes.node,
        params: React.PropTypes.object
    };

    componentDidMount()
    {
        let pathname = document.location.pathname; //eslint-disable-line no-undef
        if (pathname.endsWith('/settings'))
        {
            RouterNavigator.navigateTo(pathname + '/generalConfig');
        }
    }

    render()
    {
        let boardId = this.props.params.boardId;
        return (
            <Grid className="stackable column" style={{width: '100%'}}>
                <Column className="wide k-board-setting-menu" style={{width: '15.75%'}}>
                    <SettingNavbar boardId={boardId} />
                </Column>
                <Column className="thirteen wide k-board-setting-container">
                    {this.props.children}
                </Column>
            </Grid>
        );
    }
}
