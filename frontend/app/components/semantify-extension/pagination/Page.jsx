'use strict';

import React from 'react';
import classNames from 'classnames';

export default class Page extends React.Component
{
    static displayName = 'Page';

    static propTypes = {
        pageText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        pageNumber: React.PropTypes.number.isRequired,
        onClick: React.PropTypes.func.isRequired,
        isActive: React.PropTypes.bool.isRequired,
        disabled: React.PropTypes.bool
    };

    render()
    {
        let el;
        let className = classNames({'ui small basic inverted blue button item active': this.props.isActive, 'ui small basic button item': !this.props.isActive});
        let style = {color: 'black !important', fontWeight: 'bold !important'};
        let text = this.props.pageText || this.props.pageNumber;
        if (React.isValidElement(text))
        {
            el = text;
        }
        else
        {
            el = (
                <button className={className} onClick={this.props.onClick} value={this.props.pageNumber} disabled={this.props.disabled} style={style}>
                    {text}
                </button>
            );
        }
        return el;
    }
}
