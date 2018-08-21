'use strict';

import {default as mixin} from './mixin';

const ImmutableShouldUpdateComponent = mixin({
    shouldComponentUpdate(nextProps, nextState)
    {
        return (this.state.data !== nextState.data);
    }
});

module.exports = ImmutableShouldUpdateComponent;
