'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} progress';

export default class BasicProgress extends AbstractDivContainer
{
    static displayName = 'BasicProgress';

    constructor()
    {
        super(defaultClassName);
    }
}
