'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import {Header} from 'react-semantify';
import {Container, FaIcon} from '../../components';

const messages = defineMessages(
    {requestNotProccessed: {
        id: 'errorPage.http.notProcessed',
        description: 'Request not processed',
        defaultMessage: 'Não foi possível processar sua solicitação'
    }
});

export default class ErrorPage extends React.Component
{
    static displayName = 'ErrorPage';

    render()
    {
        return (
            <Container className="ui center aligned informationMessage">
                <FaIcon className="fa-umbrella fa-5x "/>
                <Header><FormattedMessage {...messages.requestNotProccessed} /></Header>
            </Container>
        );
    }
}
