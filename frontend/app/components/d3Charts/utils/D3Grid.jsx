import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

export default class D3Grid extends Component
{
    static propTypes =
    {
        h: React.PropTypes.number,
        len: React.PropTypes.number,
        scale: React.PropTypes.func,
        gridType: React.PropTypes.oneOf(['x', 'y']),
        orient: React.PropTypes.oneOf(['left', 'top', 'right', 'bottom']),
        className: React.PropTypes.string,
        ticks: React.PropTypes.number
    };

    componentDidMount() {this.renderGrid();}
    componentDidUpdate() {this.renderGrid();}

    renderGrid()
    {
        let grid = null;
        switch (this.props.orient)
        {
            case 'left': grid = d3.axisLeft(); break;
            case 'top': grid = d3.axisTop(); break;
            case 'right': grid = d3.axisRight(); break;
            case 'bottom': grid = d3.axisBottom(); break;
            default: grid = d3.axisLeft(); break;
        }
        grid = grid
            .scale(this.props.scale)
            .ticks(this.props.ticks)
            .tickSize(-this.props.len, 0, 0)
            .tickFormat('');

        let node = ReactDOM.findDOMNode(this);
        d3.select(node).call(grid);
    }

    render()
    {
        let translate = 'translate(0,' + (this.props.h) + ')';
        return (
            <g className={this.props.className} transform={this.props.gridType === 'x' ? translate : ''}>
            </g>
        );
    }

}
