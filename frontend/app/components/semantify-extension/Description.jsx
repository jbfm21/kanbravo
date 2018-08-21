'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} description';

export default class Description extends AbstractDivContainer
{
    static displayName = 'Description';

    constructor()
    {
        super(defaultClassName);
    }
}
