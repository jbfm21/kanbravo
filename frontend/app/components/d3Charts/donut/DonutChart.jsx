import React, {Component} from 'react';
import * as d3 from 'd3';
import {ResizeChart} from '../utils';

import {default as DonutChartLegend} from './DonutChartLegend.jsx';
import {default as DonutChartPath} from './DonutChartPath.jsx';
import {default as DonutChartShadow} from './DonutChartShadow.jsx';
import {default as DonutChartLabel} from './DonutChartLabel.jsx';
import {default as DonutChartInnerLabel} from './DonutChartInnerLabel.jsx';
import {FunctionHelper} from '../../../commons';


@ResizeChart
export default class DonutChart extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        padAngle: React.PropTypes.number,
        id: React.PropTypes.string.isRequired,
        data: React.PropTypes.array.isRequired,
        color: React.PropTypes.array,
        enable3d: React.PropTypes.bool,
        innerRadiusRatio: React.PropTypes.number,
        label: React.PropTypes.string,
        point: React.PropTypes.string
    };

    static defaultProps =
    {
        width: 500,
        height: 250,
        padAngle: 0,
        color: [],
        innerRadiusRatio: 3.3
    };

    constructor(props)
    {
        super(props);
    }


    _getChildrenToRender = () =>
    {
         if (this.props.children === null)
         {
             return [];
         }
         if (!Array.isArray(this.props.children))
         {
            return [this.props.children];
         }
         return this.props.children;
    }

    _renderChildren = (node, pie, color) =>
    {
        if (node.type === 'legend')
        {
            return (<DonutChartLegend key={FunctionHelper.uuid()} pie={pie} color={color} data={this.props.data}
                width={this.props.width} height={this.props.height}
                label={this.props.label} radius={node.props.radius}/>);
        }
        if (node.type === 'label')
        {
            return (<DonutChartLabel key={FunctionHelper.uuid()} formatter={node.props.formatter} height={this.props.height} innerRadiusRatio={this.props.innerRadiusRatio} pie={pie} data={this.props.data}/>);
        }
        if (node.type === 'innerLabel')
        {
            let {children, ...other} = node.props;
            return (<DonutChartInnerLabel key={FunctionHelper.uuid()} height={this.props.height} {...other}>{children}</DonutChartInnerLabel>);
        }
        return null;
    }

    render()
    {

        let shadow;

        let that = this;

        let pie = d3.pie()
            .value(function (d) {return d[that.props.point];})
            .padAngle(this.props.padAngle)
            .sort(null);

        let color = d3.scaleOrdinal().range(this.props.color);

        if (this.props.enable3d)
        {
            shadow = (<DonutChartShadow key={FunctionHelper.uuid()} width={this.props.width} height={this.props.height} innerRadiusRatio={this.props.innerRadiusRatio}
                pie={pie} color={color} data={this.props.data} shadowSize={this.props.shadowSize}/>);
        }

        let childrenToRenders = this._getChildrenToRender();

        return (
            <div>
                <svg id={this.props.id} width={'100%'} height={this.props.height}>
                    {shadow}
                    <DonutChartPath key={FunctionHelper.uuid()} width={this.props.width} height={this.props.height} innerRadiusRatio={this.props.innerRadiusRatio} pie={pie} color={color} data={this.props.data}/>
                    {
                        childrenToRenders.map(node => this._renderChildren(node, pie, color))
                    }
                </svg>
            </div>
        );
    }

}
