import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import _ from 'lodash';

import {FunctionHelper} from '../../../../commons';
import {ListPage} from '../base';
import {default as TagSetttingStore} from './TagSettingStore';
import {default as TagSettingItem} from './TagSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'tagSetting.title', description: 'Tag Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'tagSetting.subtitle', description: 'Tag Setting subtitle', defaultMessage: ' Cadastre as tags que, associadas aos itens de trabalho, facilitarão a identificação e busca dos itens.'},
    addFormTitle: {id: 'tagSetting.addForm.title', description: 'Tag Setting add form title', defaultMessage: 'Criar nova tag'},
    listTitle: {id: 'tagSetting.list.title', description: 'Tag Setting list title', defaultMessage: 'Tags cadastradas'}
});

class TagSettingPage extends ListPage
{
    static displayName = 'TagSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    static filterFunction(entities, query)
    {
        if (FunctionHelper.isUndefined(query))
        {
            return entities;
        }
        return _.filter(entities, (item) =>
            _.includes(item.title.toLowerCase(), query.toLowerCase()) ||
            (FunctionHelper.isDefined(item.type) && FunctionHelper.isDefined(item.type.title) && _.includes(item.type.title.toLowerCase(), query.toLowerCase()))
        );
    }

    constructor(props)
    {
        super(props, TagSettingPage.displayName, TagSetttingStore, messages, TagSettingItem, TagSettingPage.filterFunction);
    }
}

module.exports = injectIntl(TagSettingPage);
