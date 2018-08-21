'use strict';

import React from 'react';
import classNames from 'classnames';

export default class FormToast extends React.Component
{
    static displayName = 'FormToast';

    static propTypes =
    {
        kind: React.PropTypes.string,
        message: React.PropTypes.string
    };

    static defaultProps =
    {
         kind: 'negative'
    }

    shouldComponentUpdate(nextProps, nextState)  //eslint-disable-line no-unused-vars
    {
        return this.props.message !== nextProps.message || this.props.kind !== nextProps.kind;
    }

    render()
    {
        let {message, kind, ...other} = this.props; //eslint-disable-line no-use-before-define
        let toastClass = classNames('ui', kind, 'message');
        return (
            <div className="formToast container">
                {message && <div className={toastClass} {...other}>{message}</div>}
            </div>
        );
    }
}
