'use strict';

import _ from 'lodash';

import {UIActions} from '../../../../actions';
import {ExtendedStore, FunctionHelper} from '../../../../commons';
import {BoardContextStore} from '../../../../stores';


class HighlightCardSuggestionStore extends ExtendedStore
{
    constructor()
    {
        super();
        this.state = {groups: [], suggestions: []};
        this.listenTo(UIActions.contextUpdated, this.contextUpdated_completed);
    }

    getState()
    {
        return this.state;
    }

    contextUpdated_completed()
	{
        const data = FunctionHelper.clone(BoardContextStore.getState().selectedBoardAllConfig);

        let suggestions = [];
        //TODO: melhorar o atributo property tanto em groups quanto nas sugetões
        let groups = [
                      {groupId: 'orOperator', title: 'OPERADOR'},
                      {groupId: 'cardIdConfigs', title: 'IDENTIFIC.', property: 'cardIdConfig', emptyTitle: '(sem id)'},
                      {groupId: 'classOfServices', title: 'C. SERVICO', property: 'classOfService', emptyTitle: '(sem classe)'},
                      {groupId: 'impedimentTypes', title: 'IMPED.', property: 'impediments', emptyTitle: '(sem impedimento)'},
                      {groupId: 'itemSizes', title: 'TAM. ITEM', property: 'itemSize', emptyTitle: '(sem tamanho)'},
                      {groupId: 'itemTypes', title: 'TIPO ITEM', property: 'itemType', emptyTitle: '(sem tipo)'},
                      {groupId: 'metrics', title: 'MÉTRICA', property: 'metric', emptyTitle: '(sem métrica)'},
                      {groupId: 'priorities', title: 'PRIOR.', property: 'priority', emptyTitle: '(sem prioridade)'},
                      {groupId: 'projects', title: 'PROJ.', property: 'project', emptyTitle: '(sem projeto)'},
                      {groupId: 'tags', title: 'TAG', property: 'tags', emptyTitle: '(sem tag)'},
                      {groupId: 'trackerIntegrations', title: 'INTEGR.', property: 'trackerIntegration', emptyTitle: '(sem integr.)'},
                      {groupId: 'members', title: 'MEMBRO', property: 'assignedmembers', emptyTitle: '(sem membro)'}
        ];

        _(groups).forEach((group) =>
        {
            if (group.groupId !== 'orOperator')
            {
                let value = {groupId: group.groupId, title: group.emptyTitle, _id: null, property: group.property};
                suggestions.push(value);
            }
        });

        _(data.cardIdConfigs).forEach((value) => {value['groupId'] = 'cardIdConfigs'; value['property'] = 'cardIdConfig'; suggestions.push(value);}); //eslint-disable-line
        _(data.classOfServices).forEach((value) => {value['groupId'] = 'classOfServices'; value['property'] = 'classOfService'; suggestions.push(value);}); //eslint-disable-line
        _(data.impedimentTypes).forEach((value) => {value['groupId'] = 'impedimentTypes'; value['property'] = 'impediments'; suggestions.push(value);}); //eslint-disable-line
        _(data.itemSizes).forEach((value) => {value['groupId'] = 'itemSizes'; value['property'] = 'itemSize'; suggestions.push(value);}); //eslint-disable-line
        _(data.itemTypes).forEach((value) => {value['groupId'] = 'itemTypes'; value['property'] = 'itemType'; suggestions.push(value);}); //eslint-disable-line
        _(data.metrics).forEach((value) => {value['groupId'] = 'metrics'; value['property'] = 'metric'; suggestions.push(value);}); //eslint-disable-line
        _(data.trackerIntegrations).forEach((value) => {value['groupId'] = 'trackerIntegrations'; value['property'] = 'trackerIntegration'; suggestions.push(value);}); //eslint-disable-line
        _(data.priorities).forEach((value) => {value['groupId'] = 'priorities'; value['property'] = 'priority'; suggestions.push(value);}); //eslint-disable-line
        _(data.projects).forEach((value) => {value['groupId'] = 'projects'; value['property'] = 'project'; suggestions.push(value);}); //eslint-disable-line
        _(data.tags).forEach((value) => {value['groupId'] = 'tags'; value['property'] = 'tags'; suggestions.push(value);}); //eslint-disable-line
        _(data.members).forEach((value) =>
        {
            value['groupId'] = 'members'; //eslint-disable-line
            value['property'] = 'member'; //eslint-disable-line
            value['title'] = `${value.user.givenname} ${value.user.surname}`; //eslint-disable-line
            value['avatar'] = value.user.avatar;//eslint-disable-line
            value['avatar'].name = `${value.user.givenname} ${value.user.surname}`; //eslint-disable-line
            delete value.user;
            suggestions.push(value); //eslint-disable-line
        });
        suggestions.push({groupId: 'orOperator', title: 'OU', avatar: null});

        //TODO: intercionalizar

        this.state = {groups: groups, suggestions: suggestions};
        this.trigger({state: this.state});
    }

}

module.exports = new HighlightCardSuggestionStore();
