import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import _ from 'lodash';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {Header, Segment, Button} from 'react-semantify';
import Loader from 'react-loader';
import forms from 'newforms';

import {KanbanActions} from '../../../../actions';
import {FormDefinition, RouterNavigator, FunctionHelper} from '../../../../commons';
import {BoardVisibility} from '../../../../enums';
import {Container, Content, Meta, FaIcon, Form, FormToast} from '../../../../components';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../../decorators';
import {default as GeneralSettingStore} from './GeneralSettingStore';

const messages = defineMessages(
{
    title: {id: 'generalSetting.title', description: 'General Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'generalSetting.subtitle', description: 'General Setting subtitle', defaultMessage: 'Informações gerais do quadro'},
    basicInformationTitle: {id: 'generalSetting.basicInformationTitle.title', description: 'Board basic information title', defaultMessage: 'Informações básicas'},
    removeTitle: {id: 'generalSetting.remove', description: 'General Setting remove', defaultMessage: 'Excluir quadro'},
    delete: {id: 'generalSetting.remove.button', description: 'General Setting remove button', defaultMessage: 'Excluir'},
    updateSuccess: {id: 'generalSetting.update.success', description: 'generalSetting update success', defaultMessage: 'Informações atualizadas com sucesso.'}
});


var StateRecord = Immutable.Record({isLoading: false, board: null, generalSettingForm: null, actionMessage: null, messageKind: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class GeneralSettingPage extends React.Component
{
    static displayName = 'GeneralSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.pageName = 'GeneralSettingPage';

        this.listenTo(GeneralSettingStore, this._listenToGeneralSettingStoreChange);

        const formDefinition = new FormDefinition(this.props.intl);

        const GeneralSettingFormEntity = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.title),
            subtitle: forms.CharField(formDefinition.formFields.subtitle),
            description: forms.CharField(formDefinition.formFields.description),
            visibility: forms.ChoiceField(formDefinition.formFields.boardVisibility),
            avatarImageFile: forms.ImageField(formDefinition.formFields.avatar)
        });

        this.state = {data: new StateRecord({generalSettingForm: new GeneralSettingFormEntity({controlled: true, onChange: this._handleFormChange})})};
    }

    componentWillMount()
    {
        KanbanActions.board.get.asFunction(this.props.params.boardId);
    }

    _listenToGeneralSettingStoreChange(store) //eslint-disable-line no-unused-vars
    {
        switch (store.actionState)
        {
            case KanbanActions.board.get.progressed:
            case KanbanActions.board.update.progressed:
            case KanbanActions.board.delete.progressed:
                this.setImmutableState({isLoading: true, actionMessage: null});
                break;

            case KanbanActions.board.get.failed:
            case KanbanActions.board.delete.failed:
            case KanbanActions.board.update.failed:
                this.setImmutableState({isLoading: false, messageKind: 'negative', actionMessage: store.actionMessage});
                break;

            case KanbanActions.board.get.completed:
                {
                    let board = store.state.board;
                    if (FunctionHelper.isUndefined(board.visibility))
                    {
                        board.visibility = BoardVisibility.internal.name;
                    }

                    this.state.data.generalSettingForm.reset(store.state.board);
                    this.setImmutableState({isLoading: false, actionMessage: null, board: store.state.board});
                    break;
                }
            case KanbanActions.board.update.completed:
                this.state.data.generalSettingForm.reset(store.state.board);
                const {formatMessage} = this.props.intl;
                this.setImmutableState({isLoading: false, messageKind: 'positive', actionMessage: formatMessage(messages.updateSuccess), board: store.state.board});
                break;

            case KanbanActions.board.delete.completed:
                RouterNavigator.goToListBoard();
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
        let dataToSubmit = cleanedData;
        let entityDataToSubmit = {};
        _.assign(entityDataToSubmit, this.state.data.board);
        _.assign(entityDataToSubmit, dataToSubmit);
        entityDataToSubmit.avatarImageFile = formData.avatarImageFile;
        KanbanActions.board.update.asFunction(entityDataToSubmit);
    };

    _handleDeleteBoard = () =>
    {
        if (confirm(`Confirmar exclusão do quadro [${this.state.data.board.title}] ?`)) //eslint-disable-line
        {
            KanbanActions.board.delete.asFunction(this.state.data.board);
        }
    }

    render()
    {
        let iconHeaderStyle = {marginRight: 10 + 'px'};
        let {isLoading, generalSettingForm, actionMessage, messageKind} = this.state.data;

        return (
            <Container className={`setting segments ${this.pageName}`}>
                <Loader loaded={!isLoading} />
                <Segment className="clearing">
                    <Header className="left floated" style={{width: '100%'}}>
                        <FormattedMessage {...messages.title} />
                        <Meta style={{fontSize: '14px', lineHeight: '1.4285em', fontWeight: 'normal', marginTop: '10px'}}><FormattedMessage {...messages.subtitle} /></Meta>
                        <FormToast message={actionMessage} kind={messageKind} />
                    </Header>
                </Segment>
                <Segment className="red">
                    <Header>
                        <FaIcon className="fa-list-alt" style={iconHeaderStyle}/><Content><FormattedMessage {...messages.basicInformationTitle} /></Content>
                    </Header>
                    <Content className="add form">
                        <Form formKey="boardAddForm" isLoading={isLoading} form={generalSettingForm} onSubmit={this._handleFormSubmit} actionLabel={'Salvar'}/>
                    </Content>
                </Segment>
                <Segment className="red">
                    <Header>
                        <FaIcon className="fa-trash" style={iconHeaderStyle}/><Content><FormattedMessage {...messages.removeTitle} /></Content>
                    </Header>
                    <Content className="add form">
                        <Button style={{marginTop: '5px'}} onClick={this._handleDeleteBoard} className="tiny negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button>
                    </Content>
                </Segment>


            </Container>
        );
    }
}

module.exports = injectIntl(GeneralSettingPage);
