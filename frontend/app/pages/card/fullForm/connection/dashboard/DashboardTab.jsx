import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import classNames from 'classNames';
import * as airflux from 'airflux';
import _ from 'lodash';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Segment, Content, Button, Grid, Column} from 'react-semantify';

import {ImmutableState} from '../../../../../decorators';
import {StaticComboField, Buttons, BasicProgress, ProgressBar, Float} from '../../../../../components';
import {FunctionHelper} from '../../../../../commons';

import {EmptyConnection, StatisticManager} from '../components/';

import {default as GanttBar} from './gantt/GanttBar.jsx';
import {default as ResumeTab} from './resume/ResumeTab.jsx';
import {default as DetailTab} from './detail/DetailTab.jsx';
import {default as CardListTab} from './cardlist/CardListTab.jsx';

//TODO: implementar shouldUpdate e intercionalizar

const messages = defineMessages(
{
    selectBoardComboboxAllBoardOption: {id: 'modal.cardForm.dashboardTab.dashboardTab.selectBoardComboboxAllBoardOption', description: '', defaultMessage: 'Todos os quadros'},
    legend: {id: 'modal.cardForm.dashboardTab.dashboardTab.legend', description: '', defaultMessage: 'Legenda'},
    resumeTabTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.resumeTabTitle', description: '', defaultMessage: 'Resumo'},
    detailTabTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.detailTabTitle', description: '', defaultMessage: 'Detalhe'},
    ganttTabTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.ganttTabTitle', description: '', defaultMessage: 'Gantt'},
    cardsTabTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.cardsTabTitle', description: '', defaultMessage: 'Cartões'},
    notStartedTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.notStartedTitle', description: '', defaultMessage: 'não iniciado'},
    startedTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.startedTitle', description: '', defaultMessage: 'em execução'},
    finishedTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.finishedTitle', description: '', defaultMessage: 'finalizado'},
    notDefinedTitle: {id: 'modal.cardForm.dashboardTab.dashboardTab.notDefinedTitle', description: '', defaultMessage: 'não definido'}
});

const tabs = {resume: 'resume', detail: 'detail', gantt: 'gantt', cards: 'cards'};

var StateRecord = Immutable.Record({selectedBoardId: '', selectedTab: tabs.resume});

@ImmutableState
@airflux.FluxComponent
class DashboardTab extends Component
{
    static displayName = 'DashboardTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        connections: PropTypes.any.isRequired,
        reminders: PropTypes.any.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.state = {data: new StateRecord()};
    }

    _handleChangeSelectedBoard = (newData) =>
    {
        this.setImmutableState({selectedBoardId: newData.value});
    }

    _handleChangeTab = (tab, e) =>
    {
        e.preventDefault();
        this.setImmutableState({selectedTab: tab});
    }

    _getBoardDropDownSuggestions = () =>
    {
        const {formatMessage} = this.props.intl;
        const {connections} = this.props;
        if (FunctionHelper.isArrayNullOrEmpty(connections))
        {
            return [{label: formatMessage(messages.selectBoardComboboxAllBoardOption), value: ''}];
        }
        let suggestions = _(connections).map((item) => {return {value: item.board._id, label: item.board.title};}).uniqBy('value').value();
        suggestions.unshift({label: formatMessage(messages.selectBoardComboboxAllBoardOption), value: ''});
        return suggestions;
    }

    _getConnectionsToShow = () =>
    {
        let {connections} = this.props;
        const {selectedBoardId} = this.state.data;
        if (FunctionHelper.isNullOrEmpty(selectedBoardId))
        {
            return connections;
        }
        return _(connections).filter({board: {_id: selectedBoardId}}).value();
    }

    _renderTabContent = () =>
    {
        let connections = this._getConnectionsToShow();
        let statisticManager = new StatisticManager(this.props.card, connections);
        let tabToRender = null;
        switch (this.state.data.selectedTab)
        {
            case tabs.gantt: tabToRender = <GanttBar card={this.props.card} reminders={this.props.reminders} connectedCards={connections} statisticManager={statisticManager}/>; break;
            case tabs.cards: tabToRender = <CardListTab card={this.props.card} statisticManager={statisticManager} connectedCards={connections}/>; break;
            case tabs.resume: tabToRender = <ResumeTab card={this.props.card} statisticManager={statisticManager}/>; break;
            case tabs.detail: tabToRender = <DetailTab card={this.props.card} statisticManager={statisticManager}/>; break;
            default: break;
        }
        if (tabToRender === null)
        {
            return null;
        }
        return (
            <Content className="k-edit-setting k-text withScrollBar" style={{height: '450px', overflowX: 'hidden'}}>
                {tabToRender}
            </Content>
        );
    }

    render()
    {
        const {connections} = this.props;
        const {selectedBoardId, selectedTab} = this.state.data; //eslint-disable-line
        const {formatMessage} = this.props.intl;
        if (FunctionHelper.isArrayNullOrEmpty(connections))
        {
            return (<EmptyConnection/>);
        }
        return (
            <div style={{marginTop: '10px'}}>
                <Segment style={{marginTop: '0px', backgroundColor: 'rgb(245,245,245)', border: '0px', borderRadius: '0px'}}>
                    <Content style={{marginBottom: '5px', display: 'flex'}}>
                         <Grid className="three column" style={{width: '100%'}}>
                            <Column className="">
                                <Buttons className="blue compact mini">
                                    <Button className={classNames({active: selectedTab === tabs.resume})} onClick={this._handleChangeTab.bind(this, tabs.resume)}><FormattedMessage {...messages.resumeTabTitle} /></Button>
                                    <Button className={classNames({active: selectedTab === tabs.detail})} onClick={this._handleChangeTab.bind(this, tabs.detail)}><FormattedMessage {...messages.detailTabTitle} /></Button>
                                    <Button className={classNames({active: selectedTab === tabs.gantt})} onClick={this._handleChangeTab.bind(this, tabs.gantt)}><FormattedMessage {...messages.ganttTabTitle} /></Button>
                                    <Button className={classNames({active: selectedTab === tabs.cards})} onClick={this._handleChangeTab.bind(this, tabs.cards)}><FormattedMessage {...messages.cardsTabTitle} /></Button>
                                </Buttons>
                            </Column>
                            <Column className="" style={{display: 'flex'}}>
                                <FormattedMessage {...messages.legend} />
                                <BasicProgress style={{width: '350px', height: '17px', padding: '0px', margin: '0px', borderRadius: '0px', fontSize: '11px'}}>
                                    <ProgressBar className="progress-bar-finished" show="labelOnly" label={formatMessage(messages.finishedTitle)} percent="25" style={{fontSize: 'inherit'}}/>
                                    <ProgressBar className="progress-bar-started" show="labelOnly" label={formatMessage(messages.startedTitle)} percent="25" style={{fontSize: 'inherit'}}/>
                                    <ProgressBar className="progress-bar-notStarted" show="labelOnly" label={formatMessage(messages.notStartedTitle)} percent="25" style={{fontSize: 'inherit'}}/>
                                    <ProgressBar className="progress-bar-notDetailed" show="labelOnly" label={formatMessage(messages.notDefinedTitle)} percent="25" style={{fontSize: 'inherit'}}/>
                                </BasicProgress>
                            </Column>
                            <Column>
                                <Float className="smallSelect" style={{float: 'right'}}>
                                    <StaticComboField
                                        initialValue={selectedBoardId}
                                        propName="value"
                                        showValueInLabelIfDistinct={false}
                                        onChangeData={this._handleChangeSelectedBoard}
                                        getSuggestions={this._getBoardDropDownSuggestions}
                                    />
                                </Float>
                            </Column>
                        </Grid>
                    </Content>
                    <Content className="k-edit-setting k-text withScrollBar" style={{minHeight: '400px', overflowX: 'hidden'}}>
                        {this._renderTabContent()}
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(DashboardTab, {withRef: true});
