'use strict';

import React from 'react';
import FunctionHelper from './FunctionHelper';

const defaultClassName = 'ui {customClass} button';

export default class Button extends React.Component
{
    static displayName = 'Button';

    static propTypes =
    {
        children: React.PropTypes.node,
        accessKey: React.PropTypes.string
    };

    render()
    {
        let {disable, ...other} = this.props; //eslint-disable-line
        return (
            <button {...other} className={FunctionHelper.getClassName(this.props, defaultClassName)} accessKey={this.props.accessKey}>
                {this.props.children}
            </button>
        );
    }
}
