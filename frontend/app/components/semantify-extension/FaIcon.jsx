'use strict';

import React from 'react';

import Unit from './Unit.jsx';
import FunctionHelper from './FunctionHelper';

const defaultClassName = 'fa {customClass}';

export default class FaIcon extends React.Component
{
    static displayName = 'FaIcon';

    static propTypes =
    {
        children: React.PropTypes.node
    };

    render()
    {
        let {...other} = this.props; //eslint-disable-line no-use-before-define
        return (
            <Unit type="icon"
                unitClassName={FunctionHelper.getClassName(this.props, defaultClassName)}
                color={FunctionHelper.getColor(this.props)}
                {...other}
            >
                {this.props.children}
            </Unit>
        );
    }
}
