'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} metadata';

export default class Metadata extends AbstractDivContainer
{
    static displayName = 'Metadata';

    constructor()
    {
        super(defaultClassName);
    }
}
