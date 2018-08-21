//TODO: Intercionalizar
import React, {Component, PropTypes} from 'react';
import {Grid, Column} from 'react-semantify';
import Immutable from 'immutable';
import classNames from 'classNames';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {FaIcon, Button, Avatar, DateTimeInput, TextAreaInput} from '../../../../components';
import {FunctionHelper} from '../../../../commons';

const messages = defineMessages(
{
    delete: {id: 'modal.cardForm.impedimentTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    cancelButton: {id: 'modal.cardForm.impedimentTab.cancel.label', description: '', defaultMessage: 'Cancelar'},
    impedimentTypePlaceHolder: {id: 'modal.cardForm.impedimentTab.impedimentTypePlaceHolder', description: '', defaultMessage: 'Motivo do impedimento!'}
});

var StateRecord = Immutable.Record({isAskingDeleteConfirmation: false});

@ImmutableState
class ImpedimentItem extends Component
{
    static displayName = 'ImpedimentItem';

    static propTypes =
    {
        impediment: PropTypes.object.isRequired,
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
        const {impediment} = this.props;
        const {formatMessage} = this.props.intl;
        const className = classNames({active: FunctionHelper.isNullOrEmpty(impediment.endDate)});
        const startEndPeriod = FunctionHelper.fromDateOrNow(impediment.startDate, impediment.endDate);
        return (
            <li className={className}>
                <Grid style={{width: '100%'}} >
                    <Column className="one wide" >
                        {FunctionHelper.isDefined(impediment.type) &&
                            <div className={'centeredContainer'} style={{width: '24px', height: '24px'}}>
                                <Avatar isToShowBackGroundColor
                                    avatar={impediment.type.avatar}
                                    isToShowBorder
                                    isToShowSmallBorder
                                    isSquareImageDimension
                                    style={{width: '20px', padding: '0px'}}
                                    hostStyle={{width: null, height: null, display: 'inline-flex'}}/>
                            </div>
                        }
                    </Column>
                    <Column className="four wide">
                        <TextAreaInput
                            value={impediment.reason}
                            shouldFinishEditOnEnter={false}
                            change={this._handleChangeData.bind(this, impediment)}
                            propName="reason"
                            placeHolder={formatMessage(messages.impedimentTypePlaceHolder)}
                            normalStyle={{minHeight: '31px', width: '100%', cursor: 'pointer', border: '1px solid transparent', backgroundColor: 'transparent', margin: '0px', padding: '0px'}}
                            style={{minHeight: '60px', height: '100px', maxHeight: '200px'}}
                            maxLength="1000"
                            classLoading="loading"
                            classInvalid="k-inlineEdit invalid" />
                    </Column>
                    <Column className="three wide" >
                        <DateTimeInput
                            value={impediment.startDate}
                            change={this._handleChangeData.bind(this, impediment)}
                            propName="startDate"
                            lessOrEqualThan={impediment.endDate}
                            classLoading="loading"
                            classInvalid="k-inlineEdit invalid" />
                    </Column>
                    <Column className="three wide" >
                        <DateTimeInput
                            value={impediment.endDate}
                            change={this._handleChangeData.bind(this, impediment)}
                            propName="endDate"
                            requireBeforeValue
                            greaterOrEqualThan={impediment.startDate}
                            required={false}
                            placeHolder={'--/--/-- --:--'}
                            classLoading="loading" classInvalid="k-inlineEdit invalid" />
                    </Column>
                    <Column className="two wide" style={{textAlign: 'center'}} >
                        {startEndPeriod}
                    </Column>
                    <Column style={{width: '8%', display: 'inline-flex'}}>
                        {this._renderActionButton()}
                    </Column>
                </Grid>
            </li>
        );
    }
}

module.exports = injectIntl(ImpedimentItem);
