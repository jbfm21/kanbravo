'use strict';

const nodeCrypto = require('crypto');
const algorithm = 'aes-256-ctr';
const fs = require('fs');
const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

var key;

class Crypto
{
    static _getKey()
    {
        try
        {
            if (!key)
            {
                const keyPath = serverConfig.keyPath;
                //TODO: realizar cache de leitura, lendo uma unica vez do arquivo
                key = fs.readFileSync(keyPath, 'utf8');
                return key;
            }
            return key;
        }
        catch (err)
        {
            //TODO: Logar caso não consiga ler o arquivo
            return '';
        }
    }
    static encrypt(text)
    {
        var cipher = nodeCrypto.createCipher(algorithm, Crypto._getKey());
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    static decrypt(text)
    {
        var decipher = nodeCrypto.createDecipher(algorithm, Crypto._getKey());
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
}

module.exports = Crypto;
