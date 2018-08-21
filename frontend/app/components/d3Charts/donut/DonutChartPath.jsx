import React, {Component} from 'react';
import * as d3 from 'd3';

export default class DonutChartPath extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        data: React.PropTypes.array,
        pie: React.PropTypes.func,
        color: React.PropTypes.func,
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

    createChart(_self)
    {
        let paths = (this.props.pie(this.props.data)).map(function(d, i)
        {
            return (
                <path fill={_self.props.color(i)} d={_self.arc(d)} key={i}/>
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
