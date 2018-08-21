import React from 'react';
import * as airflux from 'airflux';

import {Grid, Column} from 'react-semantify';

import {RouterNavigator} from '../../../commons';
import {default as ReportNavbar} from './ReportNavbar.jsx';

@airflux.FluxComponent
export default class BoardReportPage extends React.Component
{
    static displayName = 'BoardReportPage';

    static propTypes =
    {
        children: React.PropTypes.node,
        params: React.PropTypes.object
    };

    componentDidMount()
    {
        let pathname = document.location.pathname; //eslint-disable-line no-undef
        if (pathname.endsWith('/reports'))
        {
            RouterNavigator.navigateTo(pathname + '/archive');
        }
    }

    render()
    {
        let boardId = this.props.params.boardId;
        return (
            <Grid className="stackable column" style={{width: '100%'}}>
                <Column className="wide k-board-setting-menu" style={{width: '15.75%'}}>
                    <ReportNavbar boardId={boardId} />
                </Column>
                <Column className="thirteen wide k-board-setting-container">
                    {this.props.children}
                </Column>
            </Grid>
        );
    }
}
