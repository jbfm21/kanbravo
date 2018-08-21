'use strict';

const fs = require('fs');
const path = require('path');

const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

class DirectoryManager
{
    constructor(entityName)
    {
        this.entityDefName = entityName;
    }

    _createDir(dir)
    {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    }

    getRelativeDir(entityId)
    {
        const baseDestinationDir = path.join(serverConfig.directories.relativeImageDir, this.entityDefName);
        const entityDir = path.join(baseDestinationDir, entityId);
        return entityDir.replace('http:/', 'http://').replace(/\\/g, '/');
    }
    getDir(entityId)
    {
        const baseDestinationDir = path.join(serverConfig.directories.imageDir, this.entityDefName);
        const entityDir = path.join(baseDestinationDir, entityId);
        this._createDir(baseDestinationDir);
        this._createDir(entityDir);
        return entityDir;
    }

    moveFromTemporaryDirectoryToAttachmentDir(entityId, temporaryFile, nextTaskCallBack)
    {
        const destinationDir = this.getDir(entityId);
        const destinationFile = path.join(destinationDir, path.basename(temporaryFile.path));
        fs.rename(temporaryFile.path, destinationFile, nextTaskCallBack);
    }

    moveFromTemporaryDirectoryToAttachmentDirSync(entityId, temporaryFile)
    {
        const destinationDir = this.getDir(entityId);
        const destinationFile = path.join(destinationDir, path.basename(temporaryFile.path));
        fs.renameSync(temporaryFile.path, destinationFile);
    }
}

class BoardDirectoryManager extends DirectoryManager
{
    constructor()
    {
        super('boards');
    }
}

class UserDirectoryManager extends DirectoryManager
{
    constructor()
    {
        super('users');
    }
}

class CardAttachmentDirectoryManager
{
    constructor()
    {
        this.entityDefName = 'boards';
    }

    _createDir(dir)
    {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    }

    getRelativeDir(boardId, cardId)
    {
        const baseDestinationDir = path.join(serverConfig.directories.relativeAttachmentDir, this.entityDefName);
        const boardDir = path.join(baseDestinationDir, boardId);
        const cardDir = path.join(boardDir, cardId);
        return cardDir.replace('http:/', 'http://').replace(/\\/g, '/');
    }
    getDir(boardId, cardId)
    {
        const baseDestinationDir = path.join(serverConfig.directories.attachmentDir, this.entityDefName);
        const boardDir = path.join(baseDestinationDir, boardId);
        const cardDir = path.join(boardDir, cardId);
        this._createDir(baseDestinationDir);
        this._createDir(boardDir);
        this._createDir(cardDir);
        return cardDir;
    }

    moveFromTemporaryDirectoryToAttachmentDirSync(boardId, cardId, temporaryFile)
    {
        const destinationDir = this.getDir(boardId, cardId);
        const destinationFile = path.join(destinationDir, path.basename(temporaryFile.path));
        fs.renameSync(temporaryFile.path, destinationFile);
    }

    moveFromTemporaryDirectoryToAttachmentDir(boardId, cardId, temporaryFile, nextTaskCallBack)
    {
        const destinationDir = this.getDir(boardId, cardId);
        const destinationFile = path.join(destinationDir, path.basename(temporaryFile.path));
        fs.rename(temporaryFile.path, destinationFile, nextTaskCallBack);
    }

    removeFromAttachmentDirSync(boardId, cardId, relativePathToRemove)
    {
        if (relativePathToRemove.indexOf(boardId) > 0 && relativePathToRemove.indexOf(cardId) > 0)
        {
            const fullPathToRemove = serverConfig.directories.baseFilePath + relativePathToRemove;
            fs.unlinkSync(fullPathToRemove);
        }
    }

}

exports.BoardDirectoryManager = new BoardDirectoryManager();
exports.CardDirectoryManager = new CardAttachmentDirectoryManager();
exports.UserDirectoryManager = new UserDirectoryManager();
