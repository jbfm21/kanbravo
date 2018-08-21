import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import {ListPage, ItemWithAvatar} from '../base';
import {default as tagCategorySetttingStore} from './TagCategorySettingStore.jsx';

const messages = defineMessages(
{
    title: {id: 'tagCategorySetting.title', description: 'Class of Sertvice Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'tagCategorySetting.subtitle', description: 'Class of Sertvice Setting subtitle', defaultMessage: 'Para melhorar a semantica das tgs, cadastre as categorias de Tag (Ex: Sistema).'},
    addFormTitle: {id: 'tagCategorySetting.addForm.title', description: 'Class of Sertvice Setting add form title', defaultMessage: 'Criar nova categoria de tag'},
    listTitle: {id: 'tagCategorySetting.list.title', description: 'Class of Sertvice Setting list title', defaultMessage: 'Categorias de tags cadastradas'}
});

class TagCategorySettingPage extends ListPage
{
    static displayName = 'TagCategorySettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props, TagCategorySettingPage.displayName, tagCategorySetttingStore, messages, ItemWithAvatar, ListPage.titleFilterFunction, ListPage.noSort);
    }
}

module.exports = injectIntl(TagCategorySettingPage);
