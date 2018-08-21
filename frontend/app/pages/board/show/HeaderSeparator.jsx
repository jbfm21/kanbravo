'use strict';

import {AbstractDivContainer} from '../../../components';

const defaultClassName = '{customClass} separator';

export default class HeaderSeparator extends AbstractDivContainer
{
    static displayName = 'HeaderSeparator';

    constructor()
    {
        super(defaultClassName);
    }
}
