import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {FaIcon, Content, DateTimeInput, Button} from '../../../../components';

//TODO: Implementar adição e remoção

const messages = defineMessages(
{
    path: {id: 'modal.cardForm.cardMovementTab.startDate', description: '', defaultMessage: 'Raia'},
    startDate: {id: 'modal.cardForm.cardMovementTab.startDate', description: '', defaultMessage: 'Data'},
    laneType: {id: 'modal.cardForm.cardMovementTab.startDate', description: '', defaultMessage: 'Tipo da Raia'},
    activity: {id: 'modal.cardForm.cardMovementTab.startDate', description: '', defaultMessage: 'Atividade'},
    delete: {id: 'modal.cardForm.timesheetTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    cancelButton: {id: 'modal.cardForm.timesheetTab.cancel.label', description: '', defaultMessage: 'Cancelar'}
});

var StateRecord = Immutable.Record({isAskingDeleteConfirmation: null});

@ImmutableState
@airflux.FluxComponent
class CardMovementEdit extends Component
{
    static displayName = 'CardMovementEdit';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        cardMovementHistory: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.state = {data: new StateRecord()};
    }

    _handleCollapse = (node) =>
    {
        node.showChildren = !node.showChildren;
        this.forceUpdate();
    }

    _handleChangeData = (item, newData) =>
    {
       const itemToUpdate = FunctionHelper.cloneAndAssign(item, newData);
       this.props.onSave(itemToUpdate);
    }

    _handleAskDeleteConfirmation = (item, e) =>
    {
        e.preventDefault();
        this.setImmutableState({isAskingDeleteConfirmation: item});
    };

    _handleDelete = (item, e) =>
    {
        e.preventDefault();
        this.props.onDelete(item);
    }

    _handleDeleteCancel = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isAskingDeleteConfirmation: null});
    }

    render()
    {
        const {isAskingDeleteConfirmation} = this.state.data;
        let {cardMovementHistory} = this.props;
        let that = this;
        let itemsToRender = [];
        if (FunctionHelper.isDefined(cardMovementHistory))
        {
            itemsToRender = cardMovementHistory.movements.map((item, index) =>
            {
                let lessOrEqualThan = null;
                let greaterOrEqualThan = null;
                if (index > 0) { greaterOrEqualThan = cardMovementHistory.movements[index - 1].startDate;}
                if (index < (cardMovementHistory.movements.length - 1)) {lessOrEqualThan = cardMovementHistory.movements[index + 1].startDate;}
                return (
                    <tr key={`nodeItem_${item._id}`}>
                        <td className="left aligned title tableData">
                            {item.path.replace('/root/', '')}
                        </td>
                        <td className="center aligned" style={{padding: '0px', margin: '0px', whiteSpace: 'nowrap', cursor: 'pointer'}}>
                            <DateTimeInput lessOrEqualThan={lessOrEqualThan} greaterOrEqualThan={greaterOrEqualThan} value={item.startDate} change={this._handleChangeData.bind(that, item)} propName="startDate" classisLoading="isLoading" classInvalid="k-inlineEdit invalid" />
                        </td>
                        <td className="center aligned">{item.laneType}</td>
                        <td className="center aligned">{item.activity}</td>

                        {
                            isAskingDeleteConfirmation !== item &&
                                <td style={{maxWidth: '100px'}}><Button onClick={this._handleAskDeleteConfirmation.bind(that, item)} className="tiny negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button></td>
                        }
                        {
                            isAskingDeleteConfirmation === item &&
                                <td style={{maxWidth: '100px'}}>
                                    <Button onClick={this._handleDelete.bind(that, item)} className="mini negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button>
                                    <Button key onClick={that._handleDeleteCancel} className="mini cancel" style={{padding: '7px'}}><FaIcon className="fa-times-circle-o fa-1x" style={{marginRight: '5px'}} /><FormattedMessage {...messages.cancelButton} /></Button>
                                </td>
                        }

                    </tr>
                );
            });
        }
        return (
            <Content className="k-edit-setting k-text withScrollBar" style={{maxHeight: '500px'}}>
                <table className="ui celled structured compact table movementTable k-card-timesheet-list-edit">
                    <thead className="center aligned">
                        <tr>
                            <th style={{width: '50%'}}className="title tableData"><FormattedMessage {...messages.path}/></th>
                            <th className="date tableData"><FormattedMessage {...messages.startDate}/></th>
                            <th className="date tableData"><FormattedMessage {...messages.laneType}/></th>
                            <th className="textDate tableData"><FormattedMessage {...messages.activity}/></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        itemsToRender.map((item) => item)
                    }
                    </tbody>
                </table>
            </Content>
        );
    }
}

module.exports = injectIntl(CardMovementEdit, {withRef: true});


