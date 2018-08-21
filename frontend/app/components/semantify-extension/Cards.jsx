'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} cards';

export default class Cards extends AbstractDivContainer
{
    static displayName = 'Cards';

    constructor()
    {
        super(defaultClassName);
    }
}
