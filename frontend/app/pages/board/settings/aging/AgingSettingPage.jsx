import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage} from '../base';
import {default as AgingSettingStore} from './AgingSettingStore.jsx';
import {default as AgingSettingItem} from './AgingSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'agingSetting.title', description: 'Aging Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'agingSetting.subtitle', description: 'Aging Setting subtitle', defaultMessage: 'Cadastre as configurações de evelhecimento desejadas para o cartão'},
    attention: {id: 'agingSetting.attention', description: 'Aging Setting attention', defaultMessage: 'ATENÇÃO: Escolha uma cor de fundo no avatar, para que esta cor apareça destacada no fundo do cartão de acordo com a quantidade de dias configurada'},
    addFormTitle: {id: 'agingSetting.addForm.title', description: 'Aging Setting add form title', defaultMessage: 'Criar uma nova configuração de envelhecimento'},
    listTitle: {id: 'agingSetting.list.title', description: 'Aging Setting list title', defaultMessage: 'Envelhecimentos cadastrados'}
});

class agingSettingPage extends ListPage
{
    static displayName = 'agingSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, agingSettingPage.displayName, AgingSettingStore, messages, AgingSettingItem, ListPage.titleFilterFunction);
    }
}

module.exports = injectIntl(agingSettingPage);
