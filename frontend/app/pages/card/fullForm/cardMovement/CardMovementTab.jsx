import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Segment} from 'react-semantify';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {TreeUtils, FunctionHelper} from '../../../../commons';
import {FaIcon, Content, FormToast} from '../../../../components';
import {default as CardMovementStore} from './CardMovementStore';
import {default as CardMovementShow} from './CardMovementShow.jsx';
import {default as CardMovementEdit} from './CardMovementEdit.jsx';


//TODO: Implementar adição e remoção

const messages = defineMessages(
{
    listTitle: {id: 'modal.cardForm.cardMovementTab.listTitle', description: '', defaultMessage: 'Movimentações do cartão'},
    showMode: {id: 'modal.cardForm.cardMovementTab.showMode', description: '', defaultMessage: 'Visualização'},
    editMode: {id: 'modal.cardForm.cardMovementTab.editMode', description: '', defaultMessage: 'Edição'},
    emptyMovements: {id: 'modal.cardForm.cardMovementTab.emptyMovements', description: '', defaultMessage: 'Esse cartão ainda não foi movimentado, ou todas as movimentações foram excluídas'}
});

var StateRecord = Immutable.Record({isLoading: false, actionMessage: null, cardMovementHistory: null, cardMovementTreeRoot: null, editMode: false});

@ImmutableState
@airflux.FluxComponent
class CardMovementTab extends Component
{
    static displayName = 'CardMovementTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(CardMovementStore, this._listenToCardMovementStore);
       this.state = {data: new StateRecord()};
    }

    _listenToCardMovementStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.cardMovementHistory.list.progressed:
            case KanbanActions.cardSetting.cardMovementHistory.updateMovement.progressed:
            case KanbanActions.cardSetting.cardMovementHistory.deleteMovement.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.cardMovementHistory.list.failed:
            case KanbanActions.cardSetting.cardMovementHistory.updateMovement.failed:
            case KanbanActions.cardSetting.cardMovementHistory.deleteMovement.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;


            case KanbanActions.cardSetting.cardMovementHistory.list.completed:
            {
                let cardMovementHistory = store.state.cardMovementHistory;
                let cardMovementTreeRoot = null;
                if (cardMovementHistory && FunctionHelper.isArrayNotEmpty(cardMovementHistory.movements))
                {
                    cardMovementTreeRoot = TreeUtils.createTreeObjectOfMovementCards(cardMovementHistory.movements);
                    cardMovementTreeRoot.title = 'Total'; //TODO: intercionalizar
                }
                this.setImmutableState({isLoading: false, cardMovementHistory: cardMovementHistory, cardMovementTreeRoot: cardMovementTreeRoot});
                break;
            }

            case KanbanActions.cardSetting.cardMovementHistory.deleteMovement.completed:
            case KanbanActions.cardSetting.cardMovementHistory.updateMovement.completed:
            {
                let {cardMovementHistory} = store.state;
                this.setImmutableState({cardMovementHistory: cardMovementHistory, isLoading: false});
                break;
            }
            default: break;
        }
    }

    _handleChangeMode = (e) =>
    {
        this.setImmutableState({editMode: e.target.value === 'editMode'});
    }

    _handleSave = (cardMovementToSave) => //eslint-disable-line
    {
        let {card} = this.props;
        let {cardMovementHistory} = this.state.data;
        KanbanActions.cardSetting.cardMovementHistory.updateMovement.asFunction(card, cardMovementHistory, cardMovementToSave);
	}

    _handleDelete = (cardMovementToDelete) =>
    {
        let {card} = this.props;
        let {cardMovementHistory} = this.state.data;
        KanbanActions.cardSetting.cardMovementHistory.deleteMovement.asFunction(card, cardMovementHistory, cardMovementToDelete);
    }

    render()
    {
        let {card} = this.props;
        let {cardMovementHistory, isLoading, actionMessage, cardMovementTreeRoot, editMode} = this.state.data;
        const {formatMessage} = this.props.intl;

        if (!isLoading && FunctionHelper.isUndefined(cardMovementHistory) || (cardMovementHistory && FunctionHelper.isArrayNullOrEmpty(cardMovementHistory.movements)) || FunctionHelper.isUndefined(cardMovementTreeRoot))
        {
           return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="blue">
                    <Header style={{display: 'inline-flex'}}>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/>
                        <Content style={{display: 'inline-flex', whiteSpace: 'nowrap'}}>
                            <FormattedMessage {...messages.listTitle}/>
                        </Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar" style={{maxHeight: '500px'}}>
                        <FormattedMessage {...messages.emptyMovements}/>
                    </Content>
                </Segment>
            </div>
           );
        }
        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="blue">
                    <Header style={{display: 'inline-flex'}}>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/>
                        <Content style={{display: 'inline-flex', whiteSpace: 'nowrap'}}>
                            <FormattedMessage {...messages.listTitle}/>
                            <select id="mode" onChange={this._handleChangeMode} value={this.state.value} style={{fontSize: '12px', marginLeft: '15px', padding: '0px'}}>
                                <option value="showMode">{formatMessage(messages.showMode)}</option>
                                <option value="editMode">{formatMessage(messages.editMode)}</option>
                            </select>
                        </Content>
                    </Header>
                    {!editMode && <CardMovementShow cardMovementHistory={cardMovementHistory} cardMovementTreeRoot={cardMovementTreeRoot} card={card}/>}
                    {editMode && <CardMovementEdit onSave={this._handleSave} onDelete={this._handleDelete} cardMovementHistory={cardMovementHistory} card={card}/>}
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(CardMovementTab, {withRef: true});

