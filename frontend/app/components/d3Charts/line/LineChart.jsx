import React, {Component} from 'react';
import * as d3 from 'd3';
import {default as DataSeries} from './DataSeries.jsx';

export default class LineChart extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        data: React.PropTypes.object.isRequired
    };

    static defaultProps =
    {
        width: 600,
        height: 300
    };

    render()
    {
        let {width, height, data} = this.props;

        let xScale = d3.scalePoint()
            .domain(data.xValues)
            .range([0, width]);

        let yScale = d3.scaleLinear()
            .range([height, 10])
            .domain([data.yMin, data.yMax]);

        return (
            <svg width={width} height={height}>
                <DataSeries
                    xScale={xScale}
                    yScale={yScale}
                    data={data}
                    width={width}
                    height={height}
                />
            </svg>
        );
    }
}
