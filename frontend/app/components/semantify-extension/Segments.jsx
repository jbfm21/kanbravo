'use strict';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} segments';

export default class Segments extends AbstractDivContainer
{
    static displayName = 'Segments';

    constructor()
    {
        super(defaultClassName);
    }
}
