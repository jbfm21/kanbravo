'use strict';

import ReactDOM from 'react-dom';

import {default as mixin} from './mixin';

const ResizeChart = mixin(
{
    componentWillMount()
    {
        var _self = this;

        $(window).on('resize', function(e) //eslint-disable-line
        {
            _self.updateSize();
        });

        this.setState({width: this.props.width});
    },

    componentDidMount()
    {
        this.updateSize();
    },

    componentWillUnmount()
    {
        $(window).off('resize'); //eslint-disable-line
    },

    updateSize()
    {
        var node = ReactDOM.findDOMNode(this);

        var parentWidth = $(node).width(); //eslint-disable-line

        if (parentWidth < this.props.width)
        {
            this.setState({width: parentWidth - 20});
        }
        else
        {
            this.setState({width: this.props.width});
        }
    }
});

module.exports = ResizeChart;
