import React from 'react';
import pureRender from 'pure-render-decorator';
import {_} from 'lodash';

import {default as FaIcon} from './FaIcon.jsx';
import {FunctionHelper} from '../../commons';


@pureRender
export default class Avatar extends React.Component
{
    static displayName = 'Avatar';

    static propTypes =
    {
        title: React.PropTypes.string,
        avatar: React.PropTypes.object,

        hostClassName: React.PropTypes.string,
        hostStyle: React.PropTypes.object,

        className: React.PropTypes.string,
        style: React.PropTypes.object,

        isToShowBackGroundColor: React.PropTypes.bool,
        isToShowBorder: React.PropTypes.bool,
        isToShowSmallBorder: React.PropTypes.bool,
        isSquareImageDimension: React.PropTypes.bool,

        onClick: React.PropTypes.func

    };

    static defaultProps =
    {
        avatar: {backgroundColor: null, foreColor: null, name: null, icon: null, imageSrc: null, letter: null},
        hostStyle: {width: '100%', height: '100%'},
        isToShowBorder: true,
        isToShowSmallBorder: false,
        isSquareDimension: false
    };

    constructor()
    {
        super();
    }

    componentWillMount()
    {
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line no-unused-vars
    {
        return (this.props.avatar.backgroundColor !== nextProps.avatar.backgroundColor) ||
             (this.props.avatar.foreColor !== nextProps.avatar.foreColor) ||
             (this.props.avatar.backgroundColor !== nextProps.avatar.backgroundColor) ||
             (this.props.avatar.borderColor !== nextProps.avatar.borderColor) ||
             (this.props.avatar.borderWidth !== nextProps.avatar.borderWidth) ||
             (this.props.avatar.borderRadius !== nextProps.avatar.borderRadius) ||
             (this.props.avatar.name !== nextProps.avatar.name) ||
             (this.props.avatar.icon !== nextProps.avatar.icon) ||
             (this.props.avatar.letter !== nextProps.avatar.letter) ||
             (this.props.avatar.imageSrc !== nextProps.avatar.imageSrc) ||
             (this.props.isToShowBackGroundColor !== nextProps.isToShowBackGroundColor) ||
             (this.props.className !== nextProps.className) ||
             (this.props.style !== nextProps.style) ||
             (this.props.title !== nextProps.title) ||
             (this.props.hostClassName !== nextProps.hostClassName) ||
             (this.props.hostStyle !== nextProps.hostStyle);
    }

    getInitials = (name) =>
    {
        var parts = name.split(' ');
        var initials = '';
        initials += parts[0].substr(0, 1).toUpperCase();
        if (parts.length > 1)
        {
            initials += parts[parts.length - 1].substr(0, 1).toUpperCase();
        }
        return initials;
    };

    getVisualType = () =>
    {
        if (!this.props.avatar || this.props.avatar === null) { return 'none';}
        if (this.props.avatar.imageSrc) {return 'image';}
        if (this.props.avatar.icon) {return 'icon';}
        if (this.props.avatar.letter) {return 'letter';}
        if (this.props.avatar.name) {return 'initialName';}
        return 'none';
    };

    _extend()
    {
        var newObj = {};
        for (var i = 0; i < arguments.length; i++)
        {
            var obj = arguments[i];
            for (var key in obj) //eslint-disable-line
            {
                newObj[key] = obj[key];
            }
        }
        return newObj;
	}

    _getBackground = (style) =>
    {
        if (!this.props.isToShowBackGroundColor)
        {
            return null;
        }
        if (style.backgroundColor)
        {
            return style.backgroundColor;
        }
        if (!this.props.avatar || this.props.avatar === null) { return 'rgba(255,255,255,0)';}
        return (this.props.avatar.backgroundColor) ? this._convertRgbaObjetToString(this.props.avatar.backgroundColor) : 'rgba(255,255,255,0)';
    }

    _convertRgbaObjetToString(rgbaColor)
    {
        if (typeof rgbaColor === 'string') {return rgbaColor;}
        if (rgbaColor) {return `rgba(${rgbaColor.r}, ${rgbaColor.g},${rgbaColor.b}, ${rgbaColor.a})`;}
        return 'rgba(255,255,255,0)';
    }

    getVisual = () =>
    {
        let visualType = this.getVisualType();
        let avatar = this.props.avatar || {backgroundColor: null, foreColor: null, name: null, icon: null, imageSrc: null, letter: null};
        let style = this.props.style || {};

        style.backgroundColor = this._getBackground(style);
        style.color = style.color || (this._convertRgbaObjetToString(avatar.foreColor || {r: 0, g: 0, b: 0, a: 1}));
        style.fontWeight = style.fontWeight || 'bold';
        style.textAlign = style.textAlign || 'center';
        style.textTransform = style.textTransform || 'uppercase';

        if (this.props.isToShowBorder)
        {
            style.borderRadius = (avatar.borderRadius ? avatar.borderRadius + 'px' : '0px'); //eslint-disable-line
            style.borderColor = avatar.borderColor ? this._convertRgbaObjetToString(avatar.borderColor) : null; //eslint-disable-line
            style.borderWidth = avatar.borderWidth ? //eslint-disable-line
                this.props.isToShowSmallBorder ? '1px' : avatar.borderWidth + 'px'
                : '0px'; //eslint-disable-line
            style.borderStyle = avatar.borderWidth ? 'solid' : null; //eslint-disable-line
        }

        if (style.height)
        {
            style.fontSize = style.fontSize || Math.floor(style.height / 2.3) + 'px/100px';
            style.lineHeight = style.lineHeight || (style.height + Math.floor(style.height / 10)) + 'px';
        }


        switch (visualType)
        {
            case 'image':
                if (this.props.isSquareImageDimension)
                {
                    if (!style.height && style.width) { style.height = style.width;}
                    if (style.height && !style.width) { style.width = style.height;}
                }

                let imageStyle = {
                    maxWidth: '100%',
                    display: 'inline !important',
                    background: this._convertRgbaObjetToString(this.props.avatar.backgroundColor)
                };
                _.assign(style, imageStyle);
                const imageSrc = this.props.avatar.imageSrc.startsWith('blob:') ? this.props.avatar.imageSrc : `${FunctionHelper.getDomainPath()}${this.props.avatar.imageSrc}`;
                return (<img style={style} className={this.props.className} src={imageSrc}/>);
            case 'icon':
                let iconStyle = {fontFamily: null, verticalAlign: 'baseline'};
                _.assign(style, iconStyle);
                return (<FaIcon style={style} className={`${this.props.avatar.icon} ${this.props.className}`} />);
            case 'letter':
                return (<div style={style} className={this.props.className}>{this.props.avatar.letter}</div>);
            case 'initialName':
                return (<div style={style} className={this.props.className}>{this.getInitials(this.props.avatar.name)}</div>);
            case 'none':
            default:
                return (<div style={style} className={this.props.className}></div>);
        }
    };

    render()
    {
        let {avatar, hostStyle, title} = this.props;
        if (avatar)
        {
            title = title || avatar.name;
        }
        var visual = this.getVisual();
        return (
            <div title={title} style={hostStyle} className={this.props.hostClassName} onClick={this.props.onClick}>
                {visual}
            </div>
        );
    }
}
