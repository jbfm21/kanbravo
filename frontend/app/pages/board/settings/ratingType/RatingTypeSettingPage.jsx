import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage} from '../base';
import {default as RatingTypeSettingStore} from './RatingTypeSettingStore.jsx';
import {default as RatingTypeSettingItem} from './RatingTypeSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'ratingTypeSetting.title', description: 'RatingType Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'ratingTypeSetting.subtitle', description: 'RatingType Setting subtitle', defaultMessage: ' Cadastre as classificações que, associadas aos itens de trabalho, apoiarão o processo de priorização do backlog (Ex: Custo, Benefício, ...)'},
    addFormTitle: {id: 'ratingTypeSetting.addForm.title', description: 'RatingType Setting add form title', defaultMessage: 'Criar nova classificação'},
    listTitle: {id: 'ratingTypeSetting.list.title', description: 'RatingType Setting list title', defaultMessage: 'Classificações cadastradas'}
});

class RatingTypeSettingPage extends ListPage
{
    static displayName = 'RatingTypeSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, RatingTypeSettingPage.displayName, RatingTypeSettingStore, messages, RatingTypeSettingItem, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(RatingTypeSettingPage);
