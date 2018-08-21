'use strict';

import React from 'react';
import {Link} from 'react-router';

export default class NavLink extends React.Component
{
    static displayName = 'NavLink';

    render()
    {
        return <Link {...this.props} activeClassName="active"/>;
    }
}
