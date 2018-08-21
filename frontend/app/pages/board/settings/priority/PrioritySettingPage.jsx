import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as PrioritySetttingStore} from './PrioritySetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'prioritySetting.title', description: 'Priority Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'prioritySetting.subtitle', description: 'Priority Setting subtitle', defaultMessage: 'Cadastre as prioridades a serem associadas aos itens de trabalho dando clareza a importância e relevância de acordo com as metas da organização.'},
    addFormTitle: {id: 'prioritySetting.addForm.title', description: 'Priority Setting add form title', defaultMessage: 'Criar nova prioridade'},
    listTitle: {id: 'prioritySetting.list.title', description: 'Priority Setting list title', defaultMessage: 'Prioridades cadastradas'}
});

class PrioritySettingPage extends ListPage
{
    static displayName = 'PrioritySettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, PrioritySettingPage.displayName, PrioritySetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(PrioritySettingPage);
