import React, {Component} from 'react';

export default class D3InsetShadow extends Component
{
    static propTypes =
    {
        id: React.PropTypes.string,
        stdDeviation: React.PropTypes.string,
        floodColor: React.PropTypes.string,
        floodOpacity: React.PropTypes.string
    };

    render()
    {
        return (
            <defs>
                <filter id={this.props.id}>
                    <feOffset dx="0" dy="0"/>
                    <feGaussianBlur is stdDeviation={this.props.stdDeviation} result="offset-blur"/>
                    <feComposite is operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                    <feFlood is flood-color={this.props.floodColor} flood-opacity={this.props.floodOpacity} result="color"/>
                    <feComposite is operator="in" in="color" in2="inverse" result="shadow"/>
                    <feComposite is operator="over" in="shadow" in2="SourceGraphic"/>
                </filter>
            </defs>
        );
    }
}
