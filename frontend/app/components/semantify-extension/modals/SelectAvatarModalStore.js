'use strict';

import * as airflux from 'airflux';
import {UIActions} from '../../../actions';

class SelectAvatarModalStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.showSelectAvatarModal, this._onSelectAvatarModalShow);
    }

    _onSelectAvatarModalShow(avatar, confirmFunction, cancelFunction)
	{
        this.trigger({state: {isToShowModal: true, avatar: avatar, confirmFunction: confirmFunction, cancelFunction: cancelFunction}});
	}
}

module.exports = new SelectAvatarModalStore();
