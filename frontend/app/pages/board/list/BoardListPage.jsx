'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, FormattedMessage} from 'react-intl';
import {Header} from 'react-semantify';
import _ from 'lodash';

import {KanbanActions} from '../../../actions';
import {BoardListStore} from '../../../stores';
import {Container, Cards, LoadServerContent} from '../../../components';
import {FunctionHelper} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {BoardVisibility} from '../../../enums';


import {default as BoardListEmpty} from './BoardListEmpty.jsx';
import {default as BoardListItem} from './BoardListItem.jsx';

const messages = defineMessages(
{
    title: {id: 'board.list.title', description: 'Board list title', defaultMessage: 'Quadros que você participa'},
    publicReadOnlyBoards: {id: 'board.list.public.title', description: 'Public boards list title', defaultMessage: 'Quadros públicos - Somente visualização'},
    publicWriteBoards: {id: 'board.list.publicWrite.title', description: 'Public Write boards list title', defaultMessage: 'Quadros públicos - Todos podem contribuir'}
});

var StateRecord = Immutable.Record({isLoading: false, boardList: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
export default class BoardListPage extends React.Component
{
    static displayName = 'BoardListPage';

    constructor(props)
    {
        super(props);
        this.listenTo(BoardListStore, this._listenToBoardListStoreChange);
        this.state = {data: new StateRecord()};
    }

    componentWillMount()
	{
        if (!this.state.data.boardList && !BoardListStore.state.isLoading)
		{
            this.setImmutableState({isLoading: true, boardList: null});
			KanbanActions.board.list.asFunction();
        }
    }

    _listenToBoardListStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.board.list.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.board.list.completed:
                this.setImmutableState({isLoading: false, boardList: store.state.boardList});
                break;
            case KanbanActions.board.list.failed:
                this.setImmutableState({isLoading: false, boardList: store.state.boardList});
                break;
            default: break;
        }
    }

    _renderMemberBoards = () =>
    {
        const {boardList} = this.state.data;
        let boardListIsMemberOf = _.filter(boardList, (item) => item.isMemberOf);
        if (FunctionHelper.isArrayNullOrEmpty(boardListIsMemberOf))
        {
            return (<BoardListEmpty/>);
        }
        return (
            <Container className="k-principal-container k-fullWidth">
                <Header className="k-title"><FormattedMessage {...messages.title} /></Header>
                <Cards>
                    {boardListIsMemberOf.map(function(board) {return (<BoardListItem key={board._id} board={board}/>);})}
                </Cards>
            </Container>
        );
    }

    _renderPublicReadOnlyBoards = () =>
    {
        const {boardList} = this.state.data;
        let publicBoardIsNotMemberOf = _.filter(boardList, (item) => !item.isMemberOf && item.visibility === BoardVisibility.public.name);
        if (FunctionHelper.isArrayNullOrEmpty(publicBoardIsNotMemberOf))
        {
            return null;
        }
        return (
            <Container className="k-principal-container k-fullWidth">
                <Header className="k-title"><FormattedMessage {...messages.publicReadOnlyBoards} /></Header>
                <Cards>
                    {publicBoardIsNotMemberOf.map(function(board) {return (<BoardListItem key={board._id} board={board}/>);})}
                </Cards>
            </Container>
        );
    }

    _renderPublicWriteBoards = () =>
    {
        const {boardList} = this.state.data;
        let publicBoardIsNotMemberOf = _.filter(boardList, (item) => !item.isMemberOf && item.visibility === BoardVisibility.publicWrite.name);
        if (FunctionHelper.isArrayNullOrEmpty(publicBoardIsNotMemberOf))
        {
            return null;
        }
        return (
           <Container className="k-principal-container k-fullWidth">
                <Header className="k-title"><FormattedMessage {...messages.publicWriteBoards} /></Header>
                <Cards>
                    {publicBoardIsNotMemberOf.map(function(board) {return (<BoardListItem key={board._id} board={board}/>);})}
                </Cards>
            </Container>
        );
    }

    render()
	{
        const {isLoading, boardList} = this.state.data;
        const isBoardListEmpty = FunctionHelper.isArrayNullOrEmpty(boardList);
        if (BoardListStore.state.isLoading)
        {
            return (<LoadServerContent isLoading={isLoading}/>);
        }

        if (isBoardListEmpty)
        {
            return (<LoadServerContent isLoading={isLoading}><BoardListEmpty/></LoadServerContent>);
        }

        return (
            <LoadServerContent isLoading={isLoading}>
                {this._renderMemberBoards()}
                {this._renderPublicReadOnlyBoards()}
                {this._renderPublicWriteBoards()}
                <Container className="k-principal-container k-fullWidth">
                    <span style={{color: 'white', margin: '5px'}}>Em breve você também poderá acompanhar nesta tela os itens de trabalho associados a você, lembretes e outras informações que te apoiarão no seu dia a dia...</span>
                </Container>
            </LoadServerContent>
        );
    }
}
