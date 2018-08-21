import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as TaskTypeSetttingStore} from './TaskTypeSetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'taskType.title', description: 'TaskType Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'taskType.subtitle', description: 'TaskType Setting subtitle', defaultMessage: 'Cadastre os tipos de tarefas que poderão ser associadas aos itens de trabalho.'},
    addFormTitle: {id: 'taskType.addForm.title', description: 'TaskType Setting add form title', defaultMessage: 'Criar novo tipo de tarefa'},
    listTitle: {id: 'taskType.list.title', description: 'TaskType Setting list title', defaultMessage: 'Tipos de tarefas cadastrados'}
});

class TaskTypeSettingPage extends ListPage
{
    static displayName = 'TaskTypeSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, TaskTypeSettingPage.displayName, TaskTypeSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(TaskTypeSettingPage);
