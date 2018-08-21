'use strict';

import _ from 'lodash';

import {FunctionHelper} from '../commons';


class TaskListEntity
{
    constructor (taskList)
    {
        this._taskList = taskList;
    }

    haveTasks()
    {
        return (FunctionHelper.isDefined(this._taskList)) && (this._taskList.length > 0);
    }

    getNumberOfCompletedTasks()
    {
        if (FunctionHelper.isUndefined(this._taskList))
        {
            return 0;
        }
        let taskStatusStatistics = _.countBy(this._taskList, 'completed');
        return taskStatusStatistics['true'] || 0; //eslint-disable-line
    }

    getNumberOfUnfinishedTasks()
    {
        if (FunctionHelper.isUndefined(this._taskList))
        {
            return 0;
        }
        let taskStatusStatistics = _.countBy(this._taskList, 'completed');
        return taskStatusStatistics['false'] || 0; //eslint-disable-line
    }

    getTotalTasks()
    {
        if (FunctionHelper.isUndefined(this._taskList))
        {
            return 0;
        }
        return this._taskList.length;
    }
}

module.exports = TaskListEntity;
