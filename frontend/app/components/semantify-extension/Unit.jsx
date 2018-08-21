'use strict';

import React from 'react';
import classSet from 'classnames';

export default class Unit extends React.Component
{
    static displayName = 'Unit';

    static propTypes =
    {
        unitClassName: React.PropTypes.string,
        type: React.PropTypes.string.isRequired,
        color: React.PropTypes.string.isRequired,
        value: React.PropTypes.string,
        disabled: React.PropTypes.string,
        active: React.PropTypes.string,
        loading: React.PropTypes.string,
        focus: React.PropTypes.string,
        error: React.PropTypes.string,
        invisible: React.PropTypes.bool,
        completed: React.PropTypes.string,
        readOnly: React.PropTypes.string,
        children: React.PropTypes.node,
        isToRender: React.PropTypes.bool
    };

    static defaultProps =
    {
        isToRender: true
    };


    constructor()
    {
        super();
    }

    _generateClassName = () =>
    {
        let className = this.props.unitClassName;

        if (this.props.color !== 'null')
        {
            className += ' ' + this.props.color;
        }

        className += ' ' + classSet({
            disabled: this.props.disabled,
            active: this.props.active,
            loading: this.props.loading,
            focus: this.props.focus,
            error: this.props.error,
            completed: this.props.completed,
            'read-only': this.props.readOnly
        });
        if (this.props.invisible)
        {
            className += ' ' + classSet({invisible: 'invisible'});
        }
        return className;
    };

    render()
    {
        let {type, value, unitClassName, color, invisble, completed, children, disabled, active, loading, focus, error, readonly, init, isToRender, ...other} = this.props; //eslint-disable-line
        if (!isToRender)
        {
            return null;
        }
        switch (type)
        {

            case 'link':
                return (
                    <a {...other} className={this._generateClassName()} data-value={value}>
                        {this.props.children}
                    </a>
                );
            case 'icon':
                return (
                    <i {...other} className={this._generateClassName()} data-value={value}>
                        {this.props.children}
                    </i>
                );
            case 'img':
                return (
                    <img {...other} className={this._generateClassName()}>
                        {this.props.children}
                    </img>
                );
            case 'span':
                return (
                    <span {...other} className={this._generateClassName()} data-value={value}>
                        {this.props.children}
                    </span>
                );

            case 'div':
            default:
                return (
                    <div {...other} className={this._generateClassName()} data-value={value}>
                        {this.props.children}
                    </div>
                );
        }
    }
}
