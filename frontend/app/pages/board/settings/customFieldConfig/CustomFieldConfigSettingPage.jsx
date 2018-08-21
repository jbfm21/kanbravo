import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import _ from 'lodash';

import {ListPage} from '../base';
import {default as CustomFieldConfigSettingStore} from './CustomFieldConfigSettingStore.jsx';
import {default as CustomFieldConfigSettingItem} from './CustomFieldConfigSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'customFieldConfigSetting.title', description: 'Custom Field Config Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'customFieldConfigSetting.subtitle', description: 'Custom Field Config Setting subtitle', defaultMessage: 'Cadastre os tipos de campos customizados que poderão ser adicionados aos cartões'},
    attention: {id: 'customFieldConfigSetting.attention', description: 'Custom Field Config Setting attention', defaultMessage: 'Observações: \n (1) DROPBOX: preencha com os valores, conforme orientação descrita na caixa de texto. \n'},
    addFormTitle: {id: 'customFieldConfigSetting.addForm.title', description: 'Custom Field Config Setting add form title', defaultMessage: 'Criar novo campo customizado'},
    listTitle: {id: 'customFieldConfigSetting.list.title', description: 'Custom Field Config Setting list title', defaultMessage: 'Campos customizados cadastrados'}
});

class CustomFieldConfigSettingPage extends ListPage
{
    static displayName = 'CustomFieldConfigSettingPage';

    static sortFunction(entities)
    {
        let sorted = _.sortBy(entities, ['order']);
        return sorted;
    }

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, CustomFieldConfigSettingPage.displayName, CustomFieldConfigSettingStore, messages, CustomFieldConfigSettingItem, ListPage.titleFilterFunction, CustomFieldConfigSettingPage.sortFunction);
    }
}

module.exports = injectIntl(CustomFieldConfigSettingPage);
