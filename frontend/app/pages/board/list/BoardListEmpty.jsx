'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import {NavLink, Container, Content, FaIcon} from '../../../components';

const messages = defineMessages(
{
    emptyList: {id: 'board.list.empty', description: 'Board Empty List', defaultMessage: 'Ops! Que pena, você ainda não possui um quadro para organizar o seu dia a dia'},
    createBoard: {id: 'navbar.createBoard', description: 'Create Board Button', defaultMessage: 'Crie agora mesmo um quadro!'}
});

export default class BoardListEmpty extends React.Component
{
    static displayName = 'BoardListEmpty';

    render()
    {
        return (
            <Container className="ui center aligned informationMessage">
                <FaIcon className="fa-thumbs-o-down fa-5x"/>
                <Header><FormattedMessage {...messages.emptyList} /></Header>
                <NavLink to="/boards/add">
                    <Content className="ui massive teal label no-radius border" style={{fontSize: '20px', marginTop: 20 + 'px'}}><Icon className="small add"/><FormattedMessage {...messages.createBoard} /></Content>
                </NavLink>
            </Container>
        );
    }
}
