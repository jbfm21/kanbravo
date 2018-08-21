import React, {Component} from 'react';
import * as d3 from 'd3';

export default class DonutChartShadow extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        data: React.PropTypes.array,
        pie: React.PropTypes.func,
        color: React.PropTypes.func,
        innerRadiusRatio: React.PropTypes.number,
        shadowSize: React.PropTypes.number
    };

    static defaultProps =
    {
        shadowSize: 10
    };

    componentWillMount()
    {

        let radius = this.props.height;

        let outerRadius = radius / this.props.innerRadiusRatio + 1;
        let innerRadius = outerRadius - this.props.shadowSize;

        this.arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

        this.transform = 'translate(' + radius / 2 + ',' + radius / 2 + ')';
    }

    createChart(_self)
    {
        let paths = (this.props.pie(this.props.data)).map(function(d, i)
        {
            let c = d3.hsl(_self.props.color(i));
            c = d3.hsl((c.h + 5), (c.s - 0.07), (c.l - 0.10));
            return (
                <path fill={c} d={_self.arc(d)} key={i}/>
            );
        });
        return paths;
    }

    render()
    {
        let paths = this.createChart(this);
        return (
            <g transform={this.transform}>
                {paths}
            </g>
        );
    }

}
