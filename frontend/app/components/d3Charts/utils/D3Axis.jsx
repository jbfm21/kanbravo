import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

export default class D3Axis extends Component
{
    static propTypes =
    {
        h: React.PropTypes.number,
        scale: React.PropTypes.func,
        axisType: React.PropTypes.oneOf(['x', 'y']),
        orient: React.PropTypes.oneOf(['left', 'top', 'right', 'bottom']),
        className: React.PropTypes.string,
        tickFormat: React.PropTypes.string,
        ticks: React.PropTypes.number
    };

    componentDidMount() {this.renderAxis();}

    componentDidUpdate() {this.renderAxis();}

    renderAxis()
    {
        let axis = null;
        switch (this.props.orient)
        {
            case 'left': axis = d3.axisLeft(); break;
            case 'top': axis = d3.axisTop(); break;
            case 'right': axis = d3.axisRight(); break;
            case 'bottom': axis = d3.axisBottom(); break;
            default: axis = d3.axisLeft(); break;
        }

        axis = axis.scale(this.props.scale).ticks(this.props.ticks);

        if (this.props.tickFormat !== null && this.props.axisType === 'x')
        {
            axis.tickFormat(d3.timeFormat(this.props.tickFormat));
        }

        let node = ReactDOM.findDOMNode(this);
        d3.select(node).call(axis);
    }

    render()
    {
        let translate = 'translate(0,' + (this.props.h) + ')';
        return (
            <g className={this.props.className} transform={this.props.axisType === 'x' ? translate : ''} >
            </g>
        );
    }

}
