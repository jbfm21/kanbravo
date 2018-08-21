'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';


import {Header} from 'react-semantify';
import {Container, FaIcon} from '../../components';

const messages = defineMessages(
    {
        requestNotFound: {
        id: 'noMatchPage.http.requestNotFound',
        description: 'Request page not found',
        defaultMessage: 'Não foi possível processar sua solicitação. Página não encontrada'
    }
});

export default class NoMatchPage extends React.Component
{
    static displayName = 'NoMatchPage';

    render()
    {
        return (
            <Container className="ui center aligned informationMessage">
                <FaIcon className="fa-umbrella fa-5x "/>
                <Header><FormattedMessage {...messages.requestNotFound} /></Header>
            </Container>
        );
    }
}
