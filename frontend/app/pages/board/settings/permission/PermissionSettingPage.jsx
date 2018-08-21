import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import _ from 'lodash';

import {ListPage} from '../base';
import {FunctionHelper} from '../../../../commons';
import {default as PermissionSettingStore} from './PermissionSettingStore';
import {default as PermissionSettingItem} from './PermissionSettingItem.jsx';

const messages = defineMessages(
{
    title: {id: 'permissionSetting.title', description: 'Permission Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'permissionSetting.subtitle', description: 'Permission Setting subtitle', defaultMessage: 'Cadastre os membros que possuem acesso ao quadro.'},
    addFormTitle: {id: 'permissionSetting.addForm.title', description: 'Permission Setting add form title', defaultMessage: 'Cadastre um novo membro'},
    listTitle: {id: 'permissionSetting.list.title', description: 'Permission Setting list title', defaultMessage: 'Membros cadastrados'}
});

class PermissionSettingPage extends ListPage
{
    static displayName = 'PermissionSettingPage';

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
            (FunctionHelper.isDefined(item.user) && (
                _.includes(item.user.givenname.toLowerCase(), query.toLowerCase()) ||
                _.includes(item.user.surname.toLowerCase(), query.toLowerCase()) ||
                _.includes(item.user.nickname.toLowerCase(), query.toLowerCase()))
            )
        );
    }


    constructor(props)
    {
        super(props, PermissionSettingPage.displayName, PermissionSettingStore, messages, PermissionSettingItem, PermissionSettingPage.filterFunction);
    }
}

module.exports = injectIntl(PermissionSettingPage);
