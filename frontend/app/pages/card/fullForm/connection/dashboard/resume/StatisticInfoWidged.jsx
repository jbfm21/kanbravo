import React, {Component, PropTypes} from 'react';
import {Label} from 'react-semantify';
import {Statistic, SimpleLabel} from '../../../../../../components';
import {FunctionHelper} from '../../../../../../commons';

export default class StatisticInfoWidged extends Component
{
    static propTypes =
    {
        isToRender: PropTypes.bool,
        altText: PropTypes.string,
        widgedStyle: PropTypes.object,
        title: PropTypes.string,
        value: PropTypes.any,
        meta: PropTypes.any,
        isToRenderMeta: PropTypes.bool,
        valueClassName: PropTypes.string
    };


    static defaultProps =
    {
        isToRenderMeta: true,
        isToRender: true
    }

    render()
    {
        const {isToRender, altText, widgedStyle, value, title, meta, isToRenderMeta, valueClassName} = this.props;
        return (
            <Statistic isToRender={isToRender} style={widgedStyle.statistic} title={altText}>
                <Label className={valueClassName} style={widgedStyle.valueLabel} isToRender={FunctionHelper.isDefined(value)}>{value}</Label>
                <SimpleLabel style={widgedStyle.titleLabel} isToRender={FunctionHelper.isDefined(title)}>{title}</SimpleLabel>
                <SimpleLabel isToRender={isToRenderMeta && FunctionHelper.isDefined(meta)} style={widgedStyle.metaInfoLabel}>{meta}</SimpleLabel>
            </Statistic>
        );

    }
}
