/// <reference path="../../typings/node/node.d.ts"/>
'use strict';

const fs = require('fs');
const bunyan = require('bunyan');
const requireFu = require('require-fu');
const restify = require('restify');
const restifyValidator = require('restify-validator');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
const LdapStrategy = require('passport-ldapauth');
const socketio = require('socket.io');
const UserDb = require('./db/user');
const localeManager = require('./locales/localeManager');

const FormError = require('./errors/form-error');
const AppError = require('./errors/app-error');

class Server
{
	constructor(loggerConfig, serverConfig)
	{
		this.serverName = 'qkanban-backend';
		this.version = '1.0.0';
        this.apiPath = __dirname + '/api';
        this.serverConfig = serverConfig;
        this.serverLogger = loggerConfig;
        this._restifyServer = null;
        this._restifyServerHttps = null;
	}

    _startHttp()
    {
        this._restifyServer = this._configureRestifyServer();
        this._restifyServer.get(/\/images\/?.*/, restify.serveStatic({directory: this.serverConfig.directories.staticFolder}));
        if (this.serverConfig.restServer.ipAddress)
        {
            this._restifyServer.listen(this.serverConfig.restServer.port, this.serverConfig.restServer.ipAddress, this._onStartListen.bind(this));
        }
        else
        {
            this._restifyServer.listen(this.serverConfig.restServer.port, this._onStartListen.bind(this));
        }
    }

    _startHttps()
    {
        this._restifyServerHttps = this._configureRestifyServerHttps();
        if (!this._restifyServerHttps)
        {
            return;
        }
        if (this.serverConfig.restServerHttps.ipAddress)
        {
            this._restifyServerHttps.listen(this.serverConfig.restServerHttps.port, this.serverConfig.restServerHttps.ipAddress, this._onStartListenHttps.bind(this));
        }
        else
        {
            this._restifyServerHttps.listen(this.serverConfig.restServerHttps.port, this._onStartListenHttps.bind(this));
        }
    }

	start()
	{
        this._startHttp();
        this._startHttps();
	}

    _onStartListenHttps(err)
    {
        if (err)
        {
            console.log(err);
            this.serverLogger.error(`Initilization Server Error: ${err.stack}`);
            return;
        }

        this.serverLogger.info(`Application listen to port: ${this.serverConfig.restServerHttps.port} - in url: ${this.serverConfig.restServerHttps.url}`);
        this.serverLogger.info(`Server environment: ${this.serverConfig.environment}`);
    }

    _onStartListen(err)
    {
        if (err)
        {
            console.log(err);
            this.serverLogger.error(`Initilization Server Error: ${err.stack}`);
            return;
        }

        this.serverLogger.info(`Application listen to port: ${this.serverConfig.restServer.port} -in url: ${this.serverConfig.restServer.url}`);
        this.serverLogger.info(`Server environment: ${this.serverConfig.environment}`);
    }

	_onUncaughtException(req, res, route, err)
	{
        console.log(err);
        this.serverLogger.error(`UncaughtException Server Error: ${err.stack}`);
        res.send(new restify.InternalServerError(this.serverConfig.messages.genericErrorMessage));
	}

	_onInternalServerError(req, res, route, err)
	{
        console.log(err);
        this.serverLogger.error(`InternalServerError Server Error: ${err.stack}`);
        res.send(new restify.InternalServerError(this.serverConfig.messages.genericErrorMessage));
	}

    _configureBaseServer(restifyServer)
    {
        restifyServer.use(restify.acceptParser(restifyServer.acceptable));
		restifyServer.use(restify.queryParser());
		restifyServer.use(restify.bodyParser({uploadDir: this.serverConfig.directories.tempUploadDir, keepExtensions: true}));
		restifyServer.use(restify.requestLogger());
		restifyServer.use(restify.fullResponse());
		restifyServer.use(restify.gzipResponse());
		restifyServer.use(restifyValidator);
		restifyServer.use(localeManager.init);

        this._configureAuthentication(restifyServer);
        this._configureCORS(restifyServer);
        this._configureAuditLog(restifyServer);

        restifyServer.use(
            function crossOrigin(req, res, next)
            {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With');
                return next();
            }
        );

        restifyServer.on('uncaughtException', this._onUncaughtException.bind(this));
        restifyServer.on('InternalServerError', this._onInternalServerError.bind(this));
        restifyServer.on('InternalError', this._onInternalServerError.bind(this));
        this._socketIO = socketio.listen(restifyServer.server);
        this._socketIO.set('transports', ['websocket']);
        this._socketIO.sockets.on('connection', function(socket)
        {
            //console.log(socket.id, 'disconnect');
            // once a client has connected, we expect to get a ping from them saying what room they want to join
            socket.on('room', function(room)
            {
                if (socket.room)
                {
                    //console.log(socket.id, 'leaving', socket.room);
                    socket.leave(socket.room);
                }
                socket.room = room;
                socket.join(room);
                //console.log(socket.id, 'joining', room);
                //console.log(that._socketIO);
            });
            socket.on('disconnect', function ()
            {
                //console.log(socket.id, 'disconnect');
            });
        });

        //Configure API urls in server
        requireFu(this.apiPath)(restifyServer, this._socketIO);
    }

    _configureRestifyServerHttps()
    {
        if (!fs.existsSync(this.serverConfig.restServerHttps.key || !this.serverConfig.restServerHttps.certificate))
        {
           return null;
        }

        const key = fs.readFileSync(this.serverConfig.restServerHttps.key);
        const certificate = fs.readFileSync(this.serverConfig.restServerHttps.certificate);
        let restifyServer = restify.createServer({name: this.serverName, key: key, certificate: certificate, serializers: {err: bunyan.stdSerializers.err}, version: this.version, log: this.serverLogger});
        this._configureBaseServer(restifyServer);

		return restifyServer;
    }

	_configureRestifyServer()
	{
		let restifyServer = restify.createServer({name: this.serverName, serializers: {err: bunyan.stdSerializers.err}, version: this.version, log: this.serverLogger});
        this._configureBaseServer(restifyServer);
		return restifyServer;
	}

    _ldapLoginSuccess(userLdap, done)
    {
        const that = this;
        const ldapConfig = that.serverConfig.ldap;
        UserDb.findOne({nickname: userLdap[ldapConfig.loginField]}, function(err, user) //eslint-disable-line
        {
            if (err)
            {
                that.serverLogger.error(`Error ldap authentication: ${err}`);
                return done(new AppError('Invalid Request'), null);
            }
            const userNotFoundInDatabase = !user;
            if (userNotFoundInDatabase)
            {
                user = new UserDb({
                    givenname: userLdap[ldapConfig.givennameField],
                    surname: userLdap[ldapConfig.surnameField],
                    nickname: userLdap[ldapConfig.loginField],
                    username: userLdap[ldapConfig.emailField],
                    provider: 'ldap', avatar: {imageSrc: null}});
                const validationError = user.validateSync();
                if (validationError)
                {
                    that.serverLogger.error(`Error creating new user while making ldap authentication: ${validationError}`);
                    return done(new FormError(validationError.errors));
                }
                user.save(function(saveError)
                {
                    if (saveError)
                    {
                        that.serverLogger.error(`Error creating new user while making ldap authentication: ${saveError}`);
                        return done(new AppError('Error creating new user while making ldap authentication'), null);
                    }
                    return done(saveError, user);
                });
            }
            else
            {
                return done(err, user);
            }
        });
    }

    _configureAuthentication(restifyServer)
    {
        passport.use(new PassportLocalStrategy(UserDb.authenticate()));
        passport.use(new LdapStrategy({
            server: {
                url: this.serverConfig.ldap.url,
                bindDn: this.serverConfig.ldap.bindDn,
                bindCredentials: this.serverConfig .ldap.bindCredentials,
                searchBase: this.serverConfig.ldap.searchBase,
                searchFilter: this.serverConfig.ldap.searchFilter,
                searchAttributes: this.serverConfig.ldap.searchAttributes
            },
            usernameField: 'username',
            passwordField: 'password'
            }, this._ldapLoginSuccess.bind(this)
        ));


        restifyServer.use(passport.initialize());
        restifyServer.use(restify.authorizationParser());
    }

    _configureCORS(restifyServer)
    {
        restify.CORS.ALLOW_HEADERS.push('accept');
		restify.CORS.ALLOW_HEADERS.push('sid');
		restify.CORS.ALLOW_HEADERS.push('lang');
		restify.CORS.ALLOW_HEADERS.push('origin');
		restify.CORS.ALLOW_HEADERS.push('withcredentials');
		restify.CORS.ALLOW_HEADERS.push('accept-encoding');
		restify.CORS.ALLOW_HEADERS.push('accept-language');
		restify.CORS.ALLOW_HEADERS.push('authorization');
        restify.CORS.ALLOW_HEADERS.push('cache-control');
        restify.CORS.ALLOW_HEADERS.push('connection');
        restify.CORS.ALLOW_HEADERS.push('content-length');
        restify.CORS.ALLOW_HEADERS.push('content-type');
        restify.CORS.ALLOW_HEADERS.push('host');
        restify.CORS.ALLOW_HEADERS.push('pragma');
        restify.CORS.ALLOW_HEADERS.push('referer');
        restify.CORS.ALLOW_HEADERS.push('accept-version');
        restify.CORS.ALLOW_HEADERS.push('request-id');
        restify.CORS.ALLOW_HEADERS.push('x-api-version');
        restify.CORS.ALLOW_HEADERS.push('x-request-id');
        restify.CORS.ALLOW_HEADERS.push('user-agent');
        restify.CORS.ALLOW_HEADERS.push('x-requested-with');
        restify.CORS.ALLOW_HEADERS.push('x-forwarded-for');
        restify.CORS.ALLOW_HEADERS.push('x-real-ip');
        restify.CORS.ALLOW_HEADERS.push('x-customheader');
        restify.CORS.ALLOW_HEADERS.push('upgrade');
        restify.CORS.ALLOW_HEADERS.push('dnt');
        restify.CORS.ALLOW_HEADERS.push('if-modified-since');
        restify.CORS.ALLOW_HEADERS.push('cache-control');

		restifyServer.use(restify.CORS({
				//origins: ['http://localhost:8080'],   // defaults to ['*']
				credentials: true                       // defaults to false
		}));
    }

	_configureAuditLog(restifyServer)
	{
		let bunyanAuditLogger = bunyan.createLogger({name: 'qkanban-backend-audit', streams:
            [
                {level: 'debug', path: this.serverConfig.logger.audit}
            ]});
        restifyServer.on('after', restify.auditLogger({log: bunyanAuditLogger}));
	}
}

module.exports = Server;

