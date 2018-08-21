'use stricts';

import {default as ApiCaller} from './ApiCaller';
import {LocalStorageManager, FunctionHelper} from '../commons';

export default class BaseCardChildResourceApi
{
    constructor(entityCollectionName)
    {
        this.list = (card) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/${entityCollectionName}?all=true`});
        this.add = (card, entity) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/${entityCollectionName}`, data: entity, haveFile: false});
        this.update = (entity) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(entity.board)}/cards/${entity.card}/${entityCollectionName}/${entity._id}`, data: entity, haveFile: false});
        this.delete = (entity) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(entity.board)}/cards/${entity.card}/${entityCollectionName}/${entity._id}`, data: null});
    }
}
