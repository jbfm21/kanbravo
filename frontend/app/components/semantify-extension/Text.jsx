'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} text';

export default class Text extends AbstractDivContainer
{
    static displayName = 'text';

    constructor()
    {
        super(defaultClassName);
    }
}
