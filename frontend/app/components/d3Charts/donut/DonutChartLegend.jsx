import React, {Component} from 'react';

export default class DonutChartLegend extends Component
{
    static propTypes =
    {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        data: React.PropTypes.array,
        pie: React.PropTypes.func,
        color: React.PropTypes.func,
        label: React.PropTypes.string,
        radius: React.PropTypes.number
    };

    createChart(_self)
    {
        let texts = (this.props.pie(this.props.data)).map(function (d, i)
        {
            let transform = 'translate(10,' + i * 30 + ')';
            let rectStyle = {
                fill: _self.props.color(i),
                stroke: _self.props.color(i)
            };

            let textStyle = {
                fill: _self.props.color(i)
            };

            return (
                <g transform={transform} key={i}>
                    <rect width="20" height="20" style={rectStyle} rx={_self.props.radius} ry={_self.props.radius}/>
                    <text x="30" y="15" className="browser-legend" style={textStyle}>{d.data[_self.props.label]}</text>
                </g>
            );
        });
        return texts;
    }

    render()
    {

        let style = {
            visibility: 'visible'
        };

        if (this.props.width <= this.props.height + 70)
        {
            style.visibility = 'hidden';
        }

        let texts = this.createChart(this);
        let legendY = this.props.height / 2 - this.props.data.length * 30 / 2;


        let transform = 'translate(' + (this.props.width / 2 + 80) + ',' + legendY + ')';
        return (
            <g is transform={transform} style={style}>
                {texts}
            </g>
        );
    }

}
