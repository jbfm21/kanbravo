'use stricts';

import {default as ApiCaller} from './ApiCaller';
import {LocalStorageManager} from '../commons';

export default class BaseCollectionResourceApi
{
    constructor(entityCollectionName)
    {
        this.list = () => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}`});
        this.get = (id) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}/${id}`});
        this.search = (id, searchTerm) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}/${id}/search`, dontSendInJsonModel: true, data: {searchTerm: searchTerm}});
        this.add = (entity) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}`, data: entity, haveFile: true});
        this.update = (entity) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}/${entity._id}`, data: entity, haveFile: true});
        this.delete = (entity) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/${entityCollectionName}/${entity._id}`, data: null});
    }
}
