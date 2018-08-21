//TODO: Internacionalizar
import React, {Component, PropTypes} from 'react';
import * as airflux from 'airflux';
import {Label} from 'react-semantify';
import Immutable from 'immutable';
import _ from 'lodash';

import {KanbanActions} from '../../../../actions';
import {TaskListEntity} from '../../../../entities';
import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {default as TaskStore} from './TaskStore';

var StateRecord = Immutable.Record({tasks: []});

@ImmutableState
@airflux.FluxComponent
class TaskStatisticLabel extends Component
{
    static displayName = 'TaskStatisticLabel';

    static propTypes =
    {
        card: PropTypes.object.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(TaskStore, this._listenToTaskStore);
        this.state = {data: new StateRecord()};
    }

    _listenToTaskStore = (store) =>
    {
        switch (store.actionState)
        {

            case KanbanActions.cardSetting.task.list.completed:
                this.setImmutableState({tasks: store.state.tasks});
                break;

            case KanbanActions.cardSetting.task.add.completed:
            {
                const {taskItem} = store.state;
                let {tasks} = this.state.data;
                tasks.unshift(taskItem);
                this.setImmutableState({tasks: tasks});
                break;
            }

            case KanbanActions.cardSetting.task.update.completed:
            {
                const {taskItem} = store.state;
                let {tasks} = this.state.data;
                let match = _.find(tasks, {_id: taskItem._id});
                if (match)
                {
                    _.merge(match, taskItem);

                }
                this.setImmutableState({tasks: tasks});
                break;
            }

            case KanbanActions.cardSetting.task.delete.completed:
            {
                const {taskItemId} = store.state;
                let {tasks} = this.state.data;
                _.remove(tasks, {_id: taskItemId});
                this.setImmutableState({tasks: tasks});
                break;
            }

           default: break;
        }
    }

    _getTaskStatisticLabel = () =>
    {
        let numberOfCompletedTasks = 0;
        let numberOfTasks = 0;

        if (FunctionHelper.isArrayNotEmpty(this.state.data.tasks))
        {
            let taskListEntity = new TaskListEntity(this.state.data.tasks);
            numberOfCompletedTasks = taskListEntity.getNumberOfCompletedTasks();
            numberOfTasks = taskListEntity.getTotalTasks();
        }
        else if (FunctionHelper.isDefined(this.props.card.taskStatistic))
        {
            numberOfCompletedTasks = this.props.card.taskStatistic.completed;
            numberOfTasks = this.props.card.taskStatistic.total;
        }

        if (numberOfTasks === 0)
        {
            return null;
        }

        return `${numberOfCompletedTasks} / ${numberOfTasks}`;
    }

    render()
    {
        let taskStatisticLabel = this._getTaskStatisticLabel();
        let style = FunctionHelper.isDefined(taskStatisticLabel) ? {fontSize: '10px'} : {display: 'none'};
        return (
            <Label className="blue" style={style}>{taskStatisticLabel}</Label>
        );
    }
}

module.exports = TaskStatisticLabel;
