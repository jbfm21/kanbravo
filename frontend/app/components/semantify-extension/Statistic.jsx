'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} statistic';

export default class Statistic extends AbstractDivContainer
{
    static displayName = 'Statistic';

    constructor()
    {
        super(defaultClassName);
    }
}
