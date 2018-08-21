'use strict';

import React from 'react';

class ReactInterval extends React.Component
{

    static displayName = 'ReactInterval';
    static propTypes =
    {
        callback: React.PropTypes.func.isRequired,
        enabled: React.PropTypes.bool,
        timeout: React.PropTypes.number
    }

    static defaultProps =
    {
        enabled: false,
        timeout: 1000
    };

    constructor(props)
    {
        super(props);
        this.state = {enabled: props.enabled};
    }

    componentDidMount()
    {
        if (this.props.enabled)
        {
            this.start();
        }
    }

    componentWillReceiveProps({enabled})
    {
        this.setState({enabled});
    }

    /*shouldComponentUpdate(nextProps, nextState)
    {
        return (this.state.enabled !== nextState.enabled || this.props.timeout !== nextProps.timeout || this.props.callback !== nextProps.callback);
    }*/

    componentWillUnmount()
    {
        this.stop();
    }


    callback = () =>
    {
        this.props.callback();
        this.start();
    }


    start()
    {
        this.stop();
        this.timer = setTimeout(this.callback, this.props.timeout);
    }

    stop()
    {
        clearTimeout(this.timer);
    }

    render()
    {
        if (this.state.enabled)
        {
            this.start();
        }
        else
        {
            this.stop();
        }
        return false;
    }
}

module.exports = ReactInterval;
