'use strict';
import {FunctionHelper} from '../commons';

class UserEntity
{
    constructor (userObject)
    {
        this.user = userObject;
        const fullname = (userObject) ? `${userObject.givenname} ${userObject.surname}` : '';
        this.fullname = fullname;
        this.nickname = (userObject) ? `${userObject.nickname}` : '';
        this.avatar = (userObject && userObject.avatar) ? userObject.avatar : {imageSrc: null};
        this.avatar.name = fullname;
        this.id = (userObject) ? `${userObject._id}` : FunctionHelper.uuid();
        this._id = (userObject) ? `${userObject._id}` : FunctionHelper.uuid();
    }
}

module.exports = UserEntity;
