//TODO: MAIS OU MENSO REPLICADO COM CARDFORMODAL, DEPOIS VER UMA SOLUÇÃO MELHOR
import React, {Component} from 'react';
import * as airflux from 'airflux';
import moment from 'moment';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {Icon, Grid, Column, Row, Field, Fields, Divider} from 'react-semantify';
import forms from 'newforms';

import {ImmutableState} from '../../../../../decorators';
import {Container, FormField, FormToast, StaticComboField, Button} from '../../../../../components';
import {KanbanActions, UIActions} from '../../../../../actions';
import {CardStatus, AddCardPosition} from '../../../../../enums';

import {FormDefinition, FunctionHelper, CalendarLayoutHelper} from '../../../../../commons';
import {BoardContextStore} from '../../../../../stores';

import {default as StatefullRichTextEditor} from '../../components/StatefullRichTextEditor.jsx';
import {default as ComboField} from '../../components/ComboField.jsx';
import {default as ComboMultiSelectField} from '../../components/ComboMultiSelectField.jsx';
import {default as AssignedUserFormField} from '../../AssignedUserFormField.jsx';
import {default as ConnectNewCardStore} from './ConnectNewCardStore';
import {ResumeTableWidged} from '../components';

const messages = defineMessages(
{
    title: {id: 'modal.cardForm.ConnectNewCardTab.emptyConnection.title', description: '', defaultMessage: 'Conexão'},
    helpText1: {id: 'modal.cardForm.ConnectNewCardTab.emptyConnection.helpText', description: '', defaultMessage: 'Crie relacionamentos entre cartões no mesmo quadro ou em quadros diferentes.'},

    loading: {id: 'modal.cardForm.ConnectNewCardTab.loading', description: 'Loading', defaultMessage: 'Aguarde. Carregando informações'},
    cancel: {id: 'modal.cardForm.ConnectNewCardTab.cancel', description: 'Cancel cardForm model', defaultMessage: 'Limpar formulário'},

    saveAndInsertNew: {id: 'modal.cardForm.ConnectNewCardTab.saveAndInsertNew', description: 'saveAndInsertNew cardForm editor', defaultMessage: 'Salvar conexão e <span style="text-decoration: underline;font-size: 20px">I</span>ncluir Novo'},

    invalidFormErrorMessage: {id: 'modal.cardForm.ConnectNewCardTab.formInvalidError', description: 'formInvalidError cardForm editor', defaultMessage: 'Preencha o formulário corretamenta'},

    cardDescriptionLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.description', description: '', defaultMessage: 'Descrição: '},
    cardAssignMemberLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.assignMember.label', description: '', defaultMessage: 'Executores: '},
    cardAssignMemberPlaceHolder: {id: 'modal.cardForm.ConnectNewCardTab.card.assignMember.placeholder', description: '', defaultMessage: 'Cadastre os executores'},

    cardTagLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.tag.label', description: '', defaultMessage: 'Tags: '},
    cardTagPlaceHolder: {id: 'modal.cardForm.ConnectNewCardTab.card.tag.placeholder', description: '', defaultMessage: 'Cadastre as tags'},

    selectPlaceHolder: {id: 'modal.cardForm.ConnectNewCardTab.select.placeholder', description: '', defaultMessage: 'Selecionar'},
    cardClassOfServiceLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.classOfService.label', description: '', defaultMessage: 'Classe de serviço:'},
    cardItemTypeLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.itemType.label', description: '', defaultMessage: 'Tipo de Item:'},
    cardItemSizeLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.itemSize.label', description: '', defaultMessage: 'Tamanho:'},
    cardPriorityLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.priority.label', description: '', defaultMessage: 'Prioridade:'},
    cardProjectLabel: {id: 'modal.cardForm..ConnectNewCardTabcard.project.label', description: '', defaultMessage: 'Projeto:'},
    cardMetricTypeLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.metricType.label', description: '', defaultMessage: 'Unidade:'},
    boardLabel: {id: 'modal.cardForm.ConnectNewCardTab.card.board.label', description: '', defaultMessage: 'Quadro:'}
});


@ImmutableState
@airflux.FluxComponent
class ConnectNewCardTab extends Component
{
    static displayName = 'ConnectNewCardTab';
    static StateRecord = Immutable.Record({isLoading: true, boardId: null, cardToInsert: null, cardForm: null, actionMessage: null, lockState: []});

    static propTypes =
    {
        intl: intlShape.isRequired,
        parentCard: React.PropTypes.object.isRequired,
        connections: React.PropTypes.any.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ConnectNewCardStore, this._listenToConnectNewCardStore);
       this.state = {data: new ConnectNewCardTab.StateRecord({})};
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

    componentDidMount()
    {
        let cardToInsert = {board: this.props.parentCard.board};
        const cardForm = this._createForm(cardToInsert);
        this.setImmutableState({boardId: FunctionHelper.getId(this.props.parentCard.board), cardToInsert: cardToInsert, cardForm: cardForm});
        this.forceUpdate(); //obs: nao remover, pois se não o menu tabbar para de funcionar
    }

    _listenToConnectNewCardStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardConnection.addInFirstLeafLane.progressed:
            case KanbanActions.cardConnection.addInBacklog.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case KanbanActions.cardConnection.addInFirstLeafLane.failed:
            case KanbanActions.cardConnection.addInBacklog.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardConnection.addInFirstLeafLane.completed:
            case KanbanActions.cardConnection.addInBacklog.completed:
                this.setImmutableState({isLoading: false, actionMessage: ''});
                this._setEmptyCard(false, false);
                this.titleField.refs.titleInput.focus();
                break;
            default: break;
        }
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
        refMaps['status'] =  this.cardStatusField.refs.cardStatusInput; //eslint-disable-line
        return refMaps;
    }


    _createForm = (card) =>
    {
        let cardFormData = {
            parent: this.props.parentCard,
            title: card.title || '',
            status: card.status || '',
            metricValue: card.metricValue || '',
            priorityNumberValue: card.priorityNumberValue || '',
            externalId: card.externalId || '',
            externalLink: card.externalLink || '',
            startPlanningDate: (card.startPlanningDate) ? CalendarLayoutHelper.getMomentDate(card.startPlanningDate).format('YYYY-MM-DD') : null,
            endPlanningDate: (card.endPlanningDate) ? CalendarLayoutHelper.getMomentDate(card.endPlanningDate).format('YYYY-MM-DD') : null,
            startExecutionDate: (card.startExecutionDate) ? CalendarLayoutHelper.getMomentDate(card.startExecutionDate).format('YYYY-MM-DD') : null,
            endExecutionDate: (card.endExecutionDate) ? CalendarLayoutHelper.getMomentDate(card.endExecutionDate).format('YYYY-MM-DD') : null
        };
        return new this.cardFormEntity({prefix: 'connectedCard', initial: cardFormData, onChange: this._handleFormChange});
    }

    _setEmptyCard = (clearAll, clearAllBoardConfig) =>
    {
        let {cardToInsert, lockState} = this.state.data;

        let inputRefs = this. _getInputRefMaps();

        let newCardToInsert = {
            board: this.state.data.boardId,
            parent: this.props.parentCard,
            description: lockState.description && !clearAll ? cardToInsert.description : null,
            classOfService: lockState.classOfService && !clearAll && !clearAllBoardConfig ? cardToInsert.classOfService : null,
            itemType: lockState.itemType && !clearAll && !clearAllBoardConfig ? cardToInsert.itemType : null,
            priority: lockState.priority && !clearAll && !clearAllBoardConfig ? cardToInsert.priority : null,
            project: lockState.project && !clearAll && !clearAllBoardConfig ? cardToInsert.project : null,
            metric: lockState.metric && !clearAll && !clearAllBoardConfig ? cardToInsert.metric : null,
            childrenMetric: lockState.childrenMetric && !clearAll && !clearAllBoardConfig ? cardToInsert.childrenMetric : null,
            itemSize: lockState.itemSize && !clearAll && !clearAllBoardConfig ? cardToInsert.itemSize : null,
            cardIdConfig: lockState.cardIdConfig && !clearAll && !clearAllBoardConfig ? cardToInsert.cardIdConfig : null,
            tags: lockState.tags && !clearAll && !clearAllBoardConfig ? cardToInsert.tags : null,
            assignedMembers: lockState.assignedMembers && !clearAll && !clearAllBoardConfig ? cardToInsert.assignedMembers : null,
            attachments: [],
            ratings: lockState.ratings && !clearAll && !clearAllBoardConfig ? cardToInsert.ratings : null,

            status: lockState.status && !clearAll ? inputRefs.status.value : null,
            title: lockState.title && !clearAll ? inputRefs.title.value : null,
            metricValue: lockState.metricValue && !clearAll ? inputRefs.metricValue.value : null,
            priorityNumberValue: lockState.priorityNumberValue && !clearAll ? inputRefs.priorityNumberValue.value : null,
            externalId: lockState.externalId && !clearAll ? inputRefs.externalId.value : null,
            externalLink: lockState.externalLink && !clearAll ? inputRefs.externalLink.value : null,
            startPlanningDate: lockState.startPlanningDate && !clearAll ? inputRefs.startPlanningDate.value : null,
            endPlanningDate: lockState.endPlanningDate && !clearAll ? inputRefs.endPlanningDate.value : null,
            startExecutionDate: lockState.startExecutionDate && !clearAll ? inputRefs.startExecutionDate.value : null,
            endExecutionDate: lockState.endExecutionDate && !clearAll ? inputRefs.endExecutionDate.value : null
        };

        this.state.data.cardForm.reset(newCardToInsert);

        const refMaps = this._getInputRefMaps();
        for (let fieldName in refMaps)
        {
            if (refMaps.hasOwnProperty(fieldName))
            {
                let fieldRef = refMaps[fieldName];
                fieldRef.value = lockState[fieldName] ? newCardToInsert[fieldName] : '';
            }
        }

        this.descriptionTextEditor.clearText();
        this.setImmutableState({isLoading: false, cardToInsert: newCardToInsert, cardForm: this.state.data.cardForm});
        this.forceUpdate();
    }

    _getFormData = () =>
    {
        const {formatMessage} = this.props.intl;
        let {cardToInsert, cardForm} = this.state.data;
        let isValid = cardForm.validate();
        if (!isValid)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.invalidFormErrorMessage), isLoading: false});
            return null;
        }

        let cardFormData = cardForm.cleanedData;

        cardToInsert.board = this.state.data.boardId;
        cardToInsert.parent = this.props.parentCard;
        cardToInsert.status = cardFormData.status;
        cardToInsert.title = cardFormData.title;
        cardToInsert.metricValue = FunctionHelper.nullIfEmpty(cardFormData.metricValue);
        cardToInsert.priorityNumberValue = FunctionHelper.nullIfEmpty(cardFormData.priorityNumberValue);
        cardToInsert.externalId = FunctionHelper.nullIfEmpty(cardFormData.externalId);
        cardToInsert.externalLink = FunctionHelper.nullIfEmpty(cardFormData.externalLink);
        cardToInsert.startPlanningDate = cardFormData.startPlanningDate ? moment(cardFormData.startPlanningDate).utc().format('YYYY-MM-DD') : null;
        cardToInsert.endPlanningDate = cardFormData.endPlanningDate ? moment(cardFormData.endPlanningDate).utc().format('YYYY-MM-DD') : null;
        cardToInsert.startExecutionDate = cardFormData.startExecutionDate ? moment(cardFormData.startExecutionDate).utc().format('YYYY-MM-DD') : null;
        cardToInsert.endExecutionDate = cardFormData.endExecutionDate ? moment(cardFormData.endExecutionDate).utc().format('YYYY-MM-DD') : null;
        cardToInsert.description = FunctionHelper.nullIfEmpty(this.descriptionTextEditor.getHtmlValue());

        return cardToInsert;
    }

    _handleFormChange = () =>
    {
    };

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

    _handleClearForm = (e) =>
    {
        e.preventDefault();
        this._setEmptyCard(true, true);
    }

    _handleSaveCardAndClearFormToInsertNew = (e) =>
    {
        e.preventDefault();
        this._submitCardFormData();
    }

    _handleSelectedItem = (fieldName, selectedItem) =>
    {
        this.state.data.cardToInsert[fieldName] = selectedItem;
        //TODO: importante para renderizar visto que não estou usando o setImutableDate
        this.forceUpdate();
    }

    _handleChangeSelectedBoard = (newData) =>
    {
        let boardId = newData.value;
        if (FunctionHelper.isUndefined(boardId))
        {
            return;
        }
        this.setImmutableState({boardId: boardId});
        this._setEmptyCard(false, true);
    }

    _submitCardFormData = () => //eslint-disable-line
    {
        let cardToSave = this._getFormData();
        if (cardToSave === null)
        {
            return null;
        }
        let cardStatusAndPosition = cardToSave.status;
        let splittedCardStatus = cardStatusAndPosition.split('/');
        let cardStatus = splittedCardStatus[0];
        //TODO: separar a posicao do cartão em combobox distintos
        let position = splittedCardStatus[1];
        switch (cardStatus)
        {
            case CardStatus.inboard.name: KanbanActions.cardConnection.addInFirstLeafLane.asFunction(this.state.data.boardId, cardToSave, position); break;
            case CardStatus.backlog.name: KanbanActions.cardConnection.addInBacklog.asFunction(this.state.data.boardId, cardToSave); break;
            default: KanbanActions.cardConnection.addInBacklog.asFunction(this.state.data.boardId, cardToSave); break;
        }
    }

    _getBoardDropDownSuggestions = () =>
    {
        if (FunctionHelper.isArrayNullOrEmpty(BoardContextStore.getBoardList()))
        {
            return null;
        }
        return BoardContextStore.getBoardList().map(item => { return {value: item._id, label: item.title};});
    }

    _handleOnLockIconClick = (propName) =>
    {
        let {lockState} = this.state.data;
        lockState[propName] = FunctionHelper.isUndefined(lockState[propName]) ? true : !lockState[propName];
        this.setImmutableState({lockState: lockState});
        this.forceUpdate();
    }


    render()
    {
        let {boardId, cardToInsert, cardForm, actionMessage, lockState} = this.state.data;
        let {parentCard, connections} = this.props;
        const {formatMessage} = this.props.intl;
        let fields = (FunctionHelper.isDefined(cardForm)) ? cardForm.boundFieldsObj() : null;
        let {description, classOfService, itemType, priority, project, metric, itemSize, cardIdConfig, tags, assignedMembers, status} = cardToInsert || {description: null, classOfService: null, itemType: null, priority: null, project: null, metric: null, itemSize: null, cardIdConfig: null, tags: null, assignedMembers: null, status: null}; //eslint-disable-line

        if (FunctionHelper.isUndefined(fields))
        {
            return null;
        }
        return (
            <Container style={{width: '99%'}}>
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '11px'}} />
                <ResumeTableWidged card={parentCard} connections={connections} />
                <Grid className="divided form" style={{width: '99%'}}>
                    <Row className="sixteen column">
                        <Column className="eight wide">
                            <Fields className="form-fields-separator" style={{fontSize: '11px'}}>
                                <div>
                                    <label style={{fontWeight: 'bold'}}><FormattedMessage {...messages.boardLabel}/></label>
                                    <div className="itemContainer">
                                        <div className="content tinySelect">
                                            <StaticComboField
                                                style={{maxWidth: '200px'}}
                                                initialValue={boardId}
                                                propName="value"
                                                showValueInLabelIfDistinct={false}
                                                onChangeData={this._handleChangeSelectedBoard}
                                                getSuggestions={this._getBoardDropDownSuggestions}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.status} refName={'cardStatusInput'} style={{padding: '6px'}} containerStyle={{marginLeft: '10px'}} ref={(c) => {this.cardStatusField = c;}} editableMode showLabel disabled={false} inputClassName="tiny" errorToolTipClassName="pointing red basic prompt" selectedItem={status} boundField={fields.status} requiredIcon=""/>
                            </Fields>
                            <Field className="form-fields-separator" style={{fontSize: '12px', marginTop: '5px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.title.name]} refName={'titleInput'} ref={(c) => {this.titleField = c;}} editableMode showLabel disabled={false} inputClassName="tiny" errorToolTipClassName="pointing red basic prompt" boundField={fields.title} requiredIcon=""/>
                            </Field>
                            <Fields className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.metricValue} refName={'metricInput'} ref={(c) => {this.metricField = c;}} editableMode showLabel inputClassName="" errorToolTipClassName="red basic prompt" boundField={fields.metricValue} labelStyle={{width: '75px'}} requiredIcon="" style={{padding: '6px', width: '75px'}}/>
                                <ComboField containerClassName={'k-size k-50percent'} contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.metric} fieldName="metric" label={formatMessage(messages.cardMetricTypeLabel)} style={{maxWidth: '200px'}} getSuggestionFunc={KanbanActions.boardSetting.metricType.search} style={{maxWidth: '250px'}} selectedItem={metric} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                <ComboField contentClassName="tinySelect" style={{maxWidth: '250px'}} onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.project} fieldName="project" label={formatMessage(messages.cardProjectLabel)} getSuggestionFunc={KanbanActions.boardSetting.project.searchOpenProject} selectedItem={project} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                            </Fields>
                            <Fields className="form-fields-separator" style={{fontSize: '11px', marginTop: '5px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.priorityNumberValue} refName={'priorityNumberInput'} ref={(c) => {this.priorityNumberField = c;}} labelStyle={{width: '75px', whiteSpace: 'nowrap'}} style={{padding: '6px', width: '75px'}} editableMode showLabel inputClassName="" errorToolTipClassName="red basic prompt" boundField={fields.priorityNumberValue} requiredIcon=""/>
                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.priority} fieldName="priority" label={formatMessage(messages.cardPriorityLabel)} style={{maxWidth: '250px'}} getSuggestionFunc={KanbanActions.boardSetting.priority.search} selectedItem={priority} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.itemSize} fieldName="itemSize" label={formatMessage(messages.cardItemSizeLabel)} style={{maxWidth: '250px'}} getSuggestionFunc={KanbanActions.boardSetting.itemSize.search} selectedItem={itemSize} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                            </Fields>
                            <Fields className="form-fields-separator" style={{fontSize: '11px'}}>
                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.classOfService} fieldName="classOfService" label={formatMessage(messages.cardClassOfServiceLabel)} getSuggestionFunc={KanbanActions.boardSetting.classOfService.search} selectedItem={classOfService} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.itemType} fieldName="itemType" label={formatMessage(messages.cardItemTypeLabel)} getSuggestionFunc={KanbanActions.boardSetting.itemType.search} selectedItem={itemType} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                            </Fields>
                            <AssignedUserFormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.assignedMembers} style={{width: '100%'}} fieldName="assignedMembers" label={formatMessage(messages.cardAssignMemberLabel)} getSuggestionFunc={KanbanActions.boardSetting.boardMember.search} initialData={assignedMembers} onSelectItems={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.cardAssignMemberPlaceHolder)}/>
                            <ComboMultiSelectField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.tags} style={{width: '100%'}} fieldName="tags" label={formatMessage(messages.cardTagLabel)} getSuggestionFunc={KanbanActions.boardSetting.tag.search} selectedItems={tags} onSelectItems={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.cardTagPlaceHolder)}/>
                            <Divider style={{width: '100%'}}/>
                            <Fields className="form-fields-separator" style={{fontSize: '12px', marginTop: '5px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.startPlanningDate.name]} refName={'startPlanningDateInput'} ref={(c) => {this.startPlanningDateField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel style={{padding: '4px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.startPlanningDate}>
                                    <Icon className="calendar"/>
                                </FormField>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.endPlanningDate.name]} refName={'endPlanningDateInput'} ref={(c) => {this.endPlanningDateField = c;}} containerClassName={'k-size k-50percent k-field little separator'} editableMode showLabel style={{padding: '4px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.endPlanningDate}>
                                    <Icon className="calendar"/>
                                </FormField>
                            </Fields>
                            <Fields className="form-fields-separator" style={{fontSize: '12px', marginTop: '5px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.startExecutionDate.name]} refName={'startExecutionDateInput'} ref={(c) => {this.startExecutionDateField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel style={{padding: '2px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.startExecutionDate}>
                                    <Icon className="calendar"/>
                                </FormField>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.endExecutionDate.name]} refName={'endExecutionDateInput'} ref={(c) => {this.endExecutionDateField = c;}} containerClassName={'k-size k-50percent k-field little separator'} editableMode showLabel style={{padding: '2px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.endExecutionDate}>
                                    <Icon className="calendar"/>
                                </FormField>
                            </Fields>
                            <Divider style={{width: '100%'}}/>
                            <Fields className="form-fields-separator" style={{fontSize: '11px', marginTop: '8px'}}>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.externalId.name]} refName={'externalIdInput'} ref={(c) => {this.externalIdField = c;}} containerClassName={'k-size k-50percent'} editableMode showLabel isToShowErrorMessage style={{padding: '6px'}} inputClassName="left icon" errorToolTipClassName="red basic prompt" boundField={fields.externalId}>
                                    <Icon className="plug"/>
                                </FormField>
                                <ComboField contentClassName="tinySelect" onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState.cardIdConfig} fieldName="cardIdConfig" label={'Sistema:'} getSuggestionFunc={KanbanActions.boardSetting.cardIdConfig.search} selectedItem={cardIdConfig} onSelectItem={this._handleSelectedItem} boardId={boardId} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                                <FormField onLockIconClick={this._handleOnLockIconClick} isValueLocked={lockState[fields.externalLink.name]} refName={'externalLinkInput'} ref={(c) => {this.externalLinkField = c;}} containerClassName={'k-size k-100percent'} editableMode showLabel isToShowErrorMessage style={{padding: '6px'}} inputClassName="left icon" errorToolTipClassName="pointing red basic prompt" boundField={fields.externalLink}>
                                    <Icon className="linkify"/>
                                </FormField>
                            </Fields>
                        </Column>
                        <Column className="eight wide">
                            <Field className="form-fields-separator k-description">
                                <label><FormattedMessage {...messages.cardDescriptionLabel} />
                                    <Icon onClick={this._handleTextEditModalShow.bind(this)} className={'mini expand'} style={{cursor: 'pointer'}}/>
                                </label>
                                <StatefullRichTextEditor wrapperClassName="richedittext-wrapper-long" htmlValue={description} ref={(c) => {this.descriptionTextEditor = c;}} />
                            </Field>
                            <Container style={{display: 'inline', float: 'right', textAlign: 'right', marginTop: '5px'}}>
                                <Button className="blue left labeled icon" onClick={this._handleSaveCardAndClearFormToInsertNew} accessKey="I"><FormattedHTMLMessage {...messages.saveAndInsertNew} /><Icon className="plug" /></Button>
                                <Button className="left labeled icon" onClick={this._handleClearForm}><FormattedMessage {...messages.cancel} /><Icon className="erase" /></Button>
                            </Container>

                        </Column>
                    </Row>
                </Grid>
            </Container>
        );
    }
}

module.exports = injectIntl(ConnectNewCardTab, {withRef: true});


