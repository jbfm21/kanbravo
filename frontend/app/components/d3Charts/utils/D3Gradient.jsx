import React, {Component} from 'react';

export default class D3Gradient extends Component
{
    static propTypes =
    {
        id: React.PropTypes.string,
        color1: React.PropTypes.string,
        color2: React.PropTypes.string
    };

    render()
    {
        return (
            <defs>
                <linearGradient is id={this.props.id} x1="0%" y1="100%" x2="0%" y2="0%" spreadMethod="pad">
                    <stop is offset="10%" stop-color={this.props.color1} stop-opacity={0.4}/>
                    <stop is offset="80%" stop-color={this.props.color2} stop-opacity={1}/>
                </linearGradient>
            </defs>
        );
    }
}
