'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} value';

export default class SimpleValue extends AbstractDivContainer
{
    static displayName = 'SimpleValue';

    constructor()
    {
        super(defaultClassName);
    }
}
