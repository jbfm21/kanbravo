import React, {Component} from 'react';
import * as d3 from 'd3';
import {ResizeChart} from '../utils';

@ResizeChart
export default class BarChart extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        chartId: React.PropTypes.string
    };

    static defaultProps =
    {
        width: 300,
        height: 70,
        chartId: 'v_chart'
    };

    constructor(props)
    {
        super(props);
        this.state = {width: 0};
    }
    render()
    {

        let margin = {top: 5, right: 5, bottom: 5, left: 5};
        let w = this.state.width - (margin.left + margin.right); //eslint-disable-line
        let h = this.props.height - (margin.top + margin.bottom);

        let transform = 'translate(' + margin.left + ',' + margin.top + ')';

        let x = d3.scaleOrdinal()
            .domain(this.props.data.map(function(d)
            {
                return d.month;
            }))
            .rangeRoundBands([0, this.state.width], 0.35);

        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([this.props.height, 0]);

        let rectBackground = (this.props.data).map(function(d, i)
        {
            return (
                <rect fill="#58657f" rx="3" ry="3" key={i}
                      x={x(d.month)} y={margin.top - margin.bottom}
                      height={h}
                      width={x.rangeBand()}/>
            );
        });

        let rectForeground = (this.props.data).map(function(d, i)
        {
            return (
                <rect fill="#74d3eb" rx="3" ry="3" key={i}
                      x={x(d.month)} y={y(d.value)} className="shadow"
                      height={h - y(d.value)}
                      width={x.rangeBand()}/>
            );
        });

        return (
            <div>
                <svg id={this.props.chartId} width={this.state.width}
                     height={this.props.height}>

                    <g transform={transform}>
                        {rectBackground}
                        {rectForeground}
                    </g>
                </svg>
            </div>
       );
    }

}
