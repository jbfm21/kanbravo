'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} container';

export default class Container extends AbstractDivContainer
{
    static displayName = 'Container';

    constructor()
    {
        super(defaultClassName);
    }
}
