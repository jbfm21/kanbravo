'use strict';

var React = require('react');

var PercentageSymbol = React.createClass({
  // Define propTypes only in development. They will be void in production.
  propTypes: {
    icon: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object, React.PropTypes.element]),
    background: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object, React.PropTypes.element]),
    percent: React.PropTypes.number,
    iconContainerClassName: React.PropTypes.string
  },

  // Return the corresponding React node for an icon.
  _iconNode: function(icon)
  {
    // If it is already a React Element just return it.
    if (React.isValidElement(icon))
    {
      return icon;
    }
    // If it is an object, try to use it as a CSS style object.
    if (typeof icon === 'object' && icon !== null)
    {
      return <div style={icon}/>;
    }
    // If it is a string, use it as class names.
    if (Object.prototype.toString.call(icon) === '[object String]')
    {
      return <i className={icon}/>;
    }
    return <div/>;
  },

  render: function ()
  {
    var backgroundNode = this._iconNode(this.props.background);
    var iconNode = this._iconNode(this.props.icon);
    var iconContainerStyle =
    {
      display: 'inline-block',
      position: 'absolute',
      overflow: 'hidden',
      top: 0,
      left: 0,
      width: this.props.percent !== null ?
        this.props.percent + '%' :
        'auto'
    };
    var style =
    {
      cursor: this.props.onMouseDown || this.props.onMouseOver ?
        'pointer' :
        'auto',
      display: 'inline-block',
      position: 'relative'
    };
    return (
      <span className={this.props.iconContainerClassName} style={style}
          onMouseDown={this.props.onMouseDown}
          onMouseMove={this.props.onMouseMove}>
        {backgroundNode}
        <span style={iconContainerStyle}>
          {iconNode}
        </span>
      </span>
    );
  }
});

module.exports = PercentageSymbol;
