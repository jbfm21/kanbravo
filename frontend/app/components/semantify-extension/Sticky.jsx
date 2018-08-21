'use strict';

import React from 'react';

import FunctionHelper from './FunctionHelper';

import {default as AbstractDivContainer} from './AbstractDivContainer.jsx';

const defaultClassName = 'ui {customClass} sticky';

export default class Cards extends AbstractDivContainer
{
    static displayName = 'Cards';

    static propTypes =
    {
        children: React.PropTypes.node
    };

    constructor()
    {
        super();
        this.defaultClassName = defaultClassName;
    }

    componentDidMount()
    {
        if (typeof this.props.init !== 'undefined')
        {
            if (this.props.init === false)
            {
                return;
            }
            if (this.props.init === true)
            {
                $(this.refs.sticky).sticky(); //eslint-disable-line
                console.log($(this.refs.sticky).sticky);  //eslint-disable-line
            }
            else
            {
                 $(this.refs.sticky).sticky(this.props.init); //eslint-disable-line
                 console.log($(this.refs.sticky).sticky, this.props.init);  //eslint-disable-line
            }
        }
    }

    render()
    {
        let {...other} = this.props; //eslint-disable-line no-use-before-define
        return (
            <div {...other} className={FunctionHelper.getClassName(this.props, this.defaultClassName)} ref="sticky">
                {this.props.children}
            </div>
        );
    }
}

