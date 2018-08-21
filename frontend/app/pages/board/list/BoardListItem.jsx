'use strict';
import React from 'react';

import {defineMessages, FormattedMessage} from 'react-intl';
import {Icon, Card, Content, Header, Button} from 'react-semantify';

import {NavLink, Avatar, Meta, Description, Float} from '../../../components';

const messages = defineMessages(
{
    members: {id: 'board.list.members', description: 'members label', defaultMessage: '{numberOfMembers, plural, =0 {nenhum membro}  =1 {1 membro} other {# membros}}'},
    numberOfCards: {id: 'board.list.cards', description: 'cards label', defaultMessage: '{numberOfCards, plural, =0 {nenhum item}  =1 {1 item} other {# itens}}'},
    showBoard: {id: 'board.list.show', description: 'show board', defaultMessage: 'visualizar'}
});

export default class BoardListItem extends React.Component
{

    static displayName = 'BoardListItem';

    static propTypes = {board: React.PropTypes.object.isRequired};

    render()
	{
        const {board} = this.props;
        board.avatar['name'] = board.title; //eslint-disable-line dot-notation
        return (
            <Card className="board">
                <Content>
                    <Float className="right"><Avatar isToShowBackGroundColor style={{borderRadius: '500', borderColor: 'black', borderWidth: '1px', height: '30px', width: '30px'}} avatar={board.avatar} /></Float>
                    <Header title={board.title}>{board.title}</Header>
                    <Meta>{board.subtitle}</Meta>
                    <Description className="k-text withScrollBar" style={{fontSize: '12px'}}>{board.description}</Description>
                </Content>
                <Content className="extra">
                    <Float className="left">
                        <Icon className="users" />
                        <FormattedMessage values={{numberOfMembers: board.numberOfMembers}} {...messages.members} />
                    </Float>
                    <Float className="right">
                        <Icon className="tasks"/> <FormattedMessage values={{numberOfCards: board.numberOfCards}} {...messages.numberOfCards} />
                    </Float>
                </Content>
                <NavLink to={`/boards/${ board._id}`}>
                    <Button className="bottom attached">
                        <Icon className="unhide"/><FormattedMessage {...messages.showBoard} />
                    </Button>
                </NavLink>
            </Card>
        );
    }
}
