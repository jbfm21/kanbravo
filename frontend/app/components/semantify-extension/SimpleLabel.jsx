'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} label';

export default class SimpleLabel extends AbstractDivContainer
{
    static displayName = 'SimpleLabel';

    constructor()
    {
        super(defaultClassName);
    }
}
