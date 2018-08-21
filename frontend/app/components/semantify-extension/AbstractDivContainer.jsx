'use strict';

import React from 'react';

import Unit from './Unit.jsx';
import FunctionHelper from './FunctionHelper';

export default class AbstractDivContainer extends React.Component
{
    static displayName = 'AbstractDivContainer';

    static propTypes =
    {
        children: React.PropTypes.node
    };

    constructor(defaultClassName)
    {
        super();
        this.defaultClassName = defaultClassName;
    }

    render()
    {
        let {...other} = this.props; //eslint-disable-line no-use-before-define
        return (
            <Unit {...other}
                unitClassName={FunctionHelper.getClassName(this.props, this.defaultClassName)}
                type="div"
                color={FunctionHelper.getColor(this.props)}
            >
                {this.props.children}
            </Unit>
        );
    }
}
