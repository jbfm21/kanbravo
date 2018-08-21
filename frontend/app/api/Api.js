'use strict';

import {default as BaseResourceApi} from './BaseResourceApi';
import {default as BaseBoardChildResourceApi} from './BaseBoardChildResourceApi';
import {default as BaseCardChildResourceApi} from './BaseCardChildResourceApi';
import {default as ApiCaller} from './ApiCaller';

import {LocalStorageManager, FunctionHelper} from '../commons';

class Api
{
    constructor()
    {
        this.feedback = new BaseResourceApi('feedbacks');
        this.board = new BaseResourceApi('boards');

        this.boardActions =
        {
            exportData: (boardId) => ApiCaller.sendGetToDowloadFile({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${boardId}/export`, fileName: 'export.zip'}),
            getCalendar: (boardId, viewMode, startDate) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${boardId}/calendar?startDate=${FunctionHelper.formatDateToUseInQuery(startDate)}&viewMode=${viewMode}`, dontSendInJsonModel: true}),
            getAllConfiguration: (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${boardId}/allconfigs?searchTerm=[searchAll]`, dontSendInJsonModel: true}),
            getProjectCardStatistic: (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${boardId}/projectCardStatistic`, dontSendInJsonModel: true})
        };

        this.boardLayout =
        {
            getBoardLayout: (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/layout`}),
            updateBoardLayout: (boardLayout) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardLayout.board)}/layout/${boardLayout._id}`, data: boardLayout, haveFile: false}),
            updateBoardLayoutCardAllocation: (boardLayout, movementAction) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardLayout.board)}/layout/${boardLayout._id}/cardAllocation`, data: {boardLane: boardLayout, movementAction: movementAction}, haveFile: false}),
            laneAddTopLaneAtTheEnd: (layout) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/actions/addTopLaneAtTheEnd`, data: {layoutNonce: layout.nonce}, haveFile: false}),
            laneDelete: (layout, lane) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneMoveLeft: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/moveLeft`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneMoveRight: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/moveRight`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneAddChild: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/addChild`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneClone: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/clone`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneSplitHorizontal: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/splitHorizontal`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneSplitVertical: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/actions/splitVertical`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneIncreaseCardWide: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/action/increaseCardWide`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false}),
            laneSplitDecreaseCardWide: (layout, lane) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(layout.board)}/layout/${layout._id}/lane/${lane._id}/action/decreaseCardWide`, data: {lanePath: lane.path, layoutNonce: layout.nonce}, haveFile: false})
        };

        this.boardSetting =
        {
            aging: new BaseBoardChildResourceApi('agings'),
            boardMember: new BaseBoardChildResourceApi('boardMembers'),
            cardIdConfig: new BaseBoardChildResourceApi('cardIdConfigs'),
            customFieldConfig: new BaseBoardChildResourceApi('customFieldConfigs'),
            classOfService: new BaseBoardChildResourceApi('classOfServices'),
            impedimentType: new BaseBoardChildResourceApi('impedimentTypes'),
            itemSize: new BaseBoardChildResourceApi('itemSizes'),
            itemType: new BaseBoardChildResourceApi('itemTypes'),
            metricType: new BaseBoardChildResourceApi('metrics'),
            priority: new BaseBoardChildResourceApi('priorities'),
            project: new BaseBoardChildResourceApi('projects'),
            ratingType: new BaseBoardChildResourceApi('ratingTypes'),
            tag: new BaseBoardChildResourceApi('tags'),
            tagCategory: new BaseBoardChildResourceApi('tagCategories'),
            taskType: new BaseBoardChildResourceApi('taskTypes'),
            templateCard: new BaseBoardChildResourceApi('templateCards'),
            trackerIntegration: new BaseBoardChildResourceApi('trackerIntegrations'),
            visualStyle: new BaseBoardChildResourceApi('visualStyles')
        };
        this.boardSetting.boardMember.update = (boardMember) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardMember.board)}/boardMembers/${boardMember._id}/role`, data: boardMember});
        this.boardSetting.boardMember.getLoggedUserBoardPreference = (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/boardMembers/preference`});
        this.boardSetting.boardMember.updateBoardMemberPreference = (boardMember) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardMember.board)}/boardMembers/${boardMember._id}/preference`, data: boardMember});

        this.boardSetting.project.searchOpenProject = (boardId, searchTerm) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/projects/search?searchTerm=${searchTerm}&filter=phase!=close`, dontSendInJsonModel: true});

        this.user =
        {
            forgotPassword: (username) => ApiCaller.sendPost({url: '/auth/forgotPassword', dontSendInJsonModel: true, data: {username: username}}),
            getLoggedUserProfile: () => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: '/users/profile'}),
            login: (strategy, username, password) => ApiCaller.sendPost({baseProtocol: 'https', basePort: '3001', url: '/auth/login', dontSendInJsonModel: true, data: {strategy: strategy, username: username, password: password}}),
            loginUserByJwt: (jwt, initialPath) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: '/auth/validateToken', data: {initialPath: initialPath}, dontSendInJsonModel: true}),
            logout: () => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: '/auth/logout', dontSendInJsonModel: true}),
            searchUser: (searchTerm) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/users/search?searchTerm=${searchTerm}`, dontSendInJsonModel: true}),
            signup: (user) => ApiCaller.sendPost({url: '/auth/signup', data: user, haveFile: true, dontSendInJsonModel: true}),
            updateUserProfile: (user) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: '/users/profile', data: user, haveFile: true, dontSendInJsonModel: true})

        };

        this.card =
        {
            archive: (card) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/actions/archive`, haveFile: false}),
            archiveList: (boardId, cardIdList) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/archiveList`, haveFile: false, data: cardIdList}),
            cancel: (card, isToCancelConnectedCardToo) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/actions/cancel`, data: {isToApplyToConnectedCardToo: isToCancelConnectedCardToo}, haveFile: false}),
            delete: (card, isToDeleteConnectedCardToo) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}`, data: {isToApplyToConnectedCardToo: isToDeleteConnectedCardToo}, haveFile: false, useFileIdInFormData: true}),
            downloadAttachment: (filePath, fileName) => ApiCaller.sendGetToDowloadFile({jwt: LocalStorageManager.getJwtToken(), url: filePath, fileName: fileName}),
            get: (card) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}`, data: card}),
            listInboard: (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards?status=inboard`}),
            listInBacklog: (boardId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards?status=backlog`}),
            listInArchive: (boardId, navigation, cursor, limit, titleToSearch, projectId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards?${navigation}=${cursor}&limit=${limit}&status=archived&searchTerm=${titleToSearch}&projectId=${FunctionHelper.isDefined(projectId) ? projectId : ''}`}),
            update: (card) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}`, data: card, haveFile: true, useFileIdInFormData: true}),
            userNotWorkOnCard: (card, user) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/actions/userNotWorkOn`, data: user, haveFile: false}),
            userWorkOnCard: (card, user) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/actions/userWorkOn`, data: user, haveFile: false}),
            addInFirstLeafLane: (boardId, cardToSave, position) =>
            {
                let card = JSON.parse(JSON.stringify(cardToSave));
                //Otimizacao para passar somente os IDs para o servidor, nao eh necessario passar o objeto completo
                //TODO: replicado com addInBacklog
                card.attachments = cardToSave.attachments;
                card.cardIdConfig = FunctionHelper.isDefined(card.cardIdConfig) ? card.cardIdConfig._id : null;
                card.classOfService = FunctionHelper.isDefined(card.classOfService) ? card.classOfService._id : null;
                card.itemType = FunctionHelper.isDefined(card.itemType) ? card.itemType._id : null;
                card.itemSize = FunctionHelper.isDefined(card.itemSize) ? card.itemSize._id : null;
                card.metric = FunctionHelper.isDefined(card.metric) ? card.metric._id : null;
                card.priority = FunctionHelper.isDefined(card.priority) ? card.priority._id : null;
                card.project = FunctionHelper.isDefined(card.project) ? card.project._id : null;
                return ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/addInFirstLeafLane`, data: {card: card, position: position}, haveFile: true, useFileIdInFormData: true});
            },
            addInBacklog: (boardId, cardToSave) =>
            {
                let card = JSON.parse(JSON.stringify(cardToSave));
                //Otimizacao para passar somente os IDs para o servidor, nao eh necessario passar o objeto completo
                //TODO: replicado com addInFirstLeafLane
                card.attachments = cardToSave.attachments;
                card.cardIdConfig = FunctionHelper.isDefined(card.cardIdConfig) ? card.cardIdConfig._id : null;
                card.classOfService = FunctionHelper.isDefined(card.classOfService) ? card.classOfService._id : null;
                card.itemType = FunctionHelper.isDefined(card.itemType) ? card.itemType._id : null;
                card.itemSize = FunctionHelper.isDefined(card.itemSize) ? card.itemSize._id : null;
                card.metric = FunctionHelper.isDefined(card.metric) ? card.metric._id : null;
                card.priority = FunctionHelper.isDefined(card.priority) ? card.priority._id : null;
                card.project = FunctionHelper.isDefined(card.project) ? card.project._id : null;
                return ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/addInBacklog`, data: card, haveFile: true, useFileIdInFormData: true});
            },
            getChildrenConnection: (card) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/childrenConnections`}),
            searchCardToConnect: (boardId, projectId, titleToSearch) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/searchToConnect`, haveFile: false, data: {projectId: projectId, titleToSearch: titleToSearch}}),
            searchCardToConnectWithoutProject: (boardId, titleToSearch) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/searchToConnect`, haveFile: false, data: {titleToSearch: titleToSearch}}),
            searchParentCardToConnect: (boardId, titleToSearch) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(boardId)}/cards/actions/searchParentToConnect`, haveFile: false, data: {titleToSearch: titleToSearch}})
        };

        this.cardSetting = {
            cardCustomField: new BaseCardChildResourceApi('cardCustomField'),
            comment: new BaseCardChildResourceApi('comments'),
            impediment: new BaseCardChildResourceApi('impediments'),
            reminder: new BaseCardChildResourceApi('reminders'),
            task: new BaseCardChildResourceApi('tasks'),
            timesheet: new BaseCardChildResourceApi('timesheets'),
            cardMovementHistory: new BaseCardChildResourceApi('cardMovementHistories')
        };
        this.cardSetting.cardMovementHistory.updateMovement = (card, cardMovementHistories, movementToUpdate) => ApiCaller.sendPut({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/cardMovementHistories/${cardMovementHistories._id}/updateMovement`, data: movementToUpdate});
        this.cardSetting.cardMovementHistory.deleteMovement = (card, cardMovementHistories, movementToDelete) => ApiCaller.sendDelete({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/cardMovementHistories/${cardMovementHistories._id}/deleteMovement/${movementToDelete._id}`});
        this.cardSetting.cardCustomField.listToShowInCard = (card) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/cardCustomField/actions/listToShowInCard`});
        this.cardSetting.cardCustomField.upinsert = (card, customField) => ApiCaller.sendPost({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/cardCustomField`, data: customField, haveFile: false});
        this.cardSetting.comment.listNewComment = (card, afterCursorValue, limit) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/comments?after=${afterCursorValue}&limit=${limit}`});
        this.cardSetting.comment.listOldComment = (card, beforeCursorValue, limit) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/comments?before=${beforeCursorValue}&limit=${limit}`});
        this.cardSetting.timesheet.listUserCardTimeSheet = (card, userId) => ApiCaller.sendGet({jwt: LocalStorageManager.getJwtToken(), url: `/boards/${FunctionHelper.getId(card.board)}/cards/${card._id}/timesheets/${userId}?all=true`});

    }
}

module.exports = new Api();
