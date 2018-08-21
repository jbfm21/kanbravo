//TODO: Intercionalizar
import React, {Component, PropTypes} from 'react';
import {Grid, Column, Checkbox} from 'react-semantify';
import Immutable from 'immutable';
import classNames from 'classNames';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';


import {ImmutableState} from '../../../../decorators';
import {FaIcon, Button, Avatar, TextAreaInput} from '../../../../components';
import {FunctionHelper} from '../../../../commons';

const messages = defineMessages(
{
    delete: {id: 'modal.cardForm.taskTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    cancelButton: {id: 'modal.cardForm.taskTab.cancel.label', description: '', defaultMessage: 'Cancelar'},
    taskDescriptionPlaceHolder: {id: 'modal.cardForm.taskTab.taskDescriptionPlaceHolder', description: '', defaultMessage: 'Descrição'}
});

var StateRecord = Immutable.Record({isAskingDeleteConfirmation: false});

@ImmutableState
class TaskItem extends Component
{
    static displayName = 'TaskItem';

    static propTypes =
    {
        task: PropTypes.object.isRequired,
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
        let itemToUpdate = FunctionHelper.clone(this.props.task);
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
        return (
            <Button onClick={this._handleAskDeleteConfirmation} className="tiny negative">
                <FaIcon className="fa-trash fa-1x"/>
                <FormattedMessage {...messages.delete} />
            </Button>
        );
    }

    render()
    {
        const {task} = this.props;
        const {formatMessage} = this.props.intl;
        const className = classNames({completed: task.completed});
        const checkBoxClassName = classNames({checked: task.completed});
        return (
            <li className={className}>
                <Grid style={{width: '100%'}} >
                    <Column style={{width: '1%', lineHeight: 2}}>
                        <Checkbox init={{onChange: this._handleToggle}} className={checkBoxClassName}><input type="checkbox" defaultChecked={task.completed} /></Checkbox>
                    </Column>
                    <Column style={{width: '3%'}}>
                        {FunctionHelper.isDefined(task.type) &&
                            <div className={'centeredContainer'} style={{width: '24px', height: '24px'}}>
                                <Avatar isToShowBackGroundColor
                                    avatar={task.type.avatar}
                                    isToShowBorder
                                    isToShowSmallBorder
                                    isSquareImageDimension
                                    style={{width: '20px', padding: '0px'}}
                                    hostStyle={{width: null, height: null, display: 'inline-flex'}}/>
                            </div>
                        }
                    </Column>
                    <Column className="two wide" >
                        {
                            FunctionHelper.isDefined(task.type) &&
                                <div>{task.type.title}</div>
                        }
                    </Column>
                    <Column className="nine wide">
                        <TextAreaInput
                            value={task.title}
                            change={this._handleChangeData.bind(this, task)}
                            shouldFinishEditOnEnter={false}
                            propName="title"
                            placeHolder={formatMessage(messages.taskDescriptionPlaceHolder)}
                            normalStyle={{minHeight: '31px', width: '100%', cursor: 'pointer', border: '1px solid transparent', backgroundColor: 'transparent', margin: '0px', padding: '0px'}}
                            style={{minHeight: '60px', height: '100px', maxHeight: '200px'}}
                            maxLength="1000"
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

module.exports = injectIntl(TaskItem);
