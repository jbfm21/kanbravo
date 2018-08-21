import React, {Component} from 'react';
import * as d3 from 'd3';
import {default as Line} from './Line.jsx';

export default class DataSeries extends Component
{
    static propTypes =
    {
        colors: React.PropTypes.func,
        data: React.PropTypes.object,
        interpolationType: React.PropTypes.string
    };

    static defaultProps =
    {
        data: {},
        interpolationType: 'cardinal',
        colors: d3.scaleOrdinal(d3.schemeCategory10),
        xScale: React.PropTypes.func,
        yScale: React.PropTypes.func
    };

    render()
    {
        let {data, colors, xScale, yScale, interpolationType} = this.props; //eslint-disable-line

        let line = d3.line()
            //.interpolate(interpolationType)
            .x((d) => {return xScale(d.x);})
            .y((d) => {return yScale(d.y);});

        let lines = data.points.map((series, id) =>
        {
            return (
                <Line
                    path={line(series)}
                    seriesName={series.name}
                    stroke={colors(id)}
                    key={id}
                />
            );
        });

        return (
            <g>
                <g>{lines}</g>
            </g>
        );
  }
}
