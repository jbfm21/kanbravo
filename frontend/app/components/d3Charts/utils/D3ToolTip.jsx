import React, {Component} from 'react';

export default class D3ToolTip extends Component
{
    static propTypes =
    {
        tooltip: React.PropTypes.object,
        bgStyle: React.PropTypes.string,
        textStyle1: React.PropTypes.string,
        textStyle2: React.PropTypes.string,
        keyLabel: React.PropTypes.string,
        valueLabel: React.PropTypes.string,
        keyFormat: React.PropTypes.func,
        valueFormat: React.PropTypes.func
    };
    render()
    {
        let visibility = 'hidden';
        let transform = '';
        let x = 0;
        let y = 0;
        let width = 150;
        let height = 70;
        let transformText = 'translate(' + width / 2 + ',' + (height / 2 - 5) + ')';
        let transformArrow = '';

        if (this.props.tooltip.display === true)
        {
            let position = this.props.tooltip.pos;

            x = position.x;
            y = position.y;
            visibility = 'visible';

            if (y > height)
            {
                transform = 'translate(' + (x - width / 2) + ',' + (y - height - 20) + ')';
                transformArrow = 'translate(' + (width / 2 - 20) + ',' + (height - 0.2) + ')';
            }
            else if (y < height)
            {
                transform = 'translate(' + (x - width / 2) + ',' + (Math.round(y) + 20) + ')';
                transformArrow = 'translate(' + (width / 2 - 20) + ',' + 0 + ') rotate(180,20,0)';
            }
        }
        else
        {
            visibility = 'hidden';
        }

        let keyValueToShow = (this.props.keyFormat) ? this.props.keyFormat(this.props.tooltip.data.key) : this.props.tooltip.data.key;
        let valueValueToShow = (this.props.valueFormat) ? this.props.valueFormat(this.props.tooltip.data.value) : this.props.tooltip.data.value;

        return (
            <g transform={transform}>
                <rect class={this.props.bgStyle} is width={width} height={height} rx="5" ry="5" visibility={visibility}/>
                <polygon class={this.props.bgStyle} is points="10,0  30,0  20,10" transform={transformArrow} visibility={visibility}/>
                <text is visibility={visibility} transform={transformText}>
                    <tspan is x="0" class={this.props.textStyle1} text-anchor="middle">{this.props.keyLabel + ' : ' + keyValueToShow}</tspan>
                    <tspan is x="0" class={this.props.textStyle2} text-anchor="middle" dy="25">{this.props.valueLabel + ' : ' + valueValueToShow}</tspan>
                </text>
            </g>
        );
    }

}
