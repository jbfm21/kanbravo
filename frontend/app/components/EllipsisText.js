'use strict';

import React from 'react';

const styles =
{
    root:
    {
        position: 'relative',
        boxSizing: 'border-box'
    },
    allText:
    {
        MozUserSelect: 'text',
        WebkitUserSelect: 'text',
        msUserSelect: 'text',
    userSelect: 'text'
    }
};

export default class EllipsisText extends React.Component
{
    static propTypes =
    {
        text: React.PropTypes.string.isRequired,
        length: React.PropTypes.number.isRequired,
        tail: React.PropTypes.string,
        tailClassName: React.PropTypes.string
    };

    static defaultProps =
    {
      tail: '...',
      tailClassName: 'more'
    };

    constructor(props)
    {
        super(props);
    }

    render()
    {
        let {text, length, tail, tailClassName, ...others} = this.props;

        if (text.length <= this.props.length || this.props.length < 0)
        {
            return (<div {...others}><span>{this.props.text}</span></div>);
        }
        let tailStyle = {cursor: 'auto'};

        let displayText = (length - tail.length <= 0) ? '' : text.slice(0, (length - tail.length));
        return (
            <div style={styles.root} {...others} title={text}>
              <span>
                {displayText}
                <span style={tailStyle} className={tailClassName}>
                  {tail}
                </span>
              </span>
            </div>
        );
    }
}
