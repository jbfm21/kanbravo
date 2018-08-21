import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage} from '../base';
import {default as CardIdSettingStore} from './CardIdSettingStore';
import {default as CardIdSettingItem} from './CardIdSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'cardIdSetting.title', description: 'CardId Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'cardIdSetting.subtitle', description: 'CardId Setting subtitle', defaultMessage: 'Cadastre os sistemas externos que podem ser associados ao cartão através de seus identificadores.'},
    addFormTitle: {id: 'cardIdSetting.addForm.title', description: 'CardId Setting add form title', defaultMessage: 'Cadastre um novo sistema'},
    listTitle: {id: 'cardIdSetting.list.title', description: 'CardId Setting list title', defaultMessage: 'Sistemas cadastrados'}
});

class CardIdSettingPage extends ListPage
{
    static displayName = 'CardIdSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, CardIdSettingPage.displayName, CardIdSettingStore, messages, CardIdSettingItem);
    }
}

module.exports = injectIntl(CardIdSettingPage);
