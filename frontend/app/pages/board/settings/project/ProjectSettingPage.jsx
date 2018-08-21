import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage} from '../base';
import {default as ProjectSettingStore} from './ProjectSettingStore.jsx';
import {default as ProjectSettingItem} from './ProjectSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'projectSetting.title', description: 'Project Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'projectSetting.subtitle', description: 'Project Setting subtitle', defaultMessage: 'Cadastre os projetos a serem associados aos itens de trabalho, agrupando-os de acordo com o portifólio da organização.'},
    attention: {id: 'projectSetting.attention', description: 'Project Setting attention', defaultMessage: 'ATENÇÃO: Configure uma cor de fundo no avatar, para que esta cor apareça destacada nos cartões associados a um projeto (em breve você poderá customizar o layout do cartão)'},
    addFormTitle: {id: 'projectSetting.addForm.title', description: 'Project Setting add form title', defaultMessage: 'Criar novo projeto'},
    listTitle: {id: 'projectSetting.list.title', description: 'Project Setting list title', defaultMessage: 'Projetos cadastrados'}
});

class ProjectSettingPage extends ListPage
{
    static displayName = 'ProjectSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, ProjectSettingPage.displayName, ProjectSettingStore, messages, ProjectSettingItem, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(ProjectSettingPage);
