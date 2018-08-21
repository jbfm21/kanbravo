import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage} from '../base';
import {default as TrackerIntegrationSettingStore} from './TrackerIntegrationSettingStore';
import {default as TrackerIntegrationSettingItem} from './TrackerIntegrationSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'trackerIntegrationSetting.title', description: 'TrackerIntegration Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'trackerIntegrationSetting.subtitle', description: 'TrackerIntegration Setting subtitle', defaultMessage: 'Cadastre as integrações externas.'},
    documentation: {id: 'trackerIntegrationSetting.documentation', description: 'TrackerIntegration attention', defaultMessage: ' Veja aqui a documentação da integração', url: 'trackerIntegrations/help'},
    addFormTitle: {id: 'trackerIntegrationSetting.addForm.title', description: 'TrackerIntegration Setting add form title', defaultMessage: 'Cadastre uma nova integração'},
    listTitle: {id: 'trackerIntegrationSetting.list.title', description: 'TrackerIntegration Setting list title', defaultMessage: 'Integrações cadastradas'}
});

class TrackerIntegrationSettingPage extends ListPage
{
    static displayName = 'TrackerIntegrationSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, TrackerIntegrationSettingPage.displayName, TrackerIntegrationSettingStore, messages, TrackerIntegrationSettingItem);
    }
}

module.exports = injectIntl(TrackerIntegrationSettingPage);
