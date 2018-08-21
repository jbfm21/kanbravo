'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} statistics';

export default class Statistics extends AbstractDivContainer
{
    static displayName = 'Statistics';

    constructor()
    {
        super(defaultClassName);
    }
}
