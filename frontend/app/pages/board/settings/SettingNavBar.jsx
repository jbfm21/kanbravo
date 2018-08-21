import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';
import {Icon, Menu} from 'react-semantify';

import {NavLink} from '../../../components';

const messages = defineMessages(
{
    aging: {id: 'board.settings.navbar.aging', description: 'Aging Config', defaultMessage: 'Envelhecimento'},
    cardId: {id: 'board.settings.navbar.cardId', description: 'Card Id Config', defaultMessage: 'ID do Cartão'},
    classOfServices: {id: 'board.settings.navbar.classOfServices', description: 'Class of Services Config', defaultMessage: 'Classe de Serviço'},
    customFieldConfig: {id: 'board.settings.navbar.customFieldConfig', description: 'Custom Field Config', defaultMessage: 'Campos Customizados'},
    generalConfig: {id: 'board.settings.navbar.generalConfig', description: 'General Config', defaultMessage: 'Config. Geral'},
    impedimentTypes: {id: 'board.settings.navbar.impedimentTypes', description: 'ImpedimentTypes Config', defaultMessage: 'Tipos de Impedimentos'},
    importExportBoard: {id: 'board.settings.navbar.importExport', description: 'Import/Export Board', defaultMessage: 'Importar/Exportar'},
    itemSizes: {id: 'board.settings.navbar.itemSizes', description: 'Preferences config', defaultMessage: 'Tamanhos'},
    itemTypes: {id: 'board.settings.navbar.itemTypes', description: 'Item Types Config', defaultMessage: 'Tipos de Itens'},
    metrics: {id: 'board.settings.navbar.metrics', description: 'Preferences config', defaultMessage: 'Metricas'},
    permissions: {id: 'board.settings.navbar.permissions', description: 'Permissions Config', defaultMessage: 'Membros'},
    preferences: {id: 'board.settings.navbar.preferences', description: 'Preferences config', defaultMessage: 'Preferencias pessoais'},
    priorities: {id: 'board.settings.navbar.priorities', description: 'Priorities Config', defaultMessage: 'Prioridade'},
    projects: {id: 'board.settings.navbar.projects', description: 'Preferences config', defaultMessage: 'Projetos'},
    ratingTypes: {id: 'board.settings.navbar.ratingTypes', description: 'Aging Config', defaultMessage: 'Classificação'},
    tagCategories: {id: 'board.settings.navbar.tagCategories', description: 'Tags Categories Config', defaultMessage: 'Categorias de Tag'},
    tags: {id: 'board.settings.navbar.tags', description: 'Tags Config', defaultMessage: 'Tags'},
    taskTypes: {id: 'board.settings.navbar.taskTypes', description: 'TaskTypes Config', defaultMessage: 'Tipos de Tarefas'},
    trackerIntegration: {id: 'board.settings.navbar.trackerIntegration', description: 'TrackerIntegration Config', defaultMessage: 'Integrações'}
});

export default class SettingNavBar extends React.Component
{

    static displayName = 'SettingNavBar';

    static propTypes = {
        boardId: React.PropTypes.string
    };

    render()
    {
        let {boardId} = this.props;
        return (
            <Menu className="secondary vertical tabular pointing blue settingMenu">
                <NavLink to={`/boards/${boardId}/settings/generalConfig`} className="item"><Icon className="setting"/><FormattedMessage {...messages.generalConfig} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/permissions`} className="item"><Icon className="users"/><FormattedMessage {...messages.permissions} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/customFieldConfigs`} className="item"><Icon className="configure"/><FormattedMessage {...messages.customFieldConfig} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/tagCategories`} className="item"><Icon className="tags"/><FormattedMessage {...messages.tagCategories} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/tags`} className="item"><Icon className="tag"/><FormattedMessage {...messages.tags} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/classOfServices`} className="item"><Icon className="legal"/><FormattedMessage {...messages.classOfServices} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/ratingTypes`} className="item"><Icon className="empty star"/><FormattedMessage {...messages.ratingTypes} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/agings`} className="item"><Icon className="birthday"/><FormattedMessage {...messages.aging} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/cardIdConfigs`} className="item"><Icon className="payment"/><FormattedMessage {...messages.cardId} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/importExportBoard`} className="item"><Icon className="exchange"/><FormattedMessage {...messages.importExportBoard} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/trackerIntegrations`} className="item"><Icon className="retweet "/><FormattedMessage {...messages.trackerIntegration} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/metrics`} className="item"><Icon className="line chart"/><FormattedMessage {...messages.metrics} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/priorities`} className="item"><Icon className="flag"/><FormattedMessage {...messages.priorities} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/projects`} className="item"><Icon className="folder open"/><FormattedMessage {...messages.projects} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/itemSizes`} className="item"><Icon className="maximize"/><FormattedMessage {...messages.itemSizes} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/taskTypes`} className="item"><Icon className="tasks"/><FormattedMessage {...messages.taskTypes} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/impedimentTypes`} className="item"><Icon className="wait"/><FormattedMessage {...messages.impedimentTypes} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/itemTypes`} className="item"><Icon className="block layout"/><FormattedMessage {...messages.itemTypes} /></NavLink>
                <NavLink to={`/boards/${boardId}/settings/preferences`} className="item"><Icon className="wrench"/><FormattedMessage {...messages.preferences} /></NavLink>
            </Menu>
        );
    }
}
