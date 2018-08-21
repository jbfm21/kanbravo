'use strict';

import * as airflux from 'airflux';
import {UIActions} from '../../../actions';

class RichTextEditModalStore extends airflux.Store
{
    constructor()
    {
        super();
        this.listenTo(UIActions.showRichTextEditModal, this._onRichTextEditModalShow);
    }

    _onRichTextEditModalShow(text, textFormat, confirmFunction, cancelFunction)
	{
        this.trigger({state: {isToShowModal: true, text: text, textFormat: textFormat, confirmFunction: confirmFunction, cancelFunction: cancelFunction}});
	}
}

module.exports = new RichTextEditModalStore();
