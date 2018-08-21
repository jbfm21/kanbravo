import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as ItemSizeSetttingStore} from './ItemSizeSetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'itemSizeSetting.title', description: 'Item Size Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'itemSizeSetting.subtitle', description: 'Item Size Setting subtitle', defaultMessage: 'Cadastre os tamanhos qualitativos que poderão ser associados aos itens de trabalho (Ex: P, M G, ...), permitindo dimensionar o volume de trabalho em progresso e no backlog.'},
    addFormTitle: {id: 'itemSizeSetting.addForm.title', description: 'Item Size Setting add form title', defaultMessage: 'Criar novo tamanho'},
    listTitle: {id: 'itemSizeSetting.list.title', description: 'Item Size Setting list title', defaultMessage: 'Tamanhos cadastrados'}
});

class ItemSizeSettingPage extends ListPage
{
    static displayName = 'ItemSizeSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, ItemSizeSettingPage.displayName, ItemSizeSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(ItemSizeSettingPage);
