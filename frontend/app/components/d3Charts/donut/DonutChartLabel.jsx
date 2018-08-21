import React, {Component} from 'react';
import * as d3 from 'd3';

import {FunctionHelper} from '../../../commons';


export default class DonutChartLabel extends Component
{
    static propTypes =
    {
        height: React.PropTypes.number,
        data: React.PropTypes.array,
        pie: React.PropTypes.func,
        formatter: React.PropTypes.func,
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


    createLabels(_self) //eslint-disable-line
    {
        let paths = (this.props.pie(this.props.data)).map(function(d, i) //eslint-disable-line
        {
            let center = 'translate(' + _self.arc.centroid(d) + ')';
            let value = (_self.props.formatter) ? _self.props.formatter(d.value) : d.value;
            return (
                <text key={FunctionHelper.uuid()} fill="white" transform={center} textAnchor="middle" fontSize="15px">{value}</text>
            );
        });
        return paths;
    }

    render()
    {
        let labels = this.createLabels(this);
        return (
            <g transform={this.transform}>
                {labels}
            </g>
        );
    }

}
