import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';
import {Grid, Column, Header, Segment} from 'react-semantify';
import moment from 'moment';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FunctionHelper} from '../../../../commons';

import {FaIcon, Button, Content, DateInput, FormToast, TextInput} from '../../../../components';
import {default as ReminderItem} from './ReminderItem.jsx';

import {default as ReminderStore} from './ReminderStore';

//TODO: implementar shouldUpdate e intercionalizar


const messages = defineMessages(
{
    newReminderDescriptionPlaceHolder: {id: 'modal.cardForm.reminderTab.newReminderDescription.placeHolder', description: 'New Reminder DescriptionTextArea PlaceHolder', defaultMessage: 'Conteúdo do lembrete!'},
    addButton: {id: 'modal.cardForm.reminderTab.addButtom', description: 'Add new reminder button', defaultMessage: 'Criar'},
    addNewReminderTitle: {id: 'modal.cardForm.reminderTab.addNewReminderTitle', description: '', defaultMessage: 'Cadastre um novo Lembrete:'},
    reminderListTitle: {id: 'modal.cardForm.reminderTab.reminderListTitle', description: '', defaultMessage: 'Lembretes cadastrados'},
    reminderLabel: {id: 'modal.cardForm.reminderTab.reminderLabel', description: '', defaultMessage: 'Lembrete'},
    dateLabel: {id: 'modal.cardForm.reminderTab.date', description: '', defaultMessage: 'Data'},
    selectReminderDate: {id: 'modal.cardForm.reminderTab.selectReminderDate', description: '', defaultMessage: 'Para incluir um lembrete é necessário selecionar uma data.'},
    saveReminderTip: {id: 'modal.cardForm.reminderTab.saveReminderTip', description: '', defaultMessage: '(atalho: cntrl+enter para incluir tarefa )'}
});

var StateRecord = Immutable.Record({newReminderDescription: '', newReminderDate: moment().utc().format('YYYY-MM-DD'), isLoading: false, actionMessage: null, reminders: []});

@ImmutableState
@airflux.FluxComponent
class ReminderTab extends Component
{
    static displayName = 'ReminderTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ReminderStore, this._listenToReminderStore);
       this.state = {data: new StateRecord()};
    }

    _listenToReminderStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.reminder.list.progressed:
            case KanbanActions.cardSetting.reminder.add.progressed:
            case KanbanActions.cardSetting.reminder.update.progressed:
            case KanbanActions.cardSetting.reminder.delete.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.reminder.list.failed:
            case KanbanActions.cardSetting.reminder.add.failed:
            case KanbanActions.cardSetting.reminder.update.failed:
            case KanbanActions.cardSetting.reminder.delete.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;


            case KanbanActions.cardSetting.reminder.list.completed:
                this.setImmutableState({isLoading: false, reminders: store.state.reminders});
                break;

            case KanbanActions.cardSetting.reminder.add.completed:
            {
                let {reminderItem} = store.state;
                let {reminders} = this.state.data;
                let match = _.find(reminders, {_id: reminderItem._id});
                if (!match)
                {
                    reminders.unshift(reminderItem);
                }
                this.setImmutableState({reminders: reminders, isLoading: false, newReminderDescription: ''});
                this.reminderDescriptionTextArea.setValue('');
                this.reminderDescriptionTextArea.focus();
                break;
            }

            case KanbanActions.cardSetting.reminder.update.completed:
            {
                let {reminderItem} = store.state;
                let {reminders} = this.state.data;
                let match = _.find(reminders, {_id: reminderItem._id});
                if (match)
                {
                    _.merge(match, reminderItem);

                }
                this.setImmutableState({reminders: reminders, isLoading: false});
                break;
            }

            case KanbanActions.cardSetting.reminder.delete.completed:
            {
                let {reminderItemId} = store.state;
                let {reminders} = this.state.data;
                _.remove(reminders, {_id: reminderItemId});
                this.setImmutableState({reminders: reminders, isLoading: false});
                break;
            }

           default: break;
        }
    }

    _handleChangeNewData = (newData) =>
    {
        this.setImmutableState({newReminderDate: newData.newReminderDate});
    }


	_handleNewReminderDescriptionChange = (event) =>
    {
        this.setImmutableState({newReminderDescription: event.target.value});
	}

    _handleAddReminder = (e) =>
    {
        e.preventDefault();
        const {card} = this.props;
        const {formatMessage} = this.props.intl;
        const {newReminderDate} = this.state.data;
        const newReminderDescription = this.reminderDescriptionTextArea.getValue().trim();
        if (!newReminderDate)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.selectReminderDate)});
            return;
        }
        const reminder = {board: card.board, card: card._id, description: newReminderDescription.trim(), date: newReminderDate};
        this.setImmutableState({isLoading: true});
        KanbanActions.cardSetting.reminder.add.asFunction(card, reminder);
    }

    _handleDelete = (reminder, e) => //eslint-disable-line
    {
        e.preventDefault();
        KanbanActions.cardSetting.reminder.delete.asFunction(reminder);
	}

    _handleSave = (reminderToSave) => //eslint-disable-line
    {
        KanbanActions.cardSetting.reminder.update.asFunction(reminderToSave);
        this.setImmutableState({isLoading: true});
	}

    render()
    {
        let {reminders, isLoading, actionMessage, newReminderDate} = this.state.data;
        const {formatMessage} = this.props.intl;
        let newReminderDescriptionPlaceHolder = formatMessage(messages.newReminderDescriptionPlaceHolder);
        let reminderItems = reminders.map(function (reminder, i)
        {
            return (<ReminderItem key={`${reminder._id}_${reminder.nonce}`} reminder={reminder} index={i} onDelete={this._handleDelete.bind(this, reminder)} onSave={this._handleSave.bind(this)}/>);
        }, this);
        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />

                <Segment className="red">
                    <Content className="k-new-setting">
                        <div><FormattedMessage {...messages.addNewReminderTitle}/></div>
                        <div style={{display: 'inline-flex'}}>
                            <DateInput value={newReminderDate} propName="newReminderDate" change={this._handleChangeNewData} classLoading="isLoading" classInvalid="k-inlineEdit invalid" showReadInFormMode/>
                            <Button onClick={this._handleAddReminder} className="tiny positive" style={{width: '100px', marginLeft: '10px', position: 'relative', height: '30px'}}><FaIcon className="fa-plus fa-1x"/><FormattedMessage {...messages.addButton} /></Button>
                        </div>
                        <TextInput
                            ref={(ref) => {this.reminderDescriptionTextArea = ref; return;}}
                            style={{minHeight: '60px', height: '60px', maxHeight: '120px', marginTop: '10px'}}
                            maxLength="1000"
                            submitKeyFunction={FunctionHelper.isCntrlEnterKeyPressed}
                            placeholder={newReminderDescriptionPlaceHolder}
                            onChangeData={this._handleAddReminder}
                            autoFocus={true}/>
                        <div style={{fontSize: '10px', color: 'gray'}}><FormattedMessage {...messages.saveReminderTip}/></div>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/><Content><FormattedMessage {...messages.reminderListTitle}/></Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        <ul className="k-card-list-edit">
                            <li className={'listHeader'}>
                                <Grid style={{width: '100%'}}>
                                    <Column className="one  wide "></Column>
                                    <Column className="seven wide "><FormattedMessage {...messages.reminderLabel}/></Column>
                                    <Column className="three wide " style={{textAlign: 'center', margin: '0px', padding: '0px'}}><FormattedMessage {...messages.dateLabel}/></Column>
                                </Grid>
                            </li>
                            {reminderItems}
                        </ul>
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(ReminderTab, {withRef: true});

