'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} meta';

export default class Meta extends AbstractDivContainer
{
    static displayName = 'Meta';

    constructor()
    {
        super(defaultClassName);
    }
}
