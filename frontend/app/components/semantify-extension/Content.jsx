'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass}  content';

export default class Content extends AbstractDivContainer
{
    static displayName = 'Content';

    constructor()
    {
        super(defaultClassName);
    }
}
