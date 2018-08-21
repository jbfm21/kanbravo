'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import {Header} from 'react-semantify';
import {Container, FaIcon, Description} from '../../../components';

const messages = defineMessages(
    {
        underConstruction: {
        id: 'allocation.underConstruction',
        description: 'page under construction',
        defaultMessage: 'Em breve você poderá gerir e digerir o seu backlog...'
    }
});

export default class BoardBacklogEmpty extends React.Component
{
    static displayName = 'BoardBacklogEmpty';

    static propTypes =
    {
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <Container className="ui setting center aligned informationMessage" style={{minHeight: '400px'}}>
                <FaIcon className="fa-calculator fa-5x "/>
                <Header><FormattedMessage {...messages.underConstruction} /></Header>
                <Description style={{color: 'white'}}>
                    Parabéns, seu backlog encontra-se vazio.
                </Description>
            </Container>
        );
    }
}

