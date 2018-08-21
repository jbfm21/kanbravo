'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '';

export default class Panel extends AbstractDivContainer
{
    static displayName = 'Panel';

    constructor()
    {
        super(defaultClassName);
    }
}
