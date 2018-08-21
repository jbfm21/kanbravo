'use strict';

import React from 'react';

import FunctionHelper from './FunctionHelper';

const defaultClassName = '{customClass} menu';

export default class MenuItems extends React.Component
{

    static displayName = 'MenuItems';

    static propTypes =
    {
        children: React.PropTypes.node
    };

    render()
    {
        let {...other} = this.props; //eslint-disable-line no-use-before-define
        return (
            <div {...other} className={FunctionHelper.getClassName(this.props, defaultClassName)} >
                {this.props.children}
            </div>
        );
    }
}
