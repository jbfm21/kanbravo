import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';
import {Grid, Progress, Column, Header, Segment} from 'react-semantify';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FaIcon, Button, Content, FormToast, TextInput} from '../../../../components';
import {FunctionHelper} from '../../../../commons';

import {default as TaskItem} from './TaskItem.jsx';
import {TaskListEntity} from '../../../../entities';

import {default as TaskStore} from './TaskStore';
import {default as ComboField} from '../components/ComboField.jsx';

//TODO: implementar shouldUpdate e intercionalizar

const messages = defineMessages(
{
    newTaskPlaceHolder: {id: 'modal.cardForm.taskTab.newTask.placeHolder', description: 'New Task TextArea PlaceHolder', defaultMessage: 'Quais tarefas que precisam ser realizada para completar esse item de trabalho?'},
    addButton: {id: 'modal.cardForm.taskTab.taskTab.addButtom', description: 'Add new task button', defaultMessage: 'Criar'},
    selectTaskType: {id: 'modal.cardForm.taskTab.selectTaskType', description: '', defaultMessage: 'Para incluir uma tarefa é necessário selecionar um tipo de tarefa.'},
    addNewTaskTitle: {id: 'modal.cardForm.taskTab.addNewTaskTitle', description: '', defaultMessage: 'Cadastre uma nova Tarefa:'},
    selectPlaceHolder: {id: 'modal.cardForm.selectPlaceHolder', description: '', defaultMessage: 'Selecionar'},
    taskListTitle: {id: 'modal.cardForm.taskTab.taskListTitle', description: '', defaultMessage: 'Tarefas cadastradas'},
    taskType: {id: 'modal.cardForm.taskTab.taskType', description: '', defaultMessage: 'Tipo'},
    taskDescription: {id: 'modal.cardForm.taskTab.taskDescription', description: '', defaultMessage: 'Descrição'},
    saveTaskTip: {id: 'modal.cardForm.taskTab.saveTaskTip', description: '', defaultMessage: '(atalho: cntrl+enter para incluir tarefa )'}
});

var StateRecord = Immutable.Record({newTaskType: null, isLoading: false, tasks: [], actionMessage: null});

@ImmutableState
@airflux.FluxComponent
class TaskTab extends Component
{
    static displayName = 'TaskTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(TaskStore, this._listenToTaskStore);
       this.state = {data: new StateRecord()};
    }

    componentDidUpdate()
    {
        let {tasks} = this.state.data;
        let taskListEntity = new TaskListEntity(tasks);
        let numberOfCompletedTasks = taskListEntity.getNumberOfCompletedTasks();
        let numberOfTasks = taskListEntity.getTotalTasks();
        if (taskListEntity.haveTasks())
        {
            let progressText = (numberOfCompletedTasks > 0) ? {ratio: '{value} de {total} ({percent}%)'} : {ratio: ''};
            window.$('.ui.taskProgress.progress').progress({showActivity: false, value: numberOfCompletedTasks, total: numberOfTasks, label: 'ratio', text: progressText}); //eslint-disable-line
        }
    }

    _listenToTaskStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.task.list.progressed:
            case KanbanActions.cardSetting.task.add.progressed:
            case KanbanActions.cardSetting.task.update.progressed:
            case KanbanActions.cardSetting.task.delete.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.task.list.failed:
            case KanbanActions.cardSetting.task.add.failed:
            case KanbanActions.cardSetting.task.update.failed:
            case KanbanActions.cardSetting.task.delete.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardSetting.task.list.completed:
                this.setImmutableState({isLoading: false, tasks: store.state.tasks});
                break;

            case KanbanActions.cardSetting.task.add.completed:
            {
                let {taskItem} = store.state;
                let {tasks} = this.state.data;
                let match = _.find(tasks, {_id: taskItem._id});
                if (!match)
                {
                    tasks.unshift(taskItem);
                }
                this.setImmutableState({tasks: tasks, isLoading: false});
                this.taskTitleTextArea.setValue('');
                this.taskTitleTextArea.focus();
                break;
            }

            case KanbanActions.cardSetting.task.update.completed:
            {
                let {taskItem} = store.state;
                let {tasks} = this.state.data;
                let match = _.find(tasks, {_id: taskItem._id});
                if (match)
                {
                    _.merge(match, taskItem);

                }
                this.setImmutableState({tasks: tasks, isLoading: false});
                break;
            }

            case KanbanActions.cardSetting.task.delete.completed:
            {
                let {taskItemId} = store.state;
                let {tasks} = this.state.data;
                _.remove(tasks, {_id: taskItemId});
                this.setImmutableState({tasks: tasks, isLoading: false});
                break;
            }

           default: break;
        }
    }

    _handleAddTask = (e) =>
    {
        e.preventDefault();
        const {card} = this.props;
        const {newTaskType} = this.state.data;
        const newTaskTitle = this.taskTitleTextArea.getValue().trim();
        const {formatMessage} = this.props.intl;
        if (!newTaskType)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.selectTaskType)});
            return;
		}
        const task = {board: card.board, card: card._id, type: newTaskType, title: newTaskTitle.trim()};
        KanbanActions.cardSetting.task.add.asFunction(card, task);
    }

    _handleSelectedTaskTypeItem = (fieldName, selectedItem) =>
    {
        this.setImmutableState({newTaskType: selectedItem});
        this.forceUpdate();
    }

    _handleDelete = (task, e) => //eslint-disable-line
    {
        e.preventDefault();
        KanbanActions.cardSetting.task.delete.asFunction(task);
	}

    _handleSave = (taskToSave) => //eslint-disable-line
    {
        KanbanActions.cardSetting.task.update.asFunction(taskToSave);
        this.setImmutableState({isLoading: true});
	}

    render()
    {
        const {card} = this.props;
        const {tasks, newTaskType, isLoading, actionMessage} = this.state.data;
        const taskListEntity = new TaskListEntity(tasks);
        const isToShowProgressBar = taskListEntity.haveTasks();

        const {formatMessage} = this.props.intl;
        const newTaskPlaceHolder = formatMessage(messages.newTaskPlaceHolder);
        let taskItems = tasks.map(function (task, i)
        {
            return (
                <TaskItem key={`${task._id}_${task.nonce}`}
                    task={task} index={i}
                    onDelete={this._handleDelete.bind(this, task)}
                    onSave={this._handleSave.bind(this)}/>
            );
        }, this);

        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="red">
                    <Content className="k-new-setting">
                        <div style={{display: 'inline-flex'}}>
                            <ComboField
                                fieldName="type"
                                label={formatMessage(messages.addNewTaskTitle)}
                                getSuggestionFunc={KanbanActions.boardSetting.taskType.search}
                                selectedItem={newTaskType}
                                onSelectItem={this._handleSelectedTaskTypeItem}
                                boardId={card.board}
                                placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                            <Button
                                onClick={this._handleAddTask}
                                className="tiny positive"
                                style={{marginLeft: '10px', position: 'relative', top: '23px', height: '30px'}}>
                                    <FaIcon className="fa-plus fa-1x"/>
                                    <FormattedMessage {...messages.addButton} />
                            </Button>
                        </div>
                        <TextInput
                            ref={(ref) => {this.taskTitleTextArea = ref; return;}}
                            style={{minHeight: '60px', height: '60px', maxHeight: '120px'}}
                            maxLength="1000"
                            submitKeyFunction={FunctionHelper.isCntrlEnterKeyPressed}
                            placeholder={newTaskPlaceHolder}
                            onChangeData={this._handleAddTask}
                            autoFocus={true}/>
                        <div style={{fontSize: '10px', color: 'gray'}}>
                            <FormattedMessage {...messages.saveTaskTip}/>
                        </div>
                    </Content>
                </Segment>
                <Segment className="blue">
                    {
                        isToShowProgressBar &&
                            <Progress className="indicating taskProgress" style={{height: '13px', marginBottom: '5px'}}>
                                <div className="bar" style={{height: '13px'}}><div className="progress" style={{height: '13px'}}></div></div>
                            </Progress>
                    }
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/>
                        <Content>
                            <FormattedMessage {...messages.taskListTitle}/>
                        </Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        <ul className="k-card-list-edit">
                            <li className={'listHeader'}>
                                <Grid style={{width: '100%'}}>
                                    <Column style={{width: '1%', lineHeight: 2}}></Column>
                                    <Column style={{width: '3%'}}></Column>
                                    <Column className="two wide"><FormattedMessage {...messages.taskType}/></Column>
                                    <Column className="nine wide "><FormattedMessage {...messages.taskDescription}/></Column>
                                    <Column style={{width: '8%'}}></Column>
                                </Grid>
                            </li>
                            {taskItems}
                        </ul>
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(TaskTab, {withRef: true});

