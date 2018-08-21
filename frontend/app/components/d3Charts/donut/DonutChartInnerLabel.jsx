import React, {Component} from 'react';
import * as d3 from 'd3';

export default class DonutChartLabel extends Component
{
    static propTypes =
    {
        height: React.PropTypes.number,
        innerRadiusRatio: React.PropTypes.number
    };

    componentWillMount()
    {

        let radius = this.props.height;

        let outerRadius = radius / 2;
        let innerRadius = radius / this.props.innerRadiusRatio;

        this.arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

        this.transform = 'translate(' + radius / 2 + ',' + radius / 2 + ')';
    }

    render()
    {
        let {children, ...other} = this.props;
        return (
            <g transform={this.transform}>
                <text textAnchor="middle" {...other}>
                    {children}
                </text>
            </g>
        );
    }

}
