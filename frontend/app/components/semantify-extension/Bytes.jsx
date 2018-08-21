'use strict';

import React from 'react';

export default class Bytes extends React.Component
{
    static displayName = 'Bytes';

    static propTypes =
    {
        bytes: React.PropTypes.number
    };

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return this.props.bytes !== nextProps.bytes;
    }

    formatBytes()
    {
        var i = Math.floor(Math.log(this.props.bytes) / Math.log(1024));
        return !this.props.bytes && '0 Bytes' || (this.props.bytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i];
    }

    render()
    {
        return (
            <span>{this.formatBytes()}</span>
        );
    }

}
