'use strict';

import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import {Form, Header, Card, Grid, Column, Icon} from 'react-semantify';
import Immutable from 'immutable';
import forms from 'newforms';

import {FormField, Button, Content, Description, LoadServerContent, Cards} from '../../../components';
//import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../decorators';
import {ImmutableState} from '../../../decorators';
import {FunctionHelper, FormDefinition} from '../../../commons';
import {CardStatus} from '../../../enums';
import {KanbanActions, UIActions} from '../../../actions';
import {default as KCard} from '../../board/show/KCard.jsx';

import {default as AddSimpleCardStore} from './AddSimpleCardStore';
import {default as ComboField} from './ComboField.jsx';

const messages = defineMessages(
{
    sampleCardTitle: {id: 'navbar.addCard.sampleCard.title', description: 'Sample card title', defaultMessage: '<Título>'},
    addCardPopupTitle: {id: 'navbar.addCard.popup.title', description: 'Add card popup title', defaultMessage: 'Adicione um cartão'},
    saveButton: {id: 'addSimpleCardForm.button.save', description: 'save button', defaultMessage: 'Salvar'},
    showFullForm: {id: 'addSimpleCardForm.button.showFullForm', description: 'Show full card form', defaultMessage: 'Alterar outras informações do cartão'},
    showCardTemplateForm: {id: 'addSimpleCardForm.button.showCardTemplateForm', description: 'Show create template card form', defaultMessage: 'Criar template'},
    editSelectedTemplate: {id: 'addSimpleCardForm.button.editSelectedTemplate', description: 'Edit selected template', defaultMessage: 'Editar template'},
    removeSelectedTemplate: {id: 'addSimpleCardForm.button.removeSelectedTemplate', description: 'Remove selected template', defaultMessage: 'Excluir template'}
});

var StateRecord = Immutable.Record({isLoading: false, addSimpleCardForm: null, selectedTemplate: null});

const TITLE_TEXT_AREA_ID = '#addSimpleCardTitleTextArea';

//@ImmutableShouldUpdateComponent (ver para atualizar também quando alterar propriedades)
@ImmutableState
@airflux.FluxComponent
class AddSimpleCardForm extends React.Component
{

    static displayName = 'AddSimpleCardForm';

    static propTypes =
    {
        intl: intlShape.isRequired,
        board: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        const formDefinition = new FormDefinition(this.props.intl);
        const AddSimpleCardFormEntity = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.addSimpleCardTitle),
            status: forms.ChoiceField(formDefinition.formFields.cardStatus)
        });
        this.state = {data: new StateRecord({addSimpleCardForm: new AddSimpleCardFormEntity({controlled: true, onChange: this.forceUpdate.bind(this)})})};
        this.listenTo(AddSimpleCardStore, this._listenToAddSimpleCardFormStoreChange);
    }

    componentDidMount()
    {
        /*const that = this;
        console.log('mount', window.$(TITLE_TEXT_AREA_ID));//eslint-disable-line
        window.$('textarea'+TITLE_TEXT_AREA_ID).bind('keypress', function(e) //eslint-disable-line
        {
            console.log('asdadas');
            if ((e.keyCode || e.which) === 13)
            {
                e.preventDefault();
                that._handleAddSimpleCardFormSubmit(e);
                return true;
            }
        });*/
    }

    componentDidUpdate()
    {
        /*const that = this; //eslint-disable-line
        if (window.$(TITLE_TEXT_AREA_ID)[0]) //eslint-disable-line
        {
            console.log('update', window.$(TITLE_TEXT_AREA_ID).context);//eslint-disable-line
            if (!window.$(TITLE_TEXT_AREA_ID).context.onkeypressed) //eslint-disable-line
            {
                window.$(TITLE_TEXT_AREA_ID).bind('keypress', function(e) //eslint-disable-line
                {
                    console.log('asdada22s');
                    if ((e.keyCode || e.which) === 13)
                    {
                        e.preventDefault();
                        that._handleAddSimpleCardFormSubmit(e);
                        return true;
                    }
                });
            }
        }*/

        /*
        window.$(TITLE_TEXT_AREA_ID).bind('keypress', function(e) //eslint-disable-line
        {
            console.log('asdada22s');
            if ((e.keyCode || e.which) === 13)
            {
                e.preventDefault();
                that._handleAddSimpleCardFormSubmit(e);
                return true;
            }
        });*/
    }

    _listenToAddSimpleCardFormStoreChange(store)
    {
        //TODO: verificar como fazer para nao usar jquery
        window.$(TITLE_TEXT_AREA_ID).focus(); //eslint-disable-line

        switch (store.actionState)
        {

            case KanbanActions.card.addInFirstLeafLane.progressed:
            case KanbanActions.card.addInBacklog.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case KanbanActions.card.addInFirstLeafLane.completed:
            case KanbanActions.card.addInBacklog.completed:
                let {addSimpleCardForm} = this.state.data;
                addSimpleCardForm.reset({status: addSimpleCardForm.cleanedData.status});
                this.setImmutableState({isLoading: false});
                break;

            case KanbanActions.card.addInFirstLeafLane.failed:
            case KanbanActions.card.addInBacklog.failed:
                this.setImmutableState({isLoading: false});
                break;

            case KanbanActions.boardSetting.templateCard.add.completed:
            case KanbanActions.boardSetting.templateCard.update.completed:
                this.setImmutableState({selectedTemplate: store.state.templateCard, isLoading: false});
                KanbanActions.boardSetting.templateCard.search.asFunction(this.props.board._id, '[searchAll]');
                break;

            case KanbanActions.boardSetting.templateCard.delete.completed:
                this.setImmutableState({selectedTemplate: null, isLoading: false});
                KanbanActions.boardSetting.templateCard.search.asFunction(this.props.board._id, '[searchAll]');
                break;
            default: break;
        }
    }

    _handleAddSimpleCardFormSubmit = (e) =>  //eslint-disable-line no-unused-vars
    {
        e.preventDefault();
        const {addSimpleCardForm, selectedTemplate} = this.state.data;
        if (!addSimpleCardForm.validate())
        {
            return;
        }

        let card = {};
        let fieldsToOmitInAssign = ['_id', 'nonce'];
        _.assign(card, _.omit(selectedTemplate, fieldsToOmitInAssign)); //necessário fazer este assign por conta da possibildiade de submeter o formulário ao pressionar a telca enter
        _.assign(card, _.omit(addSimpleCardForm.cleanedData, fieldsToOmitInAssign)); //necessário fazer este assign por conta da possibildiade de submeter o formulário ao pressionar a telca enter

        //TODO: Codigo repetido em formulario completo
        let cardStatusAndPosition = addSimpleCardForm.cleanedData.status;
        let splittedCardStatus = cardStatusAndPosition.split('/');
        let cardStatus = splittedCardStatus[0];
        //TODO: separar a posicao do cartão em combobox distintos
        let position = splittedCardStatus[1];
        switch (cardStatus)
        {
            case CardStatus.inboard.name: KanbanActions.card.addInFirstLeafLane.asFunction(this.props.board._id, card, position); break;
            case CardStatus.backlog.name: KanbanActions.card.addInBacklog.asFunction(this.props.board._id, card); break;
            default: KanbanActions.card.addInBacklog.asFunction(this.props.board._id, card); break;
        }
    };

    _createCardObjectAndPrepareToOpenModalForm = (isToDeleteIds) =>
    {
        const {addSimpleCardForm, selectedTemplate} = this.state.data;
        let card = {board: this.props.board._id, ratings: [], attachments: []};
        _.assign(card, selectedTemplate);
        _.assign(card, addSimpleCardForm.cleanedData);
        if (isToDeleteIds)
        {
            delete card._id;
            delete card.nonce;
        }
        //TODO: colocada essa linha para, ao adicionar um novo template, permitir o recarregamento da lista. Verificar solução melhor.
        this.templateComboField.clearState();
        //TODO: no topnavbar tem o metodo de show, tentar centralizar o metodo de show e hide para ficar em um lugar so as operacoes
        window.$('.item.addSimpleCardMenuItem').popup('hide'); //eslint-disable-line
        return card;
    }

    _handleSelectTemplate = (selectedItem) =>
    {
        this.setImmutableState({selectedTemplate: selectedItem});
    }

    _handleCardFormModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let card = this._createCardObjectAndPrepareToOpenModalForm(true);
        UIActions.showCardFormModal.asFunction(this.props.board._id, card);
    };

    _handleCreateTemplateCardFormModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let card = this._createCardObjectAndPrepareToOpenModalForm(true);
        UIActions.showCardTemplateFormModal.asFunction(this.props.board._id, card);
    }

    _handleEditSelectedTemplate = (e) =>
    {
        if (e) {e.preventDefault();}
        let card = this._createCardObjectAndPrepareToOpenModalForm(false);
        UIActions.showCardTemplateFormModal.asFunction(this.props.board._id, card);
    }

    _handleRemoveSelectedTemplate = (e) =>
    {
        e.preventDefault();
        let {selectedTemplate} = this.state.data;
        if (confirm(`Excluir template: [${selectedTemplate.title}]`)) //eslint-disable-line
        {
            KanbanActions.boardSetting.templateCard.delete.asFunction(selectedTemplate);
        }
    }

    _renderSelecetedTemplateCard = () =>
    {
        const {isLoading, selectedTemplate} = this.state.data;
        if (FunctionHelper.isUndefined(selectedTemplate))
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const isBlankTemplate = FunctionHelper.isUndefined(selectedTemplate._id);

        let cardSample = {title: '', ratings: [], attachments: []};
        _.assign(cardSample, selectedTemplate);
        cardSample.title = formatMessage(messages.sampleCardTitle);

        return (<Cards>
            <Card style={{width: '170px', boxShadow: 'none', padding: '0px', margin: '0px'}}>
                <Content>
                    <Description>
                        <KCard card={cardSample} visualStyle={{type: 'template'}} isReadOnly isContextMenuEnabled={false} hostStyle={{display: 'table'}}/>
                    </Description>
                    {
                        !isBlankTemplate &&
                        [
                            <Button key="btnRemoveTemplate" title={formatMessage(messages.removeSelectedTemplate)} className="right floated basic red icon" style={{border: '0px solid black', marginLeft: '5px'}} disable={isLoading} onClick={this._handleRemoveSelectedTemplate}><Icon className="trash" /></Button>,
                            <Button key="btnEditTemplate" title={formatMessage(messages.editSelectedTemplate)} className="right floated basic blue icon" style={{border: '0px solid black', marginLeft: '5px'}} disable={isLoading} onClick={this._handleEditSelectedTemplate}><Icon className="edit" /></Button>
                        ]
                    }
                </Content>
            </Card>
        </Cards>);
    }

    render()
    {
        const {board} = this.props;
        if (FunctionHelper.isUndefined(board))
        {
            return null;
        }
        const {isLoading, addSimpleCardForm, selectedTemplate} = this.state.data;
        const fields = addSimpleCardForm.boundFieldsObj();
        return (
            <Form name="addSimpleCardForm">
                <LoadServerContent isLoading={isLoading} />
                <Card style={{width: '100%', borderWidth: '0px', boxShadow: 'none'}}>
                    <Content>
                        <Header><FormattedMessage {...messages.addCardPopupTitle} /></Header>
                        <Description>
                            <Grid>
                                <Column className="nine wide">
                                    <ComboField ref={(c) => {this.templateComboField = c;}} label={'Template'} getSuggestionFunc={KanbanActions.boardSetting.templateCard.search} selectedItem={selectedTemplate} onSelectItem={this._handleSelectTemplate} boardId={board._id} placeHolder={'Selecionar'}/>
                                    <FormField editableMode inputClassName="tiny" showLabel={false} showErrorMessage={false} style={{padding: '2px'}} boundField={fields.status} requiredIcon=""/>
                                    <FormField onEnterKeyPressed={this._handleAddSimpleCardFormSubmit} editableMode inputClassName="title" style={{marginTop: '5px'}} showLabel={false} showErrorMessage={false} boundField={fields.title} requiredIcon=""/>
                                </Column>
                                <Column className="seven wide templateCard" style={{marginTop: '20px'}}>
                                    {this._renderSelecetedTemplateCard()}
                                </Column>
                            </Grid>
                        </Description>
                    </Content>
                    <Content className="extra">
                        <div className="ui buttons">
                            <Button disable={isLoading} onClick={this._handleAddSimpleCardFormSubmit}><FormattedMessage {...messages.saveButton} /></Button>
                            <div className="or" data-text="ou"></div>
                            <Button disable={isLoading} onClick={this._handleCardFormModalShow} className="positive"><FormattedMessage {...messages.showFullForm} /></Button>
                            <div className="or" data-text="ou"></div>
                            <Button disable={isLoading} onClick={this._handleCreateTemplateCardFormModalShow} className="brown"><FormattedMessage {...messages.showCardTemplateForm} /></Button>
                        </div>
                    </Content>
                </Card>
            </Form>
        );
    }
}

module.exports = injectIntl(AddSimpleCardForm);
