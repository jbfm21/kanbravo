'use strict';

import * as airflux from 'airflux';
import _ from 'lodash';

import {UIActions} from '../../../actions';

class TextEditModalStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.showTextEditModal, this._onTextEditModalShow);
    }

    _onTextEditModalShow(text, confirmFunction, cancelFunction, options)
	{
        let actualOptions = _.defaults(options || {},
        {
            maxLength: null
        });
        this.trigger({state: {isToShowModal: true, text: text, confirmFunction: confirmFunction, cancelFunction: cancelFunction, options: actualOptions}});
	}
}

module.exports = new TextEditModalStore();
