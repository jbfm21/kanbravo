'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} loader';

export default class Loader extends AbstractDivContainer
{
    static displayName = 'Loader';

    constructor()
    {
        super(defaultClassName);
    }
}
