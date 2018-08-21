'use strict';

class Member
{
    constructor (memberObject)
    {
        this._member = memberObject;
    }

    getAvatarToShow()
    {
        let avatar = (this._member && this._member.user && this._member.user.avatar) ? this._member.user.avatar : {imageSrc: null};
        avatar.name = this.getFullName();
        return avatar;
    }

    getFullName()
    {
        return (this._member && this._member.user) ? `${this._member.user.givenname} ${this._member.user.surname}` : '';
    }

}

module.exports = Member;
