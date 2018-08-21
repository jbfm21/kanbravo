'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = '{customClass} actions';

export default class Actions extends AbstractDivContainer
{
    static displayName = 'Actions';

    constructor()
    {
        super(defaultClassName);
    }
}
