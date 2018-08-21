'use strict';

import jwtDecode from 'jwt-decode';

export default class LocalStorageManager
{
    static getBoardProfile(boardId)
    {
        let boardProfile = localStorage.getItem('boardProfile_' + boardId);   //eslint-disable-line no-undef
        if (boardProfile)
        {
            return JSON.parse(boardProfile);
        }
        //TODO: utilizar enumeracao
        return {
            selectedAgingExhibitionMode: 'none',
            showProjectLegend: true,
            showMemberWipPanel: true,
            selectedSwimLaneStyle: {title: 'Nenhuma', type: 'none'},
            selectedVisualStyle: {title: 'Completo', type: 'full'}}; //TODO: centralizar essa inicializacao, pois tambem tem no backend/api/board.js
    }
    static setBoardProfile(boardId, boardProfile)
    {
       localStorage.setItem('boardProfile_' + boardId, JSON.stringify(boardProfile)); //eslint-disable-line no-undef
    }

    static setBoardProfileSwimLane(boardId, selectedSwimLaneStyle)
    {
        let boardProfile = LocalStorageManager.getBoardProfile(boardId);
        boardProfile.selectedSwimLaneStyle = selectedSwimLaneStyle;
        LocalStorageManager.setBoardProfile(boardId, boardProfile);
    }

    static setBoardProfileVisualStyle(boardId, selectedVisualStyle)
    {
        let boardProfile = LocalStorageManager.getBoardProfile(boardId);
        boardProfile.selectedVisualStyle = selectedVisualStyle;
        LocalStorageManager.setBoardProfile(boardId, boardProfile);
    }

    static setBoardAgingExhibitionMode(boardId, selectedAgingExhibitionMode)
    {
        let boardProfile = LocalStorageManager.getBoardProfile(boardId);
        boardProfile.selectedAgingExhibitionMode = selectedAgingExhibitionMode;
        LocalStorageManager.setBoardProfile(boardId, boardProfile);
    }


    static setShowProjectLegend(boardId, showProjectLegend)
    {
        let boardProfile = LocalStorageManager.getBoardProfile(boardId);
        boardProfile.showProjectLegend = showProjectLegend;
        LocalStorageManager.setBoardProfile(boardId, boardProfile);
    }


    static setShowMemberWipPanel(boardId, showMemberWipPanel)
    {
        let boardProfile = LocalStorageManager.getBoardProfile(boardId);
        boardProfile.showMemberWipPanel = showMemberWipPanel;
        LocalStorageManager.setBoardProfile(boardId, boardProfile);
    }

    static getBoardLaneIsCollapsed(boardLaneId)
    {
        let value =  localStorage.getItem('cl_' + boardLaneId);  //eslint-disable-line
        if (!value)
        {
            return false;
        }
        return value === 'true';
    }
    static setBoardLaneIsCollapsed(boardLaneId, boolValue)
    {
        if (!boolValue || boolValue === 'false')
        {
            localStorage.removeItem('cl_' + boardLaneId);  //eslint-disable-line
            return;
        }
        return localStorage.setItem('cl_' + boardLaneId, boolValue);  //eslint-disable-line
    }


    static isUserAuthenticated()
    {
        let jwt = localStorage.getItem('jwt');  //eslint-disable-line no-undef
        return (jwt && jwt !== 'undefined');
    }

    static getJwtToken()
    {
        let jwt = localStorage.getItem('jwt'); //eslint-disable-line no-undef
        return (!jwt || jwt === 'undefined') ? null : jwt;
    }

    static getDecotedJwtToken()
    {
        let jwt = LocalStorageManager.getJwtToken();
        if (jwt)
        {
            return jwtDecode(jwt);
        }
        return null;
    }

    static getLoggedUser()
    {
        let decodedToken = LocalStorageManager.getDecotedJwtToken();
        if (!decodedToken || decodedToken === null)
        {
            return null;
        }
        return decodedToken.user;
    }

    static setJwtToken(token)
    {
         if (token === null)
         {
            localStorage.removeItem('jwt'); //eslint-disable-line no-undef
         }
         else
         {
            localStorage.setItem('jwt', token); //eslint-disable-line no-undef
         }
    }
}
