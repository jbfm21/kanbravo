//TODO: Intercionalizar
import React, {Component, PropTypes} from 'react';
import {Checkbox, Grid, Column} from 'react-semantify';
import classNames from 'classNames';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';


import {ImmutableState} from '../../../../decorators';
import {FaIcon, Button, DateInput, TextAreaInput} from '../../../../components';
import {FunctionHelper} from '../../../../commons';

const messages = defineMessages(
{
    delete: {id: 'modal.cardForm.reminderTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    cancelButton: {id: 'modal.cardForm.reminderTab.cancel.label', description: '', defaultMessage: 'Cancelar'},
    reminderTextPlaceHolder: {id: 'modal.cardForm.reminderTab.reminderTextPlaceHolder', description: '', defaultMessage: 'Conteúdo do lembrete!'}
});

var StateRecord = Immutable.Record({isAskingDeleteConfirmation: false});

@ImmutableState
class ReminderItem extends Component
{
    static displayName = 'ReminderItem';

    static propTypes =
    {
        reminder: PropTypes.object.isRequired,
        onDelete: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord()};
    }

    _handleChangeData = (item, newData) =>
    {
       let itemToUpdate = FunctionHelper.cloneAndAssign(item, newData);
       this.props.onSave(itemToUpdate);
    }

    _handleToggle = () =>
    {
        let itemToUpdate = FunctionHelper.clone(this.props.reminder);
        itemToUpdate.completed = !itemToUpdate.completed;
        this.props.onSave(itemToUpdate);
	}

    _handleAskDeleteConfirmation = () =>
    {
        this.setImmutableState({isAskingDeleteConfirmation: true});
    }

    _handleDeleteCancel = () =>
    {
        this.setImmutableState({isAskingDeleteConfirmation: false});
    }

    _renderActionButton = () =>
    {
        const {onDelete} = this.props;
        const {isAskingDeleteConfirmation} = this.state.data;
        if (isAskingDeleteConfirmation)
        {
            return ([
                <Button key="card_item_deleteButton" onClick={onDelete} className="mini negative">
                    <FaIcon className="fa-trash fa-1x"/>
                    <FormattedMessage {...messages.delete} />
                </Button>,
                <Button key="card_item_cancelButton" onClick={this._handleDeleteCancel} className="mini cancel">
                    <FaIcon className="fa-times-circle-o fa-1x" style={{marginRight: '5px'}} />
                    <FormattedMessage {...messages.cancelButton} />
                </Button>
            ]);
        }
        return (<Button onClick={this._handleAskDeleteConfirmation} className="tiny negative">
                    <FaIcon className="fa-trash fa-1x"/>
                    <FormattedMessage {...messages.delete} />
                </Button>
        );
    }

    render()
    {
        const {reminder} = this.props;
        const className = classNames({completed: reminder.completed});
        const {formatMessage} = this.props.intl;
        const checkBoxClassName = classNames({checked: reminder.completed});
        return (
            <li className={className}>
                <Grid style={{width: '100%'}} >
                    <Column className="one wide">
                        <Checkbox init={{onChange: this._handleToggle}} className={checkBoxClassName}>
                            <input type="checkbox" defaultChecked={reminder.completed} />
                        </Checkbox>
                    </Column>
                    <Column className="seven wide">
                        <TextAreaInput
                            value={reminder.description}
                            shouldFinishEditOnEnter={false}
                            change={this._handleChangeData.bind(this, reminder)}
                            propName="description"
                            placeHolder={formatMessage(messages.reminderTextPlaceHolder)}
                            normalStyle={{minHeight: '31px', width: '100%', cursor: 'pointer', border: '1px solid transparent', backgroundColor: 'transparent', margin: '0px', padding: '0px'}}
                            style={{minHeight: '60px', height: '100px', maxHeight: '200px'}}
                            maxLength="1000"
                            classLoading="loading"
                            classInvalid="k-inlineEdit invalid" />
                    </Column>
                    <Column className="three wide" >
                        <DateInput
                            value={reminder.date}
                            change={this._handleChangeData.bind(this, reminder)}
                            propName="date"
                            classLoading="loading"
                            classInvalid="k-inlineEdit invalid" />
                    </Column>
                    <Column style={{width: '8%', display: 'inline-flex'}}>
                        {this._renderActionButton()}
                    </Column>
                </Grid>
            </li>
        );
    }
}

module.exports = injectIntl(ReminderItem);
