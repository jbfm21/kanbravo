'use stricts';

import {default as ApiCaller} from './ApiCaller';
import {LocalStorageManager, FunctionHelper} from '../commons';

export default class BaseBoardChildResourceApi
{
    constructor(entityCollectionName)
    {
        this.list = (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/${entityCollectionName}`});
        this.get = (boardId, entityId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/${entityCollectionName}/${entityId}`});
        this.search = (boardId, searchTerm) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/${entityCollectionName}/search?searchTerm=${searchTerm}`, dontSendInJsonModel: true});
        this.add = (boardId, entity) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/${entityCollectionName}`, data: entity, haveFile: true});
        this.update = (entity) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(entity.board)}/${entityCollectionName}/${entity._id}`, data: entity, haveFile: true});
        this.delete = (entity) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(entity.board)}/${entityCollectionName}/${entity._id}`, data: null});
    }
}
