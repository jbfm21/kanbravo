'use strict';

const path = require('path');
const moment = require('moment');
const restify = require('restify');
const jwt = require('jwt-simple');
const passport = require('passport');
const async = require('async');

const accessControl = require('../api-util/access-control');
const directoryManager = require('../api-util/directory-manager').UserDirectoryManager;
const ApiUtils = require('../api-util/api-utils');
const handleErrors = require('../api-util/handle-errors');

const AbstractLoggerInfo = require('../logger/LoggerInfo');
const Logger = require('../logger/Logger');

const errors = require('../errors/index');
const UserDb = require('../db/user');
const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

class UserApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('UserApi', action);
    }
}

class UserApi
{
    search(req, res, next)  //eslint-disable-line consistent-return
    {
        const loggerInfo = new UserApiLoggerInfo('search');
        const logger = new Logger(req.log);

        const searchTerm = req.params.searchTerm ? req.params.searchTerm : req.body.searchTerm;

        const dataToLog = {searchTerm: searchTerm};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!searchTerm)
        {
            return res.json({data: []});
        }

        const regexString = ApiUtils.createSearchRegExpPattern(searchTerm);
        const re = new RegExp(regexString, 'ig');

        //var query = UserDb.find({$or: [{givenname: {$regex: searchTerm, $options: 'i'}}, {surname: {$regex: searchTerm, $options: 'i'}}]}).lean();
        let query = UserDb.aggregate().project(
        {
                _id: '$_id',
                nonce: '$nonce',
                givenname: '$givenname',
                surname: '$surname',
                nickname: '$nickname',
                avatar: '$avatar',
                fullName: {$concat: ['$givenname', ' ', '$surname']}
        }).match({fullName: re});
        query.exec(function (err, dbDataList)
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.debug('Finished');
            return res.json({data: dbDataList});
        });
    }

    getLoggedUserProfile(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new UserApiLoggerInfo('getUserProfile');
        const logger = new Logger(req.log);
        try
        {
            let loggedUser = req.user;
            let dataToLog = {userId: loggedUser._id};
            UserDb.findById(loggedUser._id.toString()).lean().exec((err, userProfile) =>
            {
                if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
                {
                    return null;
                }
                //Dont send fields that cant be updated
                delete userProfile.workOnCard;
                return next(res.json({data: userProfile}));
            });
        }
        catch (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(null, 'Exception'));
            return next(new restify.UnauthorizedError(res.__('FORBIDDEN_ERROR')));
        }
    }

    logout(req, res, next)
    {
        req.logout();
        return next(res.json({message: 'log out'}));
    }

    forgotPassword(req, res, next)
    {
        return next(new errors.appError(res.__('WORKING_IN_FUNCTIONALITY')));
    }

    signup(req, res, next) //eslint-disable-line consistent-return
    {
        const loggerInfo = new UserApiLoggerInfo('signup');
        const logger = new Logger(req.log);

        let dataToLog = null;

        const body = ApiUtils.getBodyModel(req);
        if (body)
        {
            dataToLog = {username: body.username, givenname: body.givenname, surname: body.surname, nickname: body.nickname};
        }

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!body)
        {
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        let user = new UserDb({username: body.username, givenname: body.givenname, surname: body.surname, nickname: body.nickname});

        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        const avatarImageFileName = (avatarImageFile) ? directoryManager.getRelativeDir(user._id.toString()) + '/' + path.basename(avatarImageFile.path) : null;
        user['avatar'] = {imageSrc: avatarImageFileName}; //eslint-disable-line dot-notation

        const validationError = user.validateSync();
        if (validationError)
        {
            return next(new errors.formError(validationError.errors));
        }

        if (!this._isPasswordValid(body.password))
        {
            return next(new errors.formError([{path: 'password', message: res.__('AUTH_INVALID_PASSWORD'), value: ''}]));
        }

        const saveUserInDbTask = (nextTask) => UserDb.register(user, body.password, nextTask);

        const saveAvatarTask = function(savedEntity, nextTask) //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(savedEntity._id.toString(), avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const endTask = function(err, savedEntity) //eslint-disable-line consistent-return
        {
            if (this._handleSaveError(req, res, next, logger, loggerInfo, err, dataToLog, user))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${savedEntity._id}`));
            passport.authenticate('local')(req, res, () => next(res.json({data: user})));
        };

        async.waterfall([saveUserInDbTask.bind(this), saveAvatarTask.bind(this)], endTask.bind(this));
    }

    updateProfile(req, res, next)
    {
        const loggerInfo = new UserApiLoggerInfo('updateProfile');
        const logger = new Logger(req.log);
        const loggedUser = req.user;

        let dataToLog = null;
        const userId = loggedUser._id.toString();
        console.log(userId);
        console.log(req.body);

        const body = ApiUtils.getBodyModel(req);

        const newPassword = body.newPassword;
        const newPasswordConfirm = body.newPasswordConfirm;

        if (body)
        {
            dataToLog = {username: body.username, givenname: body.givenname, surname: body.surname, nickname: body.nickname};
        }

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!body)
        {
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        let dataToUpdate = {nonce: body.nonce, username: body.username, givenname: body.givenname, surname: body.surname, nickname: body.nickname};
        console.log(dataToUpdate, body);


        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        const avatarImageFileName = (avatarImageFile) ? directoryManager.getRelativeDir(userId.toString()) + '/' + path.basename(avatarImageFile.path) : null;
        if (avatarImageFile)
        {
            dataToUpdate['avatar'] = {imageSrc: avatarImageFileName}; //eslint-disable-line dot-notation
        }

        const userToValidate = new UserDb(dataToUpdate);
        const validationError = userToValidate.validateSync();
        if (validationError)
        {
            return next(new errors.formError(validationError.errors));
        }

        const updateQuery = UserDb.findOneAndUpdate({_id: userId}, dataToUpdate, {new: true});

        const findUserTask = (nextTask) => UserDb.findById(userId).exec(nextTask);

        const updateUserInDbTask = (userInfo, nextTask) =>
        {
            if (userInfo.provider === 'ldap')
            {
                delete dataToUpdate.givenname;
                delete dataToUpdate.surname;
                delete dataToUpdate.nickname;
                delete dataToUpdate.username;
            }
            updateQuery.exec(nextTask);
        };

        const saveAvatarTask = function(savedEntity, nextTask) //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(userId.toString(), avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const updatePasswordTask = (savedEntity, nextTask) => //eslint-disable-line
        {
            const isToChangePassword = newPassword === newPasswordConfirm;
            if (!isToChangePassword)
            {
                return nextTask(null, savedEntity);
            }
            savedEntity.setPassword(newPassword, () => savedEntity.save((saveErr) => nextTask(saveErr, savedEntity)));
        };

        const endTask = function(err, savedEntity) //eslint-disable-line consistent-return
        {
            if (this._handleSaveError(req, res, next, logger, loggerInfo, err, dataToLog, dataToUpdate))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${savedEntity._id}`));
            return next(res.json({data: savedEntity}));
        };

        return async.waterfall([findUserTask.bind(this), updateUserInDbTask.bind(this), saveAvatarTask.bind(this), updatePasswordTask.bind(this)], endTask.bind(this));
    }

    validateToken(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new UserApiLoggerInfo('validateToken');
        const logger = new Logger(req.log);
        const initialPath = req.body.initialPath;
        const userToAutenticate = req.user;

        logger.debug('Start');

        if (!userToAutenticate)
        {
            logger.info('UnauthorizedError', loggerInfo.create(userToAutenticate.username, 'UnauthorizedError'));
            return next(new restify.UnauthorizedError(res.__('INVALID_AUTHENTICATION')));
        }
        UserDb.findOne({username: userToAutenticate.username}, (err, authenticatedUser) =>
        {
            if (this._handleLoginError(req, res, next, logger, loggerInfo, err, userToAutenticate.username, authenticatedUser))
            {
                return null;
            }
            const token = req.headers.authorization.split(' ')[1];
            return next(res.json({token: token, initialPath: initialPath}));
        });
    }

    login(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new UserApiLoggerInfo('login');
        const logger = new Logger(req.log);
        logger.debug('Start');

        const body = ApiUtils.getBodyModel(req);
        const username = (req.body) ? body.username : null;
        const loginStrategy = (req.body) ? body.strategy || 'local' : 'local'; //local or ldapauth

        let onAutheticate = function (err, user, info)
        {
            if (this._handleLoginError(req, res, next, logger, loggerInfo, err, username, user))
            {
                return null;
            }
            const token = this._createJwtToken(user);
            logger.info('Success', loggerInfo.create(username, info));
            return next(res.json({token: token}));
        };

        if (serverConfig.loginStrategy === 'ldapauth')
        {
            return this.ldapLogin(req, res, next);
        }

        passport.authenticate(loginStrategy, {session: false}, onAutheticate.bind(this))(req, res, next);
    }

    _isPasswordValid(password)
    {
        return (password && password.trim().length >= 6);
    }

    _handleSaveError(req, res, next, logger, loggerInfo, err, dataToLog, user)
    {
        if (err)
        {
            if (this._isUserAlreadyExists(err))
            {
                logger.info('UserAlreadyExists', loggerInfo.create(dataToLog, 'UserAlreadyExists'));
                next(new errors.formError([{path: 'username', message: res.__('AUTH_EMAIL_ALREADY_EXISTS'), value: user.username}]));
                return true;
            }

            if (this._isNickNameAlreadyExists(err))
            {
                logger.info('NickNameAlreadyExists', loggerInfo.create(dataToLog, 'NickNameAlreadyExists'));
                next(new errors.formError([{path: 'nickname', message: res.__('AUTH_NICKNAME_ALREADY_EXISTS'), value: user.nickname}]));
                return true;
            }
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        return false;
    }

    _handleLoginError(req, res, next, logger, loggerInfo, err, usernameToAuthenticate, authenticatedUser)
    {
        if (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(usernameToAuthenticate, 'Exception'));
            next(err);
            return true;
        }
        if (!authenticatedUser)
        {
            logger.info('UnauthorizedError', loggerInfo.create(usernameToAuthenticate, 'UnauthorizedError'));
            next(new restify.UnauthorizedError(res.__('INVALID_AUTHENTICATION')));
            return true;
        }
        return false;
    }

    _isUserAlreadyExists(err)
    {
        return (err.name === 'BadRequestError') && (err.message.indexOf('User already exists with ') >= 0) ||
            (err.name === 'UserExistsError') && (err.message.indexOf('user with the given username is already registered') >= 0);
    }

    _isNickNameAlreadyExists(err)
    {
        return (err.name === 'MongoError') && (err.message.indexOf('duplicate key error') >= 0) && (err.message.indexOf('nickname') >= 0);
    }

    _createJwtToken(user)
    {
        const payload = {
            user: user,
            iat: new Date().getTime(),
            exp: moment().add(7, 'days').valueOf()
        };
        return jwt.encode(payload, accessControl.token);
    }
}

let userApi = new UserApi();
module.exports = function(server)
{
    server.post({path: '/auth/signup', version: '1.0.0'}, userApi.signup.bind(userApi));
    server.post({path: '/auth/login', version: '1.0.0'}, userApi.login.bind(userApi));
    server.post({path: '/auth/forgotPassword', version: '1.0.0'}, userApi.forgotPassword.bind(userApi));
    server.post({path: '/auth/validateToken', version: '1.0.0'}, accessControl.ensureAuthenticated, userApi.validateToken.bind(userApi));
	server.post({path: '/auth/logout', version: '1.0.0'}, userApi.logout.bind(userApi));

    server.get({path: '/users/search', version: '1.0.0'}, accessControl.ensureAuthenticated, userApi.search.bind(userApi));
    server.put({path: '/users/profile', version: '1.0.0'}, accessControl.ensureAuthenticated, userApi.updateProfile.bind(userApi));
    server.get({path: '/users/profile', version: '1.0.0'}, accessControl.ensureAuthenticated, userApi.getLoggedUserProfile.bind(userApi));

};
