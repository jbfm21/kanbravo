'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} buttons';

export default class Buttons extends AbstractDivContainer
{
    static displayName = 'Buttons';

    constructor()
    {
        super(defaultClassName);
    }
}
