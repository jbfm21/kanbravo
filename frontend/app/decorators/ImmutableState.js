'use strict';

import {default as mixin} from './mixin';

const ImmutableState = mixin({
    setImmutableStateField(fn)
    {
        return this.setState(({data}) => ({data: fn(data)}));
    },
    setImmutableState(object)
    {
        let newState = null;
        for (let property in object) //eslint-disable-line guard-for-in
        {
            newState = this.setImmutableStateField(d => d.set(property, object[property]));
        }
        return newState;
    }
});

module.exports = ImmutableState;
