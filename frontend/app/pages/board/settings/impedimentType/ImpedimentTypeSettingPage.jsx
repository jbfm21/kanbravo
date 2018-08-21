import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as ImpedimentTypeSetttingStore} from './ImpedimentTypeSetttingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'impedimentType.title', description: 'ImpedimentType Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'impedimentType.subtitle', description: 'ImpedimentType Setting subtitle', defaultMessage: 'Cadasrtre os tipos de impedimentos que os itens de trabalho poderão sofrer ao longo de sua execução (Ex: Aguardando Cliente, Aguardando Fornecedor, ...).'},
    addFormTitle: {id: 'impedimentType.addForm.title', description: 'ImpedimentType Setting add form title', defaultMessage: 'Criar novo tipo de impedimento'},
    listTitle: {id: 'impedimentType.list.title', description: 'ImpedimentType Setting list title', defaultMessage: 'Tipos de impedimentos cadastrados'}
});

class ImpedimentTypeSettingPage extends ListPage
{
    static displayName = 'ImpedimentTypeSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, ImpedimentTypeSettingPage.displayName, ImpedimentTypeSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(ImpedimentTypeSettingPage);
