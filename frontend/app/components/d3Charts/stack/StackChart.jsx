import React, {Component} from 'react';
import * as d3 from 'd3';
import {D3Grid, D3Axis, ResizeChart} from '../utils';


@ResizeChart
export default class StackChart extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        chartId: React.PropTypes.string,
        data: React.PropTypes.array.isRequired,
        xData: React.PropTypes.string.isRequired,
        margin: React.PropTypes.object,
        keys: React.PropTypes.array,
        color: React.PropTypes.array,
        twoColorScheme: React.PropTypes.bool
    };

    static defaultProps =
    {
        width: 800,
        height: 300,
        chartId: 'v1_chart',
        interpolations: 'linear',
        margin: {
            top: 5, right: 5, bottom: 5, left: 5
        },
        color: []
    };

    constructor(props)
    {
        super(props);
        this.w = 0;
        this.h = 0;
        this.xScale = null;
        this.yScale = null;
        this.transform = null;
        this.stacked = null;
    }

    createChart(_self)
    {

        if (this.props.color.length > 0)
        {
            this.color = d3.scaleOrdinal()
                .range(this.props.color);
        }
        else
        {
            this.color = d3.scaleOrdinal(d3.schemeCategory20);
        }

        this.w = this.props.width - (this.props.margin.left + this.props.margin.right);
        this.h = this.props.height - (this.props.margin.top + this.props.margin.bottom);

        let data = _self.props.keys.map(function(key,i) //eslint-disable-line
        {
            let a =  _self.props.data.map(function(d,j) //eslint-disable-line
            {
                return {x: d[_self.props.xData], y: d[key]};
            });
            return a;
        });

        this.stacked = d3.stack()
            .keys(this.props.keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)(data);

        this.xScale = d3.scaleBand().rangeRound([0, this.w], 0.35)
            .domain(data[0].map(function(d) { return d.x; }));

        this.yScale = d3.scaleLinear()
            .range([this.h, 0])
            .domain([0, d3.max(this.stacked[this.stacked.length - 1], function(d) { return d.y0 + d.y; })])
            .nice();

        this.transform = 'translate(' + this.props.margin.left + ',' + this.props.margin.top + ')';

    }

    createElements(element, i)
    {
        let object;

        switch (element.type)
        {
            case 'xGrid':
                object = <D3Grid h={this.h} len={this.h} scale={this.xScale} gridType="x" key={i} {...this.props} {...element.props}/>;
                break;

            case 'yGrid':
                object = <D3Grid h={this.h} len={this.w} scale={this.yScale} gridType="y" key={i} {...this.props} {...element.props}/>;
                break;

            case 'xAxis':
                object = <D3Axis h={this.h} scale={this.xScale} axisType="x" key={i} {...this.props} {...element.props}/>;
                break;

            case 'yAxis':
                object = <D3Axis h={this.h} scale={this.yScale} axisType="y" key={i} {...this.props} {...element.props}/>;
                break;

            default: break;
        }
        return object;
    }

    render()
    {
        this.createChart(this);

        let elements;
        let _self = this;

        if (this.props.children !== null)
        {
            if (Array.isArray(this.props.children))
            {
                elements = this.props.children.map(function(element, i)
                {
                    return _self.createElements(element, i);
                });
            }
            else
            {
                elements = this.createElements(this.props.children, 0);
            }
        }


        let bars = _self.stacked.map(function(data, i)
        {

            let rects = data.map(function(d, j)
            {
                let fill = '';

                if (_self.props.twoColorScheme)
                {

                    fill = _self.color(j);
                    if (i > 0)
                    {
                        fill = '#e8e8e9';
                    }

                }

                return (<rect x={_self.xScale(d.x)} y={_self.yScale(d.y + d.y0)} fill={fill}
                              height={_self.yScale(d.y0) - _self.yScale(d.y + d.y0)} width={_self.xScale()} key={j}/>);

            });

            let fill;
            if (!_self.props.twoColorScheme)
            {
                fill = _self.color(i);
            }

            return (<g key={i} fill={fill}>
                {rects}
            </g>);
        });

        return (
            <div>
                <svg id={this.props.chartId} width={'100%'} height={this.props.height}>
                    <g transform={this.transform}>
                        {elements}
                        {bars}
                    </g>
                </svg>
            </div>
        );
    }

}

