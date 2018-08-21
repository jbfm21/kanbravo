import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import classNames from 'classNames';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Menu, Item} from 'react-semantify';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FormToast} from '../../../../components';


import {default as ConnectionStore} from './ConnectionStore';
import {default as ConnectNewCardStore} from './connectNew/ConnectNewCardStore';
import {default as DashboardTab} from './dashboard/DashboardTab.jsx';
import {default as ConnectCardTab} from './connect/ConnectCardTab.jsx';
import {default as ConnectNewCardTab} from './connectNew/ConnectNewCardTab.jsx';
import {default as ParametersTab} from './parameters/ParametersTab.jsx';

import {default as ManageConnectionTab} from './manage/ManageConnectionTab.jsx';

//TODO: implementar shouldUpdate e intercionalizar

const messages = defineMessages(
{
    dashboardMenuItem: {id: 'modal.cardForm.connectionTab.menu.dashboard', description: '', defaultMessage: 'Dashboard'},
    connectCardMenuItem: {id: 'modal.cardForm.connectionTab.menu.connectCard', description: '', defaultMessage: 'Conectar cartões existentes'},
    connectNewCardMenuItem: {id: 'modal.cardForm.connectionTab.menu.connectCard', description: '', defaultMessage: 'Conectar novos cartões'},
    manageConnectiondMenuItem: {id: 'modal.cardForm.connectionTab.menu.manageConnection', description: '', defaultMessage: 'Gerenciar conexões'},
    parametersConnectiondMenuItem: {id: 'modal.cardForm.connectionTab.menu.manageConnection', description: '', defaultMessage: 'Parâmetros'}
});

var StateRecord = Immutable.Record({isLoadingConnection: false, isLoadingReminder: false, actionMessage: '', selectedTab: 'dashboard', connections: [], reminders: []});

@ImmutableState
@airflux.FluxComponent
class ConnectionTab extends Component
{
    static displayName = 'ConnectionTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        cardForm: PropTypes.object.isRequired,
        onChangeCardData: PropTypes.func.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ConnectionStore, this._listenToConnectionStore);
       this.listenTo(ConnectNewCardStore, this._listenToConnectNewCardStore);
       this.state = {data: new StateRecord()};
    }


    _listenToConnectNewCardStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardConnection.addInFirstLeafLane.completed:
            case KanbanActions.cardConnection.addInBacklog.completed:
            {
                let connections = this.state.data.connections;
                connections.push(store.state.card.savedCard);
                this.setImmutableState({connections: connections});
                break;
            }
            default: break;
        }
    }
    _listenToConnectionStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.card.getChildrenConnection.progressed:
                this.setImmutableState({isLoadingConnection: true, actionMessage: '', connections: []});
                break;

            case KanbanActions.card.getChildrenConnection.failed:
                this.setImmutableState({isLoadingConnection: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.card.getChildrenConnection.completed:
                this.setImmutableState({isLoadingConnection: false, connections: store.state.connections});
                break;

            case KanbanActions.cardSetting.reminder.list.progressed:
                this.setImmutableState({isLoadingReminder: true, actionMessage: '', reminders: []});
                break;

            case KanbanActions.cardSetting.reminder.list.failed:
                this.setImmutableState({isLoadingReminder: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardSetting.reminder.list.completed:
                this.setImmutableState({isLoadingReminder: false, reminders: store.state.reminders});
                break;

           default: break;
        }
    }

    _handleShowDashboardTab = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: 'dashboard'});
    }

    _handleShowConnectCardTab= (e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: 'connectCard'});
    }

    _handleShowManageConnectionTab = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: 'manageConnection'});
    }

    _handleShowConnectNewCardTab = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: 'connectNewCard'});
    }

    _handleShowParametersTab = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: 'parameters'});
    }

    _renderTab = () =>
    {
        let {card, cardForm, onChangeCardData} = this.props;
        const {selectedTab, connections, reminders} = this.state.data; //eslint-disable-line
        switch (selectedTab)
        {
            case 'dashboard': return <DashboardTab card={card} reminders={reminders} connections={connections}/>;
            case 'manageConnection': return <ManageConnectionTab card={card} cardForm={cardForm} onChangeCardData={onChangeCardData} connections={connections} />;
            case 'connectCard': return <ConnectCardTab card={card} connections={connections}/>;
            case 'connectNewCard': return <ConnectNewCardTab parentCard={card} connections={connections} />;
            case 'parameters': return <ParametersTab onChangeCardData={onChangeCardData} card={card} connections={connections} />;
            default: return null;
        }
    }

    render()
    {
        const {card} = this.props; //eslint-disable-line
        const {connections, isLoadingConnection,isLoadingReminder, actionMessage, selectedTab} = this.state.data; //eslint-disable-line
        const isLoading = isLoadingConnection || isLoadingReminder;

        if (isLoading)
        {
            return (
                <div style={{marginTop: '10px'}}>
                    <Loader loaded={!isLoading} />
                </div>
            );
        }

        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <Menu className="secondary pointing" style={{fontSize: '12px'}}>
                    <Item style={{cursor: 'pointer'}} className={classNames({active: selectedTab === 'dashboard'})} onClick={this._handleShowDashboardTab}><FormattedMessage {...messages.dashboardMenuItem}/></Item>
                    <Item style={{cursor: 'pointer'}} className={classNames({active: selectedTab === 'manageConnection'})} onClick={this._handleShowManageConnectionTab}><FormattedMessage {...messages.manageConnectiondMenuItem}/></Item>
                    <Item style={{cursor: 'pointer'}} className={classNames({active: selectedTab === 'connectCard'})} onClick={this._handleShowConnectCardTab}><FormattedMessage {...messages.connectCardMenuItem}/></Item>
                    <Item style={{cursor: 'pointer'}} className={classNames({active: selectedTab === 'connectNewCard'})} onClick={this._handleShowConnectNewCardTab}><FormattedMessage {...messages.connectNewCardMenuItem}/></Item>
                    <Item style={{cursor: 'pointer'}} className={classNames({active: selectedTab === 'parameters'})} onClick={this._handleShowParametersTab}><FormattedMessage {...messages.parametersConnectiondMenuItem}/></Item>
                </Menu>
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                {this._renderTab()}
            </div>
        );
    }
}

module.exports = injectIntl(ConnectionTab, {withRef: true});
