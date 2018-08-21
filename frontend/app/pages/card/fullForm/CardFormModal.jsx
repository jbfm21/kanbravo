//TODO: melhorar: botão de cancelamento durante a edição do cartão, permitir cadastrar tarefas durante a criação de um cartão
//TODO: liberar prioridade numerica

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import Loader from 'react-loader';
import moment from 'moment';
import _ from 'lodash';
import {defineMessages, injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {Header, Icon, Grid, Column, Row, Menu, Item, Tab, Field, Fields, Form, Divider, Label} from 'react-semantify';
import forms from 'newforms';

import {Modal, Button, Actions, Content, FormField, FormToast, StaticComboField, FaIcon} from '../../../components';
import {FormDefinition, FunctionHelper, CalendarLayoutHelper} from '../../../commons';
import {UIActions, KanbanActions} from '../../../actions';
import {CardType, CardStatus, AddCardPosition} from '../../../enums';
import {BoardContextStore} from '../../../stores';


import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../decorators';
import {default as CardFormModalStore} from './CardFormModalStore';

import {default as TaskTab} from './task/TaskTab.jsx';
import {default as CustomFieldTab} from './customField/CustomFieldTab.jsx';
import {default as TaskStatisticLabel} from './task/TaskStatisticLabel.jsx';
import {default as RatingTab} from './rating/RatingTab.jsx';
import {default as AttachmentTab} from './attachment/AttachmentTab.jsx';
import {default as TimeSheetTab} from './timesheet/TimeSheetTab.jsx';
import {default as DateMetricTab} from './dateMetric/DateMetricTab.jsx';
import {default as DashboardTab} from './dashboard/DashboardTab.jsx';
import {default as ImpedimentTab} from './impediment/ImpedimentTab.jsx';
import {default as ReminderTab} from './reminder/ReminderTab.jsx';
import {default as CardMovementTab} from './cardMovement/CardMovementTab.jsx';
import {default as TimelineTab} from './timeline/TimelineTab.jsx';
import {default as ConnectionTab} from './connection/ConnectionTab.jsx';

import {default as UnderConstructionTab} from './UnderConstructionTab.jsx';

import {default as ComboField} from './components/ComboField.jsx';
import {default as ComboMultiSelectField} from './components/ComboMultiSelectField.jsx';
import {default as AssignedUserFormField} from './AssignedUserFormField.jsx';

import {default as StatefullRichTextEditor} from './components/StatefullRichTextEditor.jsx';

const messages = defineMessages(
{

    loading: {id: 'modal.cardForm.loading', description: 'Loading', defaultMessage: 'Aguarde. Carregando informações'},
    cancel: {id: 'modal.cardForm.cancel', description: 'Cancel cardForm model', defaultMessage: 'Cancelar <span style="font-size: 12px">(esc)</span>'},
    insertNewCard: {id: 'modal.cardForm.insertNewCard', description: 'Cancel cardForm model', defaultMessage: 'Incluindo novo cartão'},

    saveAndClose: {id: 'modal.cardForm.confirm', description: 'Confirm cardForm editor', defaultMessage: 'Salvar e <span style="text-decoration: underline;font-size: 20px">F</span>echar'},
    saveAndInsertNew: {id: 'modal.cardForm.saveAndInsertNew', description: 'saveAndInsertNew cardForm editor', defaultMessage: '<span style="text-decoration: underline;font-size: 20px">S</span>alvar e Incluir Novo'},

    templateModalTitle: {id: 'modal.cardForm.templateModalTitle', description: 'Modal Title', defaultMessage: 'Informações do template'},
    createTemplate: {id: 'modal.cardForm.createTemplate', description: 'Create template card', defaultMessage: 'Criar como template e limpar formulário'},
    saveTemplateAndClose: {id: 'modal.cardForm.saveTemplateAndClose', description: 'Save template card and close', defaultMessage: 'Salvar template e fechar'},
    saveTemplateAndInsertNew: {id: 'modal.cardForm.saveTemplateAndInsertNew', description: 'saveTemplateAndInsertNew cardForm editor', defaultMessage: 'Salvar template e incluir novo'},

    invalidFormErrorMessage: {id: 'modal.cardForm.formInvalidError', description: 'formInvalidError cardForm editor', defaultMessage: 'Preencha o formulário corretamenta'},

    menuAttachments: {id: 'modal.cardForm.menu.attachments', description: '', defaultMessage: 'Anexos'},
    menuCustomField: {id: 'modal.cardForm.menu.customField', description: '', defaultMessage: 'Campos Cust.'},
    menuDate: {id: 'modal.cardForm.menu.dates', description: '', defaultMessage: 'Datas'},
    menuDashboard: {id: 'modal.cardForm.menu.dashboard', description: '', defaultMessage: 'Dashboard'},
    menuDetails: {id: 'modal.cardForm.menu.details', description: '', defaultMessage: 'Detalhes'},
    menuEffort: {id: 'modal.cardForm.menu.effort', description: '', defaultMessage: 'Esforço'},
    menuImpediment: {id: 'modal.cardForm.menu.impediment', description: '', defaultMessage: 'Impedimentos'},
    menuRating: {id: 'modal.cardForm.menu.rating', description: '', defaultMessage: 'Classificação'},
    menuReminder: {id: 'modal.cardForm.menu.reminder', description: '', defaultMessage: 'Lembretes'},
    menuTask: {id: 'modal.cardForm.menu.task', description: '', defaultMessage: 'Tarefas'},
    menuTimeline: {id: 'modal.cardForm.menu.timeline', description: '', defaultMessage: 'Timeline'},
    menuConnection: {id: 'modal.cardForm.menu.connection', description: '', defaultMessage: 'Conexão'},

    cardDescriptionLabel: {id: 'modal.cardForm.card.description', description: '', defaultMessage: 'Descrição: '},
    cardAssignMemberLabel: {id: 'modal.cardForm.card.assignMember.label', description: '', defaultMessage: 'Executores: '},
    cardAssignMemberPlaceHolder: {id: 'modal.cardForm.card.assignMember.placeholder', description: '', defaultMessage: 'Cadastre os executores'},

    cardTagLabel: {id: 'modal.cardForm.card.tag.label', description: '', defaultMessage: 'Tags: '},
    cardTagPlaceHolder: {id: 'modal.cardForm.card.tag.placeholder', description: '', defaultMessage: 'Cadastre as tags'},

    selectPlaceHolder: {id: 'modal.cardForm.select.placeholder', description: '', defaultMessage: 'Selecionar'},
    cardClassOfServiceLabel: {id: 'modal.cardForm.card.classOfService.label', description: '', defaultMessage: 'Classe de serviço:'},
    cardItemTypeLabel: {id: 'modal.cardForm.card.itemType.label', description: '', defaultMessage: 'Tipo de Item:'},
    cardItemSizeLabel: {id: 'modal.cardForm.card.itemSize.label', description: '', defaultMessage: 'Tamanho:'},
    cardPriorityLabel: {id: 'modal.cardForm.card.priority.label', description: '', defaultMessage: 'Prioridade:'},
    cardProjectLabel: {id: 'modal.cardForm.card.project.label', description: '', defaultMessage: 'Projeto:'},
    cardMetricTypeLabel: {id: 'modal.cardForm.card.metricType.label', description: '', defaultMessage: 'Unidade:'},
    connectedToBoard: {id: 'modal.cardForm.card.connectedTo.label', description: '', defaultMessage: 'Quadro em que está o cartão a ser contactado:'},
    connectedToCard: {id: 'modal.cardForm.card.connectedTo.label', description: '', defaultMessage: 'Conectado ao cartão: '}
});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class CardFormModal extends React.Component
{

    static displayName = 'CardFormModal';
    static StateRecord = Immutable.Record({lockState: [], parentSelectedBoardId: null, cardType: null, isParentCard: false, isLoading: false, isToShowModal: false, boardId: null, card: null, cardForm: null, actionMessage: null, closeAfterSubmit: true});

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(CardFormModalStore, this._listenToCardFormModalStoreChange);
        this.state = {data: new CardFormModal.StateRecord({})};
        const formDefinition = new FormDefinition(this.props.intl);

        const statusField = forms.ChoiceField.extend({validate: (value) =>
        {
            switch (value)
            {
                case CardStatus.backlog.name:
                case CardStatus.inboard.name:
                case CardStatus.deleted.name:
                case CardStatus.archived.name:
                case CardStatus.canceled.name:
                case `${CardStatus.inboard.name}/${AddCardPosition.firstLaneInit.name}`:
                case `${CardStatus.inboard.name}/${AddCardPosition.firstLaneEnd.name}`:
                    return '';
                default:
                    throw forms.ValidationError(`Invalid value for ${messages.fieldCardStatusLabel}:` + value);
            }
        }});

        this.cardFormEntity = forms.Form.extend({
            title: forms.CharField(formDefinition.formFields.cardTitle),
            status: new statusField(formDefinition.formFields.cardStatus),
            metricValue: forms.CharField(formDefinition.formFields.cardMetricValue),
            priorityNumberValue: forms.CharField(formDefinition.formFields.cardPriorityNumberValue),
            externalId: forms.CharField(formDefinition.formFields.cardExternalId),
            externalLink: forms.URLField(formDefinition.formFields.cardExternalLink),
            startPlanningDate: forms.DateField(formDefinition.formFields.cardStartPlanningDate),
            endPlanningDate: forms.DateField(formDefinition.formFields.cardEndPlanningDate),
            startExecutionDate: forms.DateField(formDefinition.formFields.cardStartExecutionDate),
            endExecutionDate: forms.DateField(formDefinition.formFields.cardEndExecutionDate)
        });

        this.dateFormatFields = ['startPlanningDate', 'endPlanningDate', 'startExecutionDate', 'endExecutionDate'];
    }

    componentDidUpdate()
    {
        let {card} = this.state.data;
        window.$('.tabular.menu .item').tab({ //eslint-disable-line
            onVisible: function(tab)
            {
                if (FunctionHelper.isUndefined(card._id))
                {
                    return;
                }
                switch (tab)
                {
                    case 'tab-connection':
                    {
                        KanbanActions.card.getChildrenConnection.asFunction(card);
                        KanbanActions.cardSetting.reminder.list.asFunction(card);
                        break;
                    }
                    case 'tab-customFields': KanbanActions.cardSetting.cardCustomField.list.asFunction(card); break;
                    case 'tab-dashboard': KanbanActions.cardSetting.timesheet.list.asFunction(card); break;
                    case 'tab-effort': KanbanActions.cardSetting.timesheet.list.asFunction(card); break;
                    case 'tab-impediment': KanbanActions.cardSetting.impediment.list.asFunction(card); break;
                    case 'tab-reminder': KanbanActions.cardSetting.reminder.list.asFunction(card); break;
                    case 'tab-tasks': KanbanActions.cardSetting.task.list.asFunction(card); break;
                    case 'tab-timeline':
                    {
                        KanbanActions.cardSetting.timesheet.list.asFunction(card);
                        KanbanActions.cardSetting.cardMovementHistory.list.asFunction(card);
                        break;
                    }
                    case 'tab-dates': KanbanActions.cardSetting.cardMovementHistory.list.asFunction(card); break;
                    default: break;
                }
            }
        }); //eslint-disable-line

    }

    componentWillUnMount()
    {
        this._handeOnClose();
    }

    _getInputRefMaps = () =>
    {
        let refMaps = [];
        refMaps['title'] = this.titleField.refs.titleInput; //eslint-disable-line
        refMaps['priorityNumberValue'] = this.priorityNumberField.refs.priorityNumberInput; //eslint-disable-line
        refMaps['externalId'] = this.externalIdField.refs.externalIdInput; //eslint-disable-line
        refMaps['externalLink'] = this.externalLinkField.refs.externalLinkInput; //eslint-disable-line

        refMaps['metricValue'] = this.metricField.refs.metricInput; //eslint-disable-line
        refMaps['startPlanningDate'] = this.startPlanningDateField.refs.startPlanningDateInput; //eslint-disable-line
        refMaps['endPlanningDate'] = this.endPlanningDateField.refs.endPlanningDateInput; //eslint-disable-line
        refMaps['startExecutionDate'] = this.startExecutionDateField.refs.startExecutionDateInput; //eslint-disable-line
        refMaps['endExecutionDate'] = this.endExecutionDateField.refs.endExecutionDateInput; //eslint-disable-line

        if (this.cardStatusField)
        {
            refMaps['status'] =  this.cardStatusField.refs.cardStatusInput; //eslint-disable-line
        }
        return refMaps;
    }

    _handleOnClose = () =>
    {
        this._clearState();
    }

    _listenToCardFormModalStoreChange(store)
    {
        switch (store.actionState)
        {
            case UIActions.showCardTemplateFormModal:
            {
                const card = store.state.card;
                const cardForm = this._createForm(card);
                this.setImmutableState({cardType: CardType.template.name, isParentCard: false, isToShowModal: true, boardId: store.state.boardId, card: card, cardForm: cardForm});
                this.forceUpdate(); //obs: nao remover, pois se não o menu tabbar para de funcionar
                break;
            }

            case UIActions.showCardFormModal:
            {
                this.setImmutableState({cardType: CardType.card.name, isParentCard: false, isToShowModal: true, boardId: store.state.boardId, parentSelectedBoardId: ''});
                this.forceUpdate(); //obs: nao remover, pois se não o menu tabbar para de funcionar
                break;
            }

            case UIActions.showParentCardFormModal:
            {
                this.setImmutableState({cardType: CardType.card.name, isParentCard: true, isToShowModal: true, boardId: store.state.boardId});
                this.forceUpdate(); //obs: nao remover, pois se não o menu tabbar para de funcionar
                break;
            }

            case KanbanActions.card.get.progressed:
            case KanbanActions.card.update.progressed:
            case KanbanActions.card.addInFirstLeafLane.progressed:
            case KanbanActions.card.addInBacklog.progressed:
            case KanbanActions.boardSetting.templateCard.add.progressed:
            case KanbanActions.boardSetting.templateCard.update.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.card.get.completed:
            {
                const card = store.state.card;
                const cardForm = this._createForm(card);

                let parentSelectedBoardId = '';
                if (FunctionHelper.isDefined(card.parent && FunctionHelper.isDefined(card.parent.board)))
                {
                    parentSelectedBoardId = FunctionHelper.getId(card.parent.board);
                }
                else if (FunctionHelper.isDefined(card.board))
                {
                    parentSelectedBoardId = FunctionHelper.getId(card.board);
                }
                else
                {
                    parentSelectedBoardId = this.state.data.boardId;
                }

                this.setImmutableState({isLoading: false, cardType: CardType.card.name, card: card, cardForm: cardForm, parentSelectedBoardId: parentSelectedBoardId});
                this.forceUpdate(); //obs: nao remover, pois se não o menu tabbar para de funcionar
                break;
            }

            case KanbanActions.card.update.completed:
            case KanbanActions.card.addInFirstLeafLane.completed:
            case KanbanActions.card.addInBacklog.completed:
            case KanbanActions.boardSetting.templateCard.add.completed:
            case KanbanActions.boardSetting.templateCard.update.completed:
            {
                this.setImmutableState({isLoading: false, actionMessage: ''});
                if (this.titleField)
                {
                    this.titleField.refs.titleInput.focus();
                }
                this._closeOrCreateEmptyCard(this.state.data.closeAfterSubmit);
                break;
            }

            case KanbanActions.card.get.failed:
            case KanbanActions.card.update.failed:
            case KanbanActions.card.addInFirstLeafLane.failed:
            case KanbanActions.card.addInBacklog.failed:
            case KanbanActions.boardSetting.templateCard.add.failed:
            case KanbanActions.boardSetting.templateCard.update.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;

            default: break;
        }
    }

    _createForm = (card) =>
    {
        let cardFormData = {
            title: card.title || '',
            status: card.status || '',
            parent: card.parent || null,
            metricValue: card.metricValue || '',
            priorityNumberValue: card.priorityNumberValue || '',
            externalId: card.externalId || '',
            externalLink: card.externalLink || '',
            startPlanningDate: (card.startPlanningDate) ? CalendarLayoutHelper.getMomentDate(card.startPlanningDate).format('YYYY-MM-DD') : null,
            endPlanningDate: (card.endPlanningDate) ? CalendarLayoutHelper.getMomentDate(card.endPlanningDate).format('YYYY-MM-DD') : null,
            startExecutionDate: (card.startExecutionDate) ? CalendarLayoutHelper.getMomentDate(card.startExecutionDate).format('YYYY-MM-DD') : null,
            endExecutionDate: (card.endExecutionDate) ? CalendarLayoutHelper.getMomentDate(card.endExecutionDate).format('YYYY-MM-DD') : null
        };
        return new this.cardFormEntity({initial: cardFormData, onChange: this._handleFormChange});
    }

    _clearState = () =>
    {
        //this.setImmutableState({parentSelectedBoardId: null,  cardType: null, lockState: [], isLoading: false, isParentCard: false, isToShowModal: false, boardId: null, card: null, cardForm: null, actionMessage: null});
        this.setImmutableState({lockState: [], parentSelectedBoardId: null, cardType: null, isParentCard: false, isLoading: false, isToShowModal: false, boardId: null, card: null, cardForm: null, actionMessage: null, closeAfterSubmit: true});
    }

    _setEmptyCard = () =>
    {
        let {card, lockState} = this.state.data;
        let newCard = {
            board: this.state.data.boardId,
            status: lockState.status ? card.status : null,
            parent: lockState.parent ? card.parent : null,
            description: lockState.description ? card.description : null,
            classOfService: lockState.classOfService ? card.classOfService : null,
            itemType: lockState.itemType ? card.itemType : null,
            priority: lockState.priority ? card.priority : null,
            project: lockState.project ? card.project : null,
            metric: lockState.metric ? card.metric : null,
            childrenMetric: lockState.childrenMetric ? card.childrenMetric : null,
            itemSize: lockState.itemSize ? card.itemSize : null,
            cardIdConfig: lockState.cardIdConfig ? card.cardIdConfig : null,
            tags: lockState.tags ? card.tags : null,
            assignedMembers: lockState.assignedMembers ? card.assignedMembers : null,
            attachments: [],
            ratings: lockState.ratings ? card.ratings : null,

            title: lockState.title ? card.title : null,
            metricValue: lockState.metricValue ? card.metricValue : null,
            priorityNumberValue: lockState.priorityNumberValue ? card.priorityNumberValue : null,
            externalId: lockState.externalId ? card.externalId : null,
            externalLink: lockState.externalLink ? card.externalLink : null,
            startPlanningDate: lockState.startPlanningDate ? card.startPlanningDate : null,
            endPlanningDate: lockState.endPlanningDate ? card.endPlanningDate : null,
            startExecutionDate: lockState.startExecutionDate ? card.startExecutionDate : null,
            endExecutionDate: lockState.endExecutionDate ? card.endExecutionDate : null
        };

        let newCardForm = this._createForm(newCard);

        const refMaps = this._getInputRefMaps();
        for (let fieldName in refMaps)
        {
            if (refMaps.hasOwnProperty(fieldName))
            {
                let fieldRef = refMaps[fieldName];
                fieldRef.value = lockState[fieldName] ? card[fieldName] : '';
            }
        }

        this.descriptionTextEditor.clearText();
        this.setImmutableState({isLoading: false, card: newCard, cardForm: newCardForm});
        this.forceUpdate();
    }

    _closeOrCreateEmptyCard = (closeAfterSubmit) =>
    {
        if (closeAfterSubmit)
        {
            return this._handleOnClose();
        }
        return this._setEmptyCard();
    }

    _getFormData = () =>
    {
        const {formatMessage} = this.props.intl;
        let {card, cardForm} = this.state.data;
        if (!this._isCardForm())
        {
            //Preenche com o campo status só para nao dar erro de validacao de formulario, mas este campo não é usado para nada durante a criação de template
            //TODO: melhorar, separando componente para template e outro para cartao
            cardForm.updateData({status: CardStatus.inboard.name});
        }
        let isValid = cardForm.validate();
        if (!isValid)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.invalidFormErrorMessage), isLoading: false});
            return null;
        }

        let cardFormData = cardForm.cleanedData;

        card.status = cardFormData.status;
        card.title = cardFormData.title;
        card.metricValue = FunctionHelper.nullIfEmpty(cardFormData.metricValue);
        card.priorityNumberValue = FunctionHelper.nullIfEmpty(cardFormData.priorityNumberValue);
        card.externalId = FunctionHelper.nullIfEmpty(cardFormData.externalId);
        card.externalLink = FunctionHelper.nullIfEmpty(cardFormData.externalLink);
        card.startPlanningDate = cardFormData.startPlanningDate ? moment(cardFormData.startPlanningDate).utc().format('YYYY-MM-DD') : null;
        card.endPlanningDate = cardFormData.endPlanningDate ? moment(cardFormData.endPlanningDate).utc().format('YYYY-MM-DD') : null;
        card.startExecutionDate = cardFormData.startExecutionDate ? moment(cardFormData.startExecutionDate).utc().format('YYYY-MM-DD') : null;
        card.endExecutionDate = cardFormData.endExecutionDate ? moment(cardFormData.endExecutionDate).utc().format('YYYY-MM-DD') : null;
        card.description = FunctionHelper.nullIfEmpty(this.descriptionTextEditor.getHtmlValue());
        card.ratings = this.ratingTab.getWrappedInstance().getRatings();
        if (this._isCardForm())
        {
            card.attachments = this.attachmentTab.getWrappedInstance().getAttachments();
        }
        return card;
    }

    _submitCardFormData = (closeAfterSubmit) => //eslint-disable-line
    {
        let cardToSave = this._getFormData();
        if (cardToSave === null)
        {
            return null;
        }
        this.setImmutableState({closeAfterSubmit: closeAfterSubmit});
        const isToUpdateCardInfo = FunctionHelper.isDefined(cardToSave._id);
        if (isToUpdateCardInfo)
        {
            return KanbanActions.card.update.asFunction(cardToSave);
        }


        let cardStatusAndPosition = cardToSave.status;
        let splittedCardStatus = cardStatusAndPosition.split('/');
        let cardStatus = splittedCardStatus[0];
        //TODO: separar a posicao do cartão em combobox distintos
        let position = splittedCardStatus[1];
        let boardId = FunctionHelper.getId(this.state.data.boardId);
        console.log('b', this.state.data.boardId, boardId);
        switch (cardStatus)
        {
            case CardStatus.inboard.name: KanbanActions.card.addInFirstLeafLane.asFunction(boardId, cardToSave, position); break;
            case CardStatus.backlog.name: KanbanActions.card.addInBacklog.asFunction(boardId, cardToSave); break;
            default: KanbanActions.card.addInBacklog.asFunction(boardId, cardToSave); break;
        }

    }

    _submitTemplateFormData = (closeAfterSubmit, clearIdAtribute) =>
    {
        let cardToSave = this._getFormData();
        if (cardToSave === null)
        {
            return null;
        }
        if (clearIdAtribute)
        {
            //Caso esteja salvando um novo template a partir do cartao remove o id e nonce, pois se nao vai achar que eh para alterar o template e nao inserir um novo
            delete cardToSave._id;
            delete cardToSave.nonce;
        }
        this.setImmutableState({closeAfterSubmit: closeAfterSubmit});
        const isToUpdateTemplateCardInfo = FunctionHelper.isDefined(cardToSave._id);
        if (isToUpdateTemplateCardInfo)
        {
            return KanbanActions.boardSetting.templateCard.update.asFunction(cardToSave);
        }

        return KanbanActions.boardSetting.templateCard.add.asFunction(this.state.data.boardId, cardToSave);
    }

    _handleSaveCardAsTemplateAndClearFormToInsertNew = (e) =>
    {
        e.preventDefault();
        const closeAfterSubmit = false;
        this._submitTemplateFormData(closeAfterSubmit, true);
    }

    _handleSaveTemplateAndClearFormToInsertNew = (e) =>
    {
        e.preventDefault();
        const closeAfterSubmit = false;
        this._submitTemplateFormData(closeAfterSubmit, false);
    }

    _handleSaveTemplateAndClose = (e) =>
    {
        e.preventDefault();
        const closeAfterSubmit = true;
        this._submitTemplateFormData(closeAfterSubmit, false);
    }

    _handleSaveCardAndCloseModal = (e) =>
    {
        e.preventDefault();
        const closeAfterSubmit = true;
        this._submitCardFormData(closeAfterSubmit);
    };

    _handleSaveCardAndClearFormToInsertNew = (e) =>
    {
        e.preventDefault();
        const closeAfterSubmit = false;
        this._submitCardFormData(closeAfterSubmit);
    }

    _handleCancelModal = (e) =>
    {
        e.preventDefault();
        this._handleOnClose();
    };

    _handleFormChange = () =>
    {
    };

    _handleSelectedItem = (fieldName, selectedItem) =>
    {
        this.state.data.card[fieldName] = selectedItem;
        //TODO: importante para renderizar visto que não estou usando o setImutableDate
        this.forceUpdate();
    }

    _handleExternalChangeData = (newData) =>
    {
        //Utilizado para que as propriedades do cartão possam ser alteradas por outras cabas como ManageConnectionTab
        const refMaps = this._getInputRefMaps();
        let cardData = this._getFormData();
        let isFormChanged = false;
        for (let key in newData)
        {
            if (newData.hasOwnProperty(key))
            {
                const isUncontrolledInputForm = FunctionHelper.isDefined(refMaps[key]);
                if (isUncontrolledInputForm)
                {
                    const value = newData[key];
                    const fieldRef = refMaps[key];
                    const isDateInput = this.dateFormatFields.indexOf(key) > -1;
                    if (FunctionHelper.isUndefined(value))
                    {
                        cardData[key] = null;
                    }
                    else if (isDateInput)
                    {
                        cardData[key] = CalendarLayoutHelper.getMomentDate(value).format('YYYY-MM-DD');
                    }
                    else
                    {
                        cardData[key] = value; //se for nulo ou for um valor diferente de data
                    }
                    fieldRef.value = cardData[key];
                    isFormChanged = true;
                }
                else
                {
                    _.assign(cardData, newData);
                }
            }
       }
       if (isFormChanged)
       {
            this.state.data.cardForm.reset(cardData);
            this.state.data.cardForm.validate();
       }
       this.setImmutableState({isLoading: false, card: cardData});
       this.forceUpdate();
    }

    _handleChangeDateMetricData = (newData) =>
    {
       _.assign(this.state.data.card.dateMetrics, newData);
    }

    _isCardForm = () =>
    {
        let {cardType} = this.state.data;
        return cardType === CardType.card.name;
    }

    _isNewCard = () =>
    {
        return FunctionHelper.isUndefined(this.state.data.card) || FunctionHelper.isUndefined(this.state.data.card._id);
    }

    _isArchivedCard = () =>
    {
        //TODO: tem em lugares repetidos
        return FunctionHelper.isDefined(this.state.data.card) && this.state.data.card.status === CardStatus.archived.name;
    }

    _isTemplateForm = () =>
    {
        let {cardType} = this.state.data;
        return cardType === CardType.template.name;
    }

    _renderTitleHeader = () =>
    {
        //TODO: Refatorar
        const getHeaderIcon = (isParentCard, isArchivedCard) =>
        {
            if (isParentCard) {return <Icon className="plug"/>;}
            if (isArchivedCard) {return <FaIcon className="icon fa-archive " style={{fontSize: '19px'}}/>;}
            return null;
        };
        let {card, isParentCard} = this.state.data;

        if (this._isTemplateForm())
        {
            return (<span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.templateModalTitle} /></span>);
        }

        let headerIcon = getHeaderIcon(isParentCard, this._isArchivedCard());

        if (this._isNewCard())
        {
            return (<span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.insertNewCard} /></span>);
        }

        return (<span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}>{headerIcon} {card.title} ({card._id})</span>);
    }

    _renderMenu = () =>
    {
        let {card} = this.state.data;
        const isNewCard = this._isNewCard();
        const numberOfAttachments = (card && card.attachments && card.attachments.length > 0) ? card.attachments.length : 0;
        if (this._isTemplateForm())
        {
            return (
                <Menu className="secondary vertical tabular pointing blue" style={{height: '95%', width: '100%', fontSize: '12px'}}>
                    <Item className="active" data-tab="tab-details" style={{cursor: 'pointer'}}><Icon className={'browser'}/><FormattedMessage {...messages.menuDetails} /></Item>
                    <Item data-tab="tab-ratings" style={{cursor: 'pointer'}}><Icon className={'star'}/><FormattedMessage {...messages.menuRating} /></Item>
                    <Item data-tab="tab-construction" style={{cursor: 'pointer'}}><Icon className={'tasks'}/><FormattedMessage {...messages.menuTask} /></Item>
                    <Item data-tab="tab-construction" style={{cursor: 'pointer'}}><Icon className={'configure'}/><FormattedMessage {...messages.menuCustomField} /></Item>
                </Menu>
            );
        }
        return (
            <Menu className="secondary vertical tabular pointing blue" style={{height: '95%', width: '100%', fontSize: '12px'}}>
                {!isNewCard && <Item data-tab="tab-connection" style={{cursor: 'pointer'}}>
                    <Icon className={'plug'}/><FormattedMessage {...messages.menuConnection} />
                </Item>}
                {!isNewCard && <Item data-tab="tab-impediment" style={{cursor: 'pointer'}}><Icon className={'clock'}/><FormattedMessage {...messages.menuImpediment} /></Item>}
                {!isNewCard && <Item data-tab="tab-reminder" style={{cursor: 'pointer'}}><Icon className={'alarm'}/><FormattedMessage {...messages.menuReminder} /></Item>}
                {!isNewCard && <Item data-tab="tab-tasks" style={{cursor: 'pointer'}}>
                    <Icon className={'tasks'}/><FormattedMessage {...messages.menuTask} /> <TaskStatisticLabel card={card}/>
                </Item>}
                {!isNewCard && <Item data-tab="tab-customFields" style={{cursor: 'pointer'}}>
                    <Icon className={'configure'}/><FormattedMessage {...messages.menuCustomField} />
                </Item>}

                {!isNewCard && <div className="ui clearing divider"></div>}

                <Item className="active" data-tab="tab-details" style={{cursor: 'pointer'}}><Icon className={'browser'}/><FormattedMessage {...messages.menuDetails} /></Item>
                <Item data-tab="tab-attachments" style={{cursor: 'pointer'}}>
                    <Icon className={'attach'}/><FormattedMessage {...messages.menuAttachments} />
                    {numberOfAttachments > 0 && <Label className="blue" style={{fontSize: '10px'}}>{numberOfAttachments}</Label>}
                </Item>
                <Item data-tab="tab-ratings" style={{cursor: 'pointer'}}><Icon className={'star'}/><FormattedMessage {...messages.menuRating} /></Item>
                {isNewCard && <Item data-tab="tab-construction" style={{cursor: 'pointer'}}><Icon className={'tasks'}/><FormattedMessage {...messages.menuTask} /></Item>}

                {!isNewCard && <div className="ui clearing divider"></div>}
                {!isNewCard && <Item data-tab="tab-effort" style={{cursor: 'pointer'}}><Icon className={'users'}/><FormattedMessage {...messages.menuEffort} /></Item>}
                {!isNewCard && <Item data-tab="tab-dates" style={{cursor: 'pointer'}}><Icon className={'calendar'}/><FormattedMessage {...messages.menuDate} /></Item>}
                {!isNewCard && <div className="ui clearing divider"></div>}
                {!isNewCard && <Item data-tab="tab-timeline" style={{cursor: 'pointer'}}><Icon className={'film'}/><FormattedMessage {...messages.menuTimeline} /></Item>}
                {!isNewCard && <Item data-tab="tab-dashboard" style={{cursor: 'pointer'}}><Icon className={'pie chart'}/><FormattedMessage {...messages.menuDashboard} /></Item>}
            </Menu>
        );
    }

    _renderSpecificTabs = () =>
    {
        let {card, cardForm} = this.state.data;

        if (this._isTemplateForm())
        {
            return null;
        }
        return (
            [
                <Tab key="tab-attachments" tab="tab-attachments" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <AttachmentTab card={card} ref={c => {this.attachmentTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-connection" tab="tab-connection" style={{width: '88%', height: '100%', minHeight: '400px'}}>
                    <div className="twelve wide stretched column">
                        <ConnectionTab card={card} cardForm={cardForm} onChangeCardData={this._handleExternalChangeData} ref={c => {this.connectionTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-customFields" tab="tab-customFields" style={{width: '87%', height: '100%', minHeight: '400px'}}>
                    <div className="twelve wide stretched column">
                        <CustomFieldTab card={card} ref={c => {this.customFieldTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-dashboard" tab="tab-dashboard" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <DashboardTab card={card} ref={c => {this.dashboardTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-dates" tab="tab-dates" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <CardMovementTab card={card} ref={c => {this.cardMovementTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-effort" tab="tab-effort" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <TimeSheetTab card={card} ref={c => {this.timeSheetTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-impediment" tab="tab-impediment" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <ImpedimentTab card={card} ref={c => {this.impedimentTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-reminder" tab="tab-reminder" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <ReminderTab card={card} ref={c => {this.reminderTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-tasks" tab="tab-tasks" style={{width: '87%', height: '100%', minHeight: '400px'}}>
                    <div className="twelve wide stretched column">
                        <TaskTab card={card} ref={c => {this.taskTab = c;}}/>
                    </div>
                </Tab>,
                <Tab key="tab-timeline" tab="tab-timeline" style={{width: '87%', height: '100%'}}>
                    <div className="twelve wide stretched column">
                        <TimelineTab card={card} ref={c => {this.timelineTab = c;}}/>
                    </div>
                </Tab>
            ]
        );
    }

    _renderAction = () =>
    {
        const {card} = this.state.data;
        const isNewCard = FunctionHelper.isUndefined(card) || (FunctionHelper.isDefined(card) && FunctionHelper.isUndefined(card._id));
        if (this._isTemplateForm())
        {
            return (
                <Actions className="ui menu" style={{textAlign: 'left'}}>
                    <div className="right menu">
                        <Button className="positive right labeled icon" onClick={this._handleSaveTemplateAndClose}><FormattedMessage {...messages.saveTemplateAndClose} /><Icon className="checkmark" /></Button>
                        <Button className="blue right labeled icon" onClick={this._handleSaveTemplateAndClearFormToInsertNew}><FormattedMessage {...messages.saveTemplateAndInsertNew} /><Icon className="add" /></Button>
                        <Button className="negative right labeled icon" onClick={this._handleCancelModal.bind(this)}><FormattedHTMLMessage {...messages.cancel} /><Icon className="cancel" /></Button>
                    </div>
                </Actions>
            );
        }
        return (
            <Actions className="ui menu" style={{textAlign: 'left'}}>
                <Button className="brown left labeled icon" onClick={this._handleSaveCardAsTemplateAndClearFormToInsertNew}><FormattedMessage {...messages.createTemplate} /><Icon className="configure" /></Button>
                <div className="right menu">
                    <Button className="positive right labeled icon" onClick={this._handleSaveCardAndCloseModal} accessKey="F"><FormattedHTMLMessage {...messages.saveAndClose} /><Icon className="checkmark" /></Button>
                    {!this._isArchivedCard() && <Button className="blue right labeled icon" onClick={this._handleSaveCardAndClearFormToInsertNew} accessKey="S"><FormattedHTMLMessage {...messages.saveAndInsertNew} /><Icon className="add" /></Button>}
                    <Button style={{display: (isNewCard) ? 'block' : 'display'}} className="negative right labeled icon" onClick={this._handleCancelModal.bind(this)}><FormattedHTMLMessage {...messages.cancel} /><Icon className="cancel" /></Button>
                </div>
            </Actions>
        );
    }


    _handleTextEditModalTextChanged = (text) =>
    {
        this.descriptionTextEditor.setHtmlValue(text);
    };

    _handleTextEditModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let description = FunctionHelper.nullIfEmpty(this.descriptionTextEditor.getHtmlValue());
        UIActions.showRichTextEditModal.asFunction(description, 'html', this._handleTextEditModalTextChanged.bind(this), this._handleTextEditModalCancel.bind(this));
    };

    _handleTextEditModalCancel = () =>
    {
    };

    _handleChangeSelectedBoard = (newData) =>
    {
        let boardId = newData.value;
        if (FunctionHelper.isUndefined(boardId))
        {
            return;
        }
        this.state.data.card.parent = null;
        this.setImmutableState({parentSelectedBoardId: boardId});
        this.forceUpdate();
    }

    _getBoardDropDownSuggestions = () =>
    {
        if (FunctionHelper.isArrayNullOrEmpty(BoardContextStore.getBoardList()))
        {
            return null;
        }
        return BoardContextStore.getBoardList().map(item => { return {value: item._id, label: item.title};});
    }

    _getSelectedParentBoardId = () =>
    {
        let {parentSelectedBoardId, card} = this.state.data;
        if (FunctionHelper.isDefined(parentSelectedBoardId))
        {
            return parentSelectedBoardId;
        }
        if (FunctionHelper.isDefined(card))
        {
            if (FunctionHelper.isDefined(card.parent) && FunctionHelper.isDefined(card.parent.board))
            {
                return FunctionHelper.getId(card.parent.board);
            }
            return FunctionHelper.getId(card.board);
        }
        return null;
    }

    _handleOnLockIconClick = (propName) =>
    {
        let {lockState} = this.state.data;
        lockState[propName] = FunctionHelper.isUndefined(lockState[propName]) ? true : !lockState[propName];
        this.setImmutableState({lockState: lockState});
        this.forceUpdate();
    }

    _getHeadeBackground = (isParentCard, isArchived) =>
    {
        //TODO: refatorar
        if (isParentCard) {return 'k-red-background';}
        if (isArchived) {return 'k-gold-background';}
        return 'k-background';
    }

    render()
    {
        //let currentBoard = BoardContextStore.getSelectedBoard();
        let {lockState, isToShowModal, isParentCard, card, cardForm, isLoading, actionMessage} = this.state.data;
        const {formatMessage} = this.props.intl;
        let isNewCard = FunctionHelper.isUndefined(card) || (FunctionHelper.isDefined(card) && FunctionHelper.isUndefined(card._id));
        let fields = (FunctionHelper.isDefined(cardForm)) ? cardForm.boundFieldsObj() : null;
        let {parent, description, classOfService, itemType, priority, project, metric, itemSize, cardIdConfig, tags, assignedMembers} = card || {description: null, classOfService: null, itemType: null, priority: null, project: null, metric: null, itemSize: null, cardIdConfig: null, tags: null, assignedMembers: null, parent: null}; //eslint-disable-line
        const selectedBoardId = this._getSelectedParentBoardId();
        if (!card || !cardForm)
        {
            return (
                <Modal className="cardFormModal" style="standard" size="fullscreen" isOpened={isToShowModal} >
                    <Loader loaded={!isLoading} />
                    <Header className="k-background" style={{padding: '0px', borderBottom: '1px solid black'}}>
                        <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                    </Header>
                </Modal>
            );
        }

        const headerBackground = this._getHeadeBackground(isParentCard, this._isArchivedCard());

        const filterConnectedCardSuggestionsFunction = (item) => item._id !== card._id;
        return (
            <Modal closeOnEsc closeIcon className="cardFormModal" style="standard" size="fullscreen" onClose={this._handleOnClose} isOpened={isToShowModal} >
                <Loader loaded={!isLoading} />
                <Header className={headerBackground} style={{padding: '0px', borderBottom: '1px solid black'}}>
                    {this._renderTitleHeader()}
                    <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                </Header>
                <Content style={{height: '100%'}}>
                    <Form name="cardForm" style={{height: '100%'}}>
                        <Grid style={{height: '100%'}} >
                            <Column style={{height: '100%', width: '10%', fontSize: '12px', marginLeft: '0px', paddingLeft: '0px'}}>
                                {this._renderMenu()}
                            </Column>
                            <Tab className="active" tab="tab-details" style={{width: '87%', height: '100%'}}>
                                <Grid className="divided form" style={{display: 'block', height: '<66></66>0px', overflowY: 'scroll', overflowX: 'hidden', marginTop: '0px'}}>
                                    <Row className="sixteen column">
                                        <Column className="eight wide">
                                            {(isNewCard || card.status === CardStatus.backlog.name) && this._isCardForm() &&
                                                <Field className="form-fields-separator" style={{fontSize: '11px'}}>
                                                    <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.status} style={{padding: '4px'}} refName={'cardStatusInput'} ref={(c) => {this.cardStatusField = c;}} editableMode showLabel disabled={false} inputClassName="tiny" errorToolTipClassName="pointing red basic prompt" boundField={fields.status} requiredIcon=""/>
                                                </Field>
                                            }
                                            <Field className="form-fields-separator" style={{fontSize: '15px'}}>
                                                <FormField style={{padding: '4px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.title.name]} refName={'titleInput'} ref={(c) => {this.titleField = c;}} editableMode showLabel disabled={false} inputClassName="tiny" errorToolTipClassName="pointing red basic prompt" boundField={fields.title} requiredIcon=""/>
                                            </Field>
                                            <Fields className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.metricValue} refName={'metricInput'} ref={(c) => {this.metricField = c;}} editableMode showLabel inputClassName="" errorToolTipClassName="red basic prompt" boundField={fields.metricValue} labelStyle={{width: '75px'}} requiredIcon="" style={{padding: '6px', width: '75px'}}/>
                                                <ComboField containerClassName={'k-size k-50percent'} contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.metric} fieldName="metric" label={formatMessage(messages.cardMetricTypeLabel)} style={{maxWidth: '250px'}} getSuggestionFunc={KanbanActions.boardSetting.metricType.search} selectedItem={metric} boardId={card.board} onSelectItem={this._handleSelectedItem} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                                <ComboField containerClassName={'k-size k-50percent'} contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.project} fieldName="project" style={{maxWidth: '250px'}} label={formatMessage(messages.cardProjectLabel)} getSuggestionFunc={KanbanActions.boardSetting.project.searchOpenProject} selectedItem={project} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                            </Fields>
                                            <Fields className="form-fields-separator" style={{fontSize: '11px'}}>
                                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.priorityNumberValue} refName={'priorityNumberInput'} ref={(c) => {this.priorityNumberField = c;}} labelStyle={{width: '75px', whiteSpace: 'nowrap'}} requiredIcon="" style={{padding: '6px', width: '75px'}} editableMode showLabel inputClassName="" errorToolTipClassName="red basic prompt" boundField={fields.priorityNumberValue}/>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.priority} fieldName="priority" label={formatMessage(messages.cardPriorityLabel)} style={{maxWidth: '250px'}} getSuggestionFunc={KanbanActions.boardSetting.priority.search} selectedItem={priority} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.itemSize} fieldName="itemSize" label={formatMessage(messages.cardItemSizeLabel)} style={{maxWidth: '250px'}} getSuggestionFunc={KanbanActions.boardSetting.itemSize.search} selectedItem={itemSize} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                            </Fields>
                                            <Fields className="form-fields-separator" style={{fontSize: '11px'}}>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.classOfService} fieldName="classOfService" label={formatMessage(messages.cardClassOfServiceLabel)} getSuggestionFunc={KanbanActions.boardSetting.classOfService.search} selectedItem={classOfService} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.itemType} fieldName="itemType" label={formatMessage(messages.cardItemTypeLabel)} getSuggestionFunc={KanbanActions.boardSetting.itemType.search} selectedItem={itemType} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                            </Fields>
                                            <Field className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                                <AssignedUserFormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.assignedMembers} style={{width: '100%'}} fieldName="assignedMembers" label={formatMessage(messages.cardAssignMemberLabel)} getSuggestionFunc={KanbanActions.boardSetting.boardMember.search} initialData={assignedMembers} onSelectItems={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.cardAssignMemberPlaceHolder)}/>
                                            </Field>
                                            <Field className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                                <ComboMultiSelectField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.tags} style={{width: '100%'}} fieldName="tags" label={formatMessage(messages.cardTagLabel)} getSuggestionFunc={KanbanActions.boardSetting.tag.search} selectedItems={tags} onSelectItems={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.cardTagPlaceHolder)}/>
                                            </Field>
                                            <Divider style={{width: '100%'}}/>
                                            <Fields className="form-fields-separator" style={{fontSize: '12px', marginTop: '5px'}}>
                                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.startPlanningDate.name]} refName={'startPlanningDateInput'} ref={(c) => {this.startPlanningDateField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel style={{padding: '4px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.startPlanningDate}>
                                                    <Icon className="calendar"/>
                                                </FormField>
                                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.endPlanningDate.name]} refName={'endPlanningDateInput'} ref={(c) => {this.endPlanningDateField = c;}} containerClassName={'k-size k-50percent k-field little separator'} editableMode showLabel style={{padding: '4px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.endPlanningDate}>
                                                    <Icon className="calendar"/>
                                                </FormField>
                                            </Fields>
                                            <Fields className="form-fields-separator" style={{fontSize: '12px', marginTop: '8px'}}>
                                                <FormField style={{padding: '4px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.startExecutionDate.name]} refName={'startExecutionDateInput'} ref={(c) => {this.startExecutionDateField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.startExecutionDate}>
                                                    <Icon className="calendar"/>
                                                </FormField>
                                                <FormField style={{padding: '4px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.endExecutionDate.name]} refName={'endExecutionDateInput'} ref={(c) => {this.endExecutionDateField = c;}} containerClassName={'k-size k-50percent k-field little separator'} editableMode showLabel inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.endExecutionDate}>
                                                    <Icon className="calendar"/>
                                                </FormField>
                                            </Fields>
                                            <Divider style={{width: '100%'}}/>
                                            <Fields className="form-fields-separator" style={{fontSize: '11px'}}>
                                                <FormField style={{padding: '4px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.externalId.name]} refName={'externalIdInput'} ref={(c) => {this.externalIdField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel isToShowErrorMessage style={{padding: '7px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.externalId}>
                                                    <Icon className="plug"/>
                                                </FormField>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.cardIdConfig} fieldName="cardIdConfig" label={'Sistema:'} getSuggestionFunc={KanbanActions.boardSetting.cardIdConfig.search} selectedItem={cardIdConfig} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                            </Fields>
                                            <Fields className="form-fields-separator" style={{marginTop: '5px', fontSize: '11px'}}>
                                                <FormField style={{padding: '4px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.externalLink.name]} refName={'externalLinkInput'} ref={(c) => {this.externalLinkField = c;}} containerClassName={'k-size k-100percent'} editableMode showLabel isToShowErrorMessage style={{padding: '7px'}} inputClassName="left icon" errorToolTipClassName="pointing red basic prompt" boundField={fields.externalLink}>
                                                    <Icon className="linkify"/>
                                                </FormField>
                                            </Fields>
                                        </Column>
                                        <Column className="eight wide">
                                            <Field className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                                <div style={{display: 'inline-flex'}} className="smallSelect">
                                                    <span style={{fontSize: '11px', fontWeight: 700, marginRight: '5px'}}><FormattedMessage {...messages.connectedToBoard}/></span>
                                                    <StaticComboField
                                                        initialValue={selectedBoardId}
                                                        propName="value"
                                                        showValueInLabelIfDistinct={false}
                                                        onChangeData={this._handleChangeSelectedBoard}
                                                        getSuggestions={this._getBoardDropDownSuggestions}
                                                    />
                                                </div>
                                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.parent} style={{width: '100%', fontSize: '11px'}} label={formatMessage(messages.connectedToCard)} fieldName="parent" getSuggestionFunc={KanbanActions.card.searchParentCardToConnect} filterSuggestionFunc={filterConnectedCardSuggestionsFunction} selectedItem={parent} onSelectItem={this._handleSelectedItem} boardId={selectedBoardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                            </Field>
                                            <Field className="form-fields-separator k-description" style={{marginTop: '10px'}}>
                                                <label><FormattedMessage {...messages.cardDescriptionLabel} />
                                                    <Icon onClick={this._handleTextEditModalShow.bind(this)} className={'mini expand'} style={{cursor: 'pointer'}}/>
                                                </label>
                                                <StatefullRichTextEditor wrapperClassName={this._isNewCard() ? 'richedittext-wrapper-large' : 'richedittext-wrapper'} htmlValue={description} ref={(c) => {this.descriptionTextEditor = c;}} />
                                            </Field>
                                            {!this._isNewCard() && <Divider style={{width: '100%'}}/>}
                                            {!this._isNewCard() && <DateMetricTab card={card} onChangeDateMetricData={this._handleChangeDateMetricData} ref={c => {this.dateMetricTab = c;}}/>}
                                        </Column>
                                    </Row>
                                </Grid>
                            </Tab>
                            <Tab key="tab-construction" tab="tab-construction" style={{width: '87%', height: '100%'}}>
                                <div className="twelve wide stretched column">
                                    <UnderConstructionTab ref={c => {this.underConstruction = c;}}/>
                                </div>
                            </Tab>
                            <Tab tab="tab-ratings" style={{width: '87%', height: '100%'}}>
                                <div className="twelve wide stretched column">
                                    <RatingTab card={card} ref={c => {this.ratingTab = c;}}/>
                                </div>
                            </Tab>
                            {this._renderSpecificTabs()}
                        </Grid>
                    </Form>
                </Content>
                {this._renderAction()}
            </Modal>
       );
    }
}

module.exports = injectIntl(CardFormModal);
