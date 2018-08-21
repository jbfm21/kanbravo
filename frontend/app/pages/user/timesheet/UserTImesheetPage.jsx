'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';


import {Header} from 'react-semantify';
import {Container, FaIcon} from '../../../components';

const messages = defineMessages(
    {
        underConstruction: {
        id: 'allocation.underConstruction',
        description: 'page under construction',
        defaultMessage: 'Em construção'
    }
});

export default class UserTimesheetPage extends React.Component
{
    static displayName = 'UserTimesheetPage';

    render()
    {
        return (
            <Container className="ui center aligned informationMessage">
                <FaIcon className="fa-umbrella fa-5x "/>
                <Header><FormattedMessage {...messages.underConstruction} /></Header>
            </Container>
        );
    }
}
