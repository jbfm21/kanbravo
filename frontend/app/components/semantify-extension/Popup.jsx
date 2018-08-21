'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} popup';

export default class Popup extends AbstractDivContainer
{
    static displayName = 'Popup';

    constructor()
    {
        super(defaultClassName);
    }
}
