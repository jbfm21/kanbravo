'use strict';

import React from 'react';

import FunctionHelper from './FunctionHelper';

const defaultClassName = '{customClass} progress-bar';

export default class ProgressBar extends React.Component
{
    static displayName = 'ProgressBar';

    static propTypes =
    {
        children: React.PropTypes.node,
        percent: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        label: React.PropTypes.string,
        style: React.PropTypes.object,
        show: React.PropTypes.oneOf(['percent', 'labelOnly'])
    };

    _getBody(style, show)
    {
        switch (show)
        {
            case 'percent': return style.width;
            case 'labelOnly': return '';
            default: return this.props.children;
        }
    }

    render()
    {
        let {style, percent, show, ...other} = this.props; //eslint-disable-line no-use-before-define
        if (percent === 0)
        {
            return null;
        }
        if (FunctionHelper.isUndefined(style))
        {
            style = {width: null};
        }
        style.width = `${percent}%`;
        let bodyToRender = this._getBody(style, show);
            return (
            <div style={style} {...other} className={FunctionHelper.getClassName(this.props, defaultClassName)} >
                {this.props.label} {bodyToRender}
            </div>
        );
    }
}
