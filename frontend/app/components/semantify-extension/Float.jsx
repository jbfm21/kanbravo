'use strict';

import {default as AbstractSpanContainer} from './AbstractSpanContainer.jsx';

const defaultClassName = '{customClass} floated content';

export default class Float extends AbstractSpanContainer
{
    static displayName = 'Float';

    constructor()
    {
        super(defaultClassName);
    }
}
