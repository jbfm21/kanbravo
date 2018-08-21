import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as classOfServiceSetttingStore} from './ClassOfServiceSettingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'classOfServiceSetting.title', description: 'Class of Sertvice Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'classOfServiceSetting.subtitle', description: 'Class of Sertvice Setting subtitle', defaultMessage: 'Cadastre as classes de serviço e respectivas políticas que refletem as priorizações da organização baseadas nos diferentes riscos e valores de negócio (Ex:  Legal, Expedite, Prazo Definido, Normal).'},
    addFormTitle: {id: 'classOfServiceSetting.addForm.title', description: 'Class of Sertvice Setting add form title', defaultMessage: 'Criar nova class de serviço'},
    listTitle: {id: 'classOfServiceSetting.list.title', description: 'Class of Sertvice Setting list title', defaultMessage: 'Classes de serviço cadastradas'}
});

class ClassOfServiceSettingPage extends ListPage
{
    static displayName = 'ClassOfServiceSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, ClassOfServiceSettingPage.displayName, classOfServiceSetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(ClassOfServiceSettingPage);
