'use strict';

var React = require('react');
var Style = require('./style');
import Symbol from './PercentageSymbol.jsx';

// Returns the index of the rate in the range (start, stop, step).
// Returns undefined index if the rate is outside the range.
// NOTE: A range.step of 0 produces an empty range and consequently returns an
// undefined index.
var indexOf = function(range, rate)
{
  // Check the rate is in the proper range [start..stop] according to
  // the start, stop and step properties in props.
  var step = range.step;
  var start = step > 0 ? range.start : range.stop;
  var stop = step > 0 ? range.stop : range.start;
  if (step && start <= rate && rate <= stop)
  {
    // The index corresponds to the number of steps of size props.step
    // that fits between rate and start.
    // This index does not need to be a whole number because we can have
    // fractional symbols, and consequently fractional/float indexes.
    return (rate - range.start) / step;
  }

  return 0;
};

var Rating = React.createClass({
  propTypes:
  {
    start: React.PropTypes.number,
    stop: React.PropTypes.number,
    step: React.PropTypes.number,
    initialRate: React.PropTypes.number,
    placeholderRate: React.PropTypes.number,
    iconContainerClassName: React.PropTypes.string,
    empty: React.PropTypes.any,
    placeholder: React.PropTypes.any,
    full: React.PropTypes.any,
    readonly: React.PropTypes.bool,
    fractions: React.PropTypes.number,
    scale: React.PropTypes.number,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onRate: React.PropTypes.func
  },

  getDefaultProps: function ()
  {
    return {
      start: 0, stop: 5, step: 1,
      empty: Style.empty, placeholder: Style.placeholder, full: Style.full,
      fractions: 1, scale: 3,
      onChange: function (rate) {}, //eslint-disable-line
      onClick: function (rate) {}, //eslint-disable-line
      onRate: function (rate) {} //eslint-disable-line
    };
  },

  getInitialState: function()
  {
    var index = (this.props.initialRate > 0) ? this.props.initialRate : this.props.placeholderRate;
    return {index: this._rateToIndex(index), indexOver: null};
  },

  componentWillReceiveProps: function (nextProps)
  {
      var rate = (nextProps.initialRate > 0) ? nextProps.initialRate : nextProps.placeholderRate;
      this.setState({index: indexOf(nextProps, rate)});
  },

  handleMouseDown: function(i, event)
  {
    var index = i + this._fractionalIndex(event);
    this.props.onClick(this._indexToRate(index));
    if (this.state.index !== index)
    {
      this.props.onChange(this._indexToRate(index));
      this.setState({index: index, selected: true});
    }
  },

  handleMouseLeave: function()
  {
    this.props.onRate();
    this.setState({indexOver: null});
  },

  handleMouseMove: function(i, event)
  {
    var index = i + this._fractionalIndex(event);
    if (this.state.indexOver !== index)
    {
      this.props.onRate(this._indexToRate(index));
      this.setState({indexOver: index});
    }
  },

  // Calculate the rate of an index according the the start and step.
  _indexToRate: function(index)
  {
    return this.props.start + Math.floor(index) * this.props.step +
      this.props.step * this._roundToFraction(index % 1);
  },

  // Calculate the corresponding index for a rate according to the provided
  // props or this.props.
  _rateToIndex: function(rate)
  {
    return indexOf(this.props, rate);
  },

  _roundToFraction: function(index)
  {
    // Get the closest top fraction.
    var fraction = Math.ceil(index % 1 * this.props.fractions) / this.props.fractions;
    // Truncate decimal trying to avoid float precission issues.
    var precision = Math.pow(10, this.props.scale);
    return Math.floor(index) + Math.floor(fraction * precision) / precision;
  },

  _fractionalIndex: function(event)
  {
    var x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    return this._roundToFraction(x / event.currentTarget.offsetWidth);
  },

  render: function ()
  {
    var symbolNodes = [];
    var concatedEmpty = [].concat(this.props.empty);
    var concatedPlaceholder = [].concat(this.props.placeholder);
    var concatedFull = [].concat(this.props.full);

    // The symbol with the mouse over prevails over the selected one.
    var index = this.state.indexOver !== null ? this.state.indexOver : this.state.index;

    // The index of the last full symbol or NaN if index is undefined.
    var lastFullIndex = Math.floor(index);

    // Render the number of whole symbols.
    var icon = (!this.state.selected &&
                  !this.props.initialRate &&
                  this.props.placeholderRate > 0 &&
                  this.state.indexOver === null) ? concatedPlaceholder : concatedFull;

    for (var i = 0; i < Math.floor(this._rateToIndex(this.props.stop)); i++)
    {
      // Return the percentage of the decimal part of the last full index,
      // 100 percent for those below the last full index or 0 percent for those
      // indexes NaN or above the last full index.
      var percent = i - lastFullIndex === 0 ? index % 1 * 100 : i - lastFullIndex < 0 ? 100 : 0; //eslint-disable-line

      symbolNodes.push(
          <Symbol
              key={i}
              iconContainerClassName={this.props.iconContainerClassName}
              background={concatedEmpty[i % concatedEmpty.length]}
              icon={icon[i % icon.length]}
              percent={percent}
              onMouseDown={!this.props.readonly && this.handleMouseDown.bind(this, i)}
              onMouseMove={!this.props.readonly && this.handleMouseMove.bind(this, i)}
          />);
    }

    let {start, stop, step, empty, initialRate, placeholderRate, placeholder, full, readonly, fractions, scale, onChange, onClick, onRate, iconContainerClassName, ...other} = this.props; //eslint-disable-line
    return (
      <span onMouseLeave={!readonly && this.handleMouseLeave} {...other}>
        {symbolNodes}
      </span>
    );
  }
});

module.exports = Rating;
