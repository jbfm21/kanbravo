'use strict';

import _ from 'lodash' ;
import {saveAs} from './FileSaver';
const debug = false;

export default class ApiCaller
{
    static setDefaults(options, defaults) {return _.defaults({}, _.clone(options), defaults); }
    static sendPost(options) { options.method = 'POST'; return ApiCaller.sendAjaxRequest(options);}
    static sendGet(options) { options.method = 'GET'; return ApiCaller.sendAjaxRequest(options);}
    static sendGetToDowloadFile(options) { options.method = 'GET'; return ApiCaller.sendAjaxRequestToDownloadFile(options);}

    static sendPut(options) { options.method = 'PUT'; return ApiCaller.sendAjaxRequest(options);}
    static sendDelete(options) { options.method = 'DELETE'; return ApiCaller.sendAjaxRequest(options);}

    static getType(any)
    {
        return toString.call(any).slice(8, -1);
    }

    static transformToFormData(data)
    {
        let fData = new FormData(); //eslint-disable-line no-undef
        _.each(data, function(value, key)
        {
            fData.append(key, value);
        });
        return fData;
    }
    static transformToJsonModelFormData(options)
    {
        let data = options.data;
        let useFileIdInFormData = options.useFileIdInFormData;
        let fData = new FormData(); //eslint-disable-line no-undef
        fData.append('jsonModel', JSON.stringify(data));
        _.each(data, function(value, key)
        {
            var type = ApiCaller.getType(value);
            switch (type)
            {
                case 'Array':
                     _.each(value, function(item, index)
                    {
                        var itemType = ApiCaller.getType(item);
                        switch (itemType)
                        {
                            case 'File':
                                let formKeyFile = (useFileIdInFormData) ? item.id : key + '_' + index;
                                fData.append(formKeyFile, item);
                                break;
                            case 'Blob':
                                let formKeyBlob = (useFileIdInFormData) ? item.id : key + '_' + index;
                                fData.append(formKeyBlob, item, item.name);
                                break;
                            default:
                                break;
                        }
                    });
                    return true; // prevent step into
                case 'FileList':
                     _.each(value, function(item, index)
                    {
                        fData.append(key + '_' + index, item);
                    });
                    return true; // prevent step into
                case 'File':
                    fData.append(key, value);
                    break;
                case 'Blob':
                    fData.append(key, value, value.name);
                    break;
                default:
                    break;
            }
            return true;
        });
        return fData;
    }

    static sendAjaxRequest(options)
    {
        //let defaults = {baseUrl: 'http://localhost:3000', jwt: null, data: null, url: null, haveFile: false, useFileIdInFormData: false};
        let defaults = {baseProtocol: 'httpS', baseUrl: window.location.hostname, basePort: '3001', jwt: null, data: null, url: null, haveFile: false, useFileIdInFormData: false}; //eslint-disable-line

        options = this.setDefaults(options, defaults);

        return new Promise((resolve, reject) =>
        {
            if (debug) { console.log(`Sending ${options.method} Request to ${options.url}`); }

            let request = new XMLHttpRequest(); //eslint-disable-line no-undef
            const baseCompleteUrl = `${options.baseProtocol}://${options.baseUrl}:${options.basePort}`;
            //Set credentials
            request.open(options.method, baseCompleteUrl + options.url, true); // force XMLHttpRequest2
            request.withCredentials = true; // pass along cookies
            if (options.jwt)
            {
                request.setRequestHeader('Authorization', `Bearer ${options.jwt}`);
            }

            if (options.dontSendInJsonModel) //usado por exemplo para autenticacao e cadastro de pessoas
            {
                if (options.haveFile)
                {
                    options.data = ApiCaller.transformToFormData(options.data);
                }
                else
                {
                    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                    options.data = (options.data) ? JSON.stringify(options.data) : null;
                }
            }
            else
            {
                options.data = ApiCaller.transformToJsonModelFormData(options);
            }
            if (options.data)
            {
                request.send(options.data);
            }
            else
            {
                request.send();
            }

            //get result or error
            request.onload = () =>
            {
                let result = (request.responseText) ? {status: request.status, body: JSON.parse(request.responseText)} : {status: request.status, body: ''};
                let callbackFunction = (result.status >= 200 && result.status <= 299) ? resolve : reject;
                if (debug) { console.log('[onload] Response: ', result.body); }
                callbackFunction(result);
            };
            request.onerror = (result) =>
            {
                if (debug) { console.log('[onerror] Response: ', result); }
                reject({status: 500, data: {message: 'Connection error'}});
            };
        });
    }

    static sendAjaxRequestToDownloadFile(options)
    {

        let defaults = {baseUrl: 'http://' + window.location.hostname + ':3000', jwt: null, url: null, fileName: 'downloadFile'}; //eslint-disable-line

        options = this.setDefaults(options, defaults);

        return new Promise((resolve, reject) =>
        {
            if (debug) { console.log(`Sending ${options.method} Request to ${options.url}`); }

            let request = new XMLHttpRequest(); //eslint-disable-line no-undef

            //Set credentials
            request.open(options.method, options.baseUrl + options.url, true); // force XMLHttpRequest2
            request.withCredentials = true; // pass along cookies
            if (options.jwt)
            {
                request.setRequestHeader('Authorization', `Bearer ${options.jwt}`);
            }

            request.responseType = 'blob';
            request.send();

            //get result or error
            request.onload = () =>
            {
                saveAs(request.response, options.fileName);
            };
            request.onerror = (result) =>
            {
                if (debug) { console.log('[onerror] Response: ', result); }
                reject({status: 500, data: {message: 'Connection error'}});
            };
        });
    }
}
