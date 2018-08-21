'use strict';

import {default as AbstractSpanContainer} from './AbstractSpanContainer.jsx';

const defaultClassName = '{customClass} floated content';

export default class SpanContainer extends AbstractSpanContainer
{
    static displayName = 'SpanContainer';

    constructor()
    {
        super(defaultClassName);
    }
}
