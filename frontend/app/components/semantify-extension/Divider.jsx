'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} divider';

export default class Divider extends AbstractDivContainer
{
    static displayName = 'Divider';

    constructor()
    {
        super(defaultClassName);
    }
}
