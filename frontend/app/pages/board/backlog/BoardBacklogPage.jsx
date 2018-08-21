'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';
import {List, Item} from 'react-semantify';
import Immutable from 'immutable';
import * as airflux from 'airflux';

import {Header} from 'react-semantify';
import {Container, FaIcon, Description, LoadServerContent} from '../../../components';
import {KanbanActions, UIActions} from '../../../actions';
import {FunctionHelper} from '../../../commons';
import {default as BoardBackLogStore} from './BoardBackLogStore.jsx';
import {default as BoardBacklogEmpty} from './BoardBacklogEmpty.jsx';

import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';

const messages = defineMessages(
    {
        underConstruction: {
        id: 'allocation.underConstruction',
        description: 'page under construction',
        defaultMessage: 'Em breve você poderá gerir e digerir o seu backlog...'
    }
});

var StateRecord = Immutable.Record({isLoading: false, cardList: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
export default class BoardBacklogPage extends React.Component
{
    static displayName = 'BoardBacklogPage';

    static propTypes =
    {
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord({})};
        this.listenTo(BoardBackLogStore, this._listenToBoardBacklogStoreChange);
    }

    componentWillMount()
    {
        KanbanActions.card.listInBacklog.asFunction(this.props.params.boardId);
    }

    _listenToBoardBacklogStoreChange(store)
    {
         switch (store.actionState)
        {
            case KanbanActions.card.listInBacklog.progressed:
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.card.listInBacklog.completed:
                this.setImmutableState({isLoading: false, cardList: store.state.cardList});
                break;
            case KanbanActions.card.listInBacklog.failed:
                this.setImmutableState({isLoading: false, cardList: []});
                break;
            default: break;
        }
    }

     _handleCardFormModalShow = (card, e) =>
    {
        if (e) {e.preventDefault();}
        UIActions.showClientSuccessMessage.asFunction('Em breve essa funcionalidade estará disponível....');
    };

    render()
    {
        let {cardList, isLoading} = this.state.data;
        let that = this;

        if (this.state.data.isLoading)
        {
            return (<LoadServerContent isLoading={isLoading}/>);
        }

        const isCardListEmpty = FunctionHelper.isArrayNullOrEmpty(cardList);

        return (
            <LoadServerContent isLoading={isLoading}>
                {isCardListEmpty && <BoardBacklogEmpty/>}
                {
                    !isCardListEmpty &&
                        <Container className="ui setting center aligned informationMessage" style={{minHeight: '400px'}}>
                            <FaIcon className="fa-calculator fa-5x "/>
                            <Header><FormattedMessage {...messages.underConstruction} /></Header>
                            <Description style={{color: 'white'}}>
                                Itens já cadastrados no backlog:
                                <List className="bulleted celled inverted divided" style={{textAlign: 'left'}}>
                                {
                                    cardList.map(card =>
                                    {
                                        return (<Item onDoubleClick={that._handleCardFormModalShow.bind(this, card)} key={`bkl_${card._id}`}>{card.title}</Item>);
                                    })
                                }
                                </List>
                            </Description>
                        </Container>
                    }
            </LoadServerContent>
        );
    }
}

