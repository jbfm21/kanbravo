import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as MetricSetttingStore} from './MetricSetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'metricSetting.title', description: 'Metric Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'metricSetting.subtitle', description: 'Metric Setting subtitle', defaultMessage: 'Cadastre os tipos de métricas quantitativas utilizadas para medir o tamanho dos itens de trabalho (Ex: HH, StoryPoints, PF).'},
    addFormTitle: {id: 'metricSetting.addForm.title', description: 'Metric Setting add form title', defaultMessage: 'Criar nova métrica'},
    listTitle: {id: 'metricSetting.list.title', description: 'Metric Setting list title', defaultMessage: 'Métricas cadastradas'}
});

class MetricSettingPage extends ListPage
{
    static displayName = 'MetricSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, MetricSettingPage.displayName, MetricSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(MetricSettingPage);
