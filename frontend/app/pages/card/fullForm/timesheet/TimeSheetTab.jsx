import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FaIcon, Button, Description, Avatar, DateTimeInput, DateInput, MinutesInput, FormToast} from '../../../../components';
import {FunctionHelper} from '../../../../commons';

import {UserEntity} from '../../../../entities';


import {default as InformationOnlyAfterCardIsCreated} from '../message/InformationOnlyAfterCardIsCreated.jsx';

import {default as TimeSheetStore} from './TimeSheetStore';

//TODO: implementar shouldUpdate

var StateRecord = Immutable.Record({isLoading: false, timeSheet: null, isAskingDeleteConfirmation: null, actionMessage: ''});

const messages = defineMessages(
{
    automaticTimeSheetLabel: {id: 'modal.cardForm.timesheetTab.automaticTimeSheet.label', description: 'TimeSheet timesheetTab label', defaultMessage: 'Timesheet automático'},
    startDateLabel: {id: 'modal.cardForm.timesheetTab.startDate.label', description: 'TimeSheet startDate label', defaultMessage: 'Data'},
    startLabel: {id: 'modal.cardForm.timesheetTab.start.label', description: 'TimeSheet startDate label', defaultMessage: 'Início'},
    endLabel: {id: 'modal.cardForm.timesheetTab.end.label', description: 'TimeSheet startDate label', defaultMessage: 'Fim'},
    memberLabel: {id: 'modal.cardForm.timesheetTab.member.label', description: 'TimeSheet member label', defaultMessage: 'Membro'},
    automaticHoursLabel: {id: 'modal.cardForm.timesheetTab.automaticHours.label', description: 'TimeSheet hours label', defaultMessage: 'Horas'},
    hoursLabel: {id: 'modal.cardForm.timesheetTab.hours.label', description: 'TimeSheet hours label', defaultMessage: 'Horas corrigidas'},
    delete: {id: 'modal.cardForm.timesheetTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    cancelButton: {id: 'modal.cardForm.timesheetTab.cancel.label', description: '', defaultMessage: 'Cancelar'},
    emptyTimeSheet: {id: 'modal.cardForm.timesheetTab.empty', description: '', defaultMessage: 'Para registrar o esforço investido no cartão, de um clique no seu avatar para iniciar a contagem do tempo, e um novo clique para finalizar a contagem.'}
});


@ImmutableState
@airflux.FluxComponent
class TimeSheetTab extends Component
{
    static displayName = 'TImeSheetTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(TimeSheetStore, this._listenToTimeSheetStore);
       this.state = {data: new StateRecord()};
    }

    _listenToTimeSheetStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.timesheet.list.progressed:
            case KanbanActions.cardSetting.timesheet.add.progressed:
            case KanbanActions.cardSetting.timesheet.update.progressed:
            case KanbanActions.cardSetting.timesheet.delete.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.timesheet.list.failed:
            case KanbanActions.cardSetting.timesheet.add.failed:
            case KanbanActions.cardSetting.timesheet.update.failed:
            case KanbanActions.cardSetting.timesheet.delete.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardSetting.timesheet.list.completed:
                this.setImmutableState({isLoading: false, timeSheet: store.state.timeSheet});
                break;

            case KanbanActions.cardSetting.timesheet.add.completed:
            {
                //TODO: implementar adição
                break;
            }

            case KanbanActions.cardSetting.timesheet.update.completed:
            {
                const {timeSheetItem} = store.state;
                delete timeSheetItem.user; //nao substitui o usuário, somente os dados do timesheet, pois o item retorna somente o identificador e nao as informações completas
                let {timeSheet} = this.state.data;
                let match = _.find(timeSheet, {_id: timeSheetItem._id});
                if (match)
                {
                    _.merge(match, timeSheetItem);

                }
                this.setImmutableState({timeSheet: timeSheet, isLoading: false});
                break;
            }

            case KanbanActions.cardSetting.timesheet.delete.completed:
            {
                const {timesheetItemId} = store.state;
                let {timeSheet} = this.state.data;
                _.remove(timeSheet, {_id: timesheetItemId});
                this.setImmutableState({timeSheet: timeSheet, isLoading: false});
                break;
            }

           default: break;
        }
    }

    _handleChangeData = (item, newData) =>
    {
       this.setImmutableState({isLoading: true});
       const itemToUpdate = FunctionHelper.cloneAndAssign(item, newData);
       KanbanActions.cardSetting.timesheet.update.asFunction(itemToUpdate);
    }

    _handleDeleteTimeSheet = (item, e) =>
    {
        e.preventDefault();
        KanbanActions.cardSetting.timesheet.delete.asFunction(item);
    }

    _handleAskDeleteConfirmation = (item, e) =>
    {
        e.preventDefault();
        this.setImmutableState({isAskingDeleteConfirmation: item});
    }

    _handleDeleteCancel = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isAskingDeleteConfirmation: null});
    }

    _renderTimeSheet()
    {
        const {timeSheet, isAskingDeleteConfirmation} = this.state.data;
        const that = this;
        const {formatMessage} = this.props.intl;
        if (FunctionHelper.isArrayNullOrEmpty(timeSheet))
        {
            return (
                <tr><td colSpan="8">{formatMessage(messages.emptyTimeSheet)}</td></tr>
            );
        }

        let itemsToRender = timeSheet.map((item, index) =>
        {
            if (FunctionHelper.isUndefined(item.user))
            {
                return (null);
            }
            const userEntity = new UserEntity(item.user);
            return (
                <tr key={`tp-card-start_${item.card}-${userEntity.id}-${index}`} className="">
                    <td><Avatar isToShowBackGroundColor hostStyle={{width: null, height: null, display: 'inline-block', border: '1px solid black', padding: '3px', marginRight: '10px', marginTop: '2px', borderRadius: '3px'}} key={item.user._id} title={`${userEntity.fullname}`} style={{width: '18px', height: '18px', display: 'inline-block', fontSize: '12px'}} avatar={userEntity.avatar} />{userEntity.nickname}</td>
                    <td><DateInput value={item.startDate} change={this._handleChangeData.bind(that, item)} propName="startDate" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                    <td><MinutesInput value={item.minutes} change={this._handleChangeData.bind(that, item)} propName="minutes" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                    <td><DateTimeInput lessOrEqualThan={item.trackerEndDate} value={item.trackerStartDate} change={this._handleChangeData.bind(that, item)} propName="trackerStartDate" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                    <td><DateTimeInput requireBeforeValue greaterOrEqualThan={item.trackerStartDate} value={item.trackerEndDate} change={this._handleChangeData.bind(that, item)} propName="trackerEndDate" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                    <td>{FunctionHelper.formatIntervalToDayHourAndMinutes(item.trackerStartDate, item.trackerEndDate)}</td>
                    <td><MinutesInput value={item.trackerMinutes} change={this._handleChangeData.bind(that, item)} propName="trackerMinutes" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" /></td>
                    {
                        isAskingDeleteConfirmation !== item &&
                            <td style={{maxWidth: '100px'}}><Button onClick={this._handleAskDeleteConfirmation.bind(that, item)} className="tiny negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button></td>
                    }
                    {
                        isAskingDeleteConfirmation === item &&
                            <td style={{maxWidth: '100px'}}>
                                <Button onClick={this._handleDeleteTimeSheet.bind(that, item)} className="mini negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button>
                                <Button key onClick={that._handleDeleteCancel} className="mini cancel" style={{padding: '7px'}}><FaIcon className="fa-times-circle-o fa-1x" style={{marginRight: '5px'}} /><FormattedMessage {...messages.cancelButton} /></Button>
                            </td>
                    }
                </tr>);
        });
        return itemsToRender;
    }

    render()
    {
        const {isLoading, actionMessage} = this.state.data;
        const {formatMessage} = this.props.intl;
        if (FunctionHelper.isUndefined(this.props.card._id))
        {
            return (<InformationOnlyAfterCardIsCreated/>);
        }
        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Description style={{marginLeft: '5px', width: '100%'}}>
                    <div style={{display: 'block', height: '600px', overflowY: 'scroll', overflowX: 'hidden', fontSize: '12px'}}>
                        <table className="ui striped compact large structured center aligned table k-card-timesheet-list-edit">
                            <thead>
                                <tr>
                                    <th rowSpan="2">{formatMessage(messages.memberLabel)}</th>
                                    <th rowSpan="2">{formatMessage(messages.startDateLabel)}</th>
                                    <th rowSpan="2">{formatMessage(messages.hoursLabel)}</th>
                                    <th colSpan="4">{formatMessage(messages.automaticTimeSheetLabel)}</th>
                                    <th rowSpan="2"></th>
                                </tr>
                                <tr>
                                    <th>{formatMessage(messages.startLabel)}</th>
                                    <th>{formatMessage(messages.endLabel)}</th>
                                    <th>{formatMessage(messages.automaticHoursLabel)}</th>
                                    <th>{formatMessage(messages.hoursLabel)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this._renderTimeSheet()}
                            </tbody>
                        </table>
                    </div>
                </Description>
            </div>
        );
    }
}

module.exports = injectIntl(TimeSheetTab, {withRef: true});
