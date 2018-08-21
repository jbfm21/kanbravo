'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import forms from 'newforms';

import {KanbanActions} from '../../../actions';
import {Form, Container, Content} from '../../../components';
import {BoardAddStore} from '../../../stores';
import {RouterNavigator, FormDefinition} from '../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';

const messages = defineMessages(
{
    formTitle: {id: 'board.add.form.title', description: 'add board form title', defaultMessage: 'Crie um novo quadro'},
    formSubmitButton: {id: 'board.add.form.submitButton', description: 'Submit button for add board form', defaultMessage: 'Criar'}
});

var StateRecord = Immutable.Record({isLoading: false, actionMessage: null, boardAddForm: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class BoardAddPage extends React.Component
{
    static displayName = 'BoardAddPage';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(BoardAddStore, this._listenToBoardAddStoreChange);

        const formDefinition = new FormDefinition(this.props.intl);
        const BoardAddFormEntity = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            subtitle: forms.CharField(formDefinition.formFields.subtitle),
            boardTemplate: forms.ChoiceField(formDefinition.formFields.boardTemplate),
            description: forms.CharField(formDefinition.formFields.description),
            avatarImageFile: forms.ImageField(formDefinition.formFields.avatar)
        });

        this.state = {data: new StateRecord({boardAddForm: new BoardAddFormEntity({onChange: this._handleFormChange})})};
    }

    _listenToBoardAddStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.board.add.progressed:
                this.setImmutableState({isLoading: true, actionMessage: null});
                break;
            case KanbanActions.board.add.completed:
                this.setImmutableState({isLoading: false});
                RouterNavigator.goToBoardShow(store.state.board);
                break;
            case KanbanActions.board.add.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;
            default: break;
        }
    }

    _handleFormChange = () =>
    {
        this.setImmutableState({actionMessage: null});
        this.forceUpdate();
    };

    _handleFormSubmit = (cleanedData, formData) =>
    {
        cleanedData.avatarImageFile = formData.avatarImageFile;
        KanbanActions.board.add.asFunction(cleanedData);
    };

    render()
    {
        const {formatMessage} = this.props.intl;
        const {isLoading, boardAddForm, actionMessage} = this.state.data;
        const actionLabel = formatMessage(messages.formSubmitButton);
        return (
            <Container className="k-principal-container k-form">
                <Header className="k-title"><Icon className="add"/><Content><FormattedMessage {...messages.formTitle} /></Content></Header>
                <Form formKey="boardAddForm" isLoading={isLoading} form={boardAddForm} onSubmit={this._handleFormSubmit} actionLabel={actionLabel} errorMessageToShow={actionMessage} />
            </Container>
        );
    }
}

module.exports = injectIntl(BoardAddPage);
