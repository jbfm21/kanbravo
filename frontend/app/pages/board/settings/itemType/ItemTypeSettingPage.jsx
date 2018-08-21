import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as ItemTypeSetttingStore} from './ItemTypeSetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'itemType.title', description: 'ItemType Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'itemType.subtitle', description: 'ItemType Setting subtitle', defaultMessage: 'Cadastre os tipos que descrevem seus itens de trabalho (Ex: Novo Desenvolvimento, Manutenção corretiva, Manutenção Evolutiva, Rotineiro).'},
    addFormTitle: {id: 'itemType.addForm.title', description: 'ItemType Setting add form title', defaultMessage: 'Criar novo tipo de item'},
    listTitle: {id: 'itemType.list.title', description: 'ItemType Setting list title', defaultMessage: 'Tipos de itens cadastradas'}
});

class ItemTypeSettingPage extends ListPage
{
    static displayName = 'ItemTypeSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, ItemTypeSettingPage.displayName, ItemTypeSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(ItemTypeSettingPage);
