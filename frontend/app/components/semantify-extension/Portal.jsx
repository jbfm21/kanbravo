import React from 'react';
import ReactDOM, {findDOMNode} from 'react-dom';
import CSSPropertyOperations from 'react/lib/CSSPropertyOperations';
import shallowCompare from 'react/lib/shallowCompare';
export default class Portal extends React.Component
{
    static displayName = 'Portal';

    static propTypes = {
        className: React.PropTypes.string,
        style: React.PropTypes.object,
        children: React.PropTypes.element.isRequired,
        openByClickOn: React.PropTypes.element,
        closeOnEsc: React.PropTypes.bool,
        closeOnOutsideClick: React.PropTypes.bool,
        isOpened: React.PropTypes.bool,
        onClose: React.PropTypes.func
    };

    static defaultProps = {
        portal: null,
        node: null
    };


    constructor()
    {
        super();
        this.portal = null;
        this.node = null;
        this.state = {active: false};
    }

    componentDidMount()
    {
        if (this.props.closeOnEsc)
        {
            document.addEventListener('keydown', this.handleKeydown);  //eslint-disable-line no-undef
        }

        if (this.props.closeOnOutsideClick)
        {
            document.addEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.addEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
        }

        if (this.props.isOpened)
        {
            this.openPortal(this.props);
        }
    }

    componentWillReceiveProps(newProps)
    {
        // portal's 'is open' state is handled through the prop isOpened
        if (typeof newProps.isOpened !== 'undefined')
        {
            if (newProps.isOpened)
            {
                if (this.state.active)
                {
                    this.renderPortal(newProps);
                }
                else
                {
                    this.openPortal(newProps);
                }
            }
            if (!newProps.isOpened && this.state.active)
            {
                this.closePortal();
            }
        }

        // portal handles its own 'is open' state
        if (typeof newProps.isOpened === 'undefined' && this.state.active)
        {
            this.renderPortal(newProps);
        }


        if (this.props.closeOnEsc)
        {
            document.removeEventListener('keydown', this.handleKeydown); //eslint-disable-line no-undef
            document.addEventListener('keydown', this.handleKeydown);  //eslint-disable-line no-undef
        }
        else
        {
            document.removeEventListener('keydown', this.handleKeydown); //eslint-disable-line no-undef
        }

        if (this.props.closeOnOutsideClick)
        {
            document.removeEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.removeEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.addEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.addEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
        }
        else
        {
            document.removeEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.removeEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
        }

    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount()
    {
        if (this.props.closeOnEsc)
        {
            document.removeEventListener('keydown', this.handleKeydown); //eslint-disable-line no-undef
        }

        if (this.props.closeOnOutsideClick)
        {
            document.removeEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.removeEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
        }

        this.closePortal();
    }

    renderPortal(props)
    {
        if (!this.node)
        {
            this.node = document.createElement('div'); //eslint-disable-line no-undef
            if (props.className)
            {
                this.node.className = props.className;
            }
            if (props.style)
            {
                CSSPropertyOperations.setValueForStyles(this.node, props.style);
            }
            document.body.appendChild(this.node); //eslint-disable-line no-undef
        }
        this.portal = ReactDOM.unstable_renderSubtreeIntoContainer(this, React.cloneElement(props.children, {closePortal: this.closePortal}), this.node);
    }

    openPortal = (props, e) =>
    {
        if (e)
        {
            e.preventDefault();
            e.stopPropagation();
        }
        this.setState({active: true});
        this.renderPortal(props);
    }

    closePortal = () =>
    {
        if (this.props.closeOnEsc)
        {
            document.removeEventListener('keydown', this.handleKeydown); //eslint-disable-line no-undef
        }

        if (this.props.closeOnOutsideClick)
        {
            document.removeEventListener('mousedown', this.handleOutsideMouseClick); //eslint-disable-line no-undef
            document.removeEventListener('touchstart', this.handleOutsideMouseClick); //eslint-disable-line no-undef
        }

        if (this.node)
        {
            ReactDOM.unmountComponentAtNode(this.node);
            document.body.removeChild(this.node); //eslint-disable-line no-undef
        }
        this.portal = null;
        this.node = null;
        this.setState({active: false});

        if (this.props.onClose)
        {
            this.props.onClose();
        }
    }

    handleOutsideMouseClick = (e) =>
    {
        if (!this.state.active) { return; }
        if (this.isNodeInRoot(e.target, findDOMNode(this.portal)) || e.target.tagName === 'HTML') { return; }
        e.stopPropagation();
        this.closePortal();
    }

    handleKeydown = (e) =>
    {
        if (e.defaultPrevented)
        {
            return;
        }
        if (e.keyCode === 27 && this.state.active)
        {
            if (['resizable-input', 'preventModalToClose'].indexOf(e.target.className) > -1)
            {
                return;
            }
            this.closePortal();
        }
    }

    isNodeInRoot = (node, root) =>
    {
        while (node)
        {
            if (node === root)
            {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    render()
    {
      //return <div className="openByClickOn" onClick={this.openPortal.bind(this, this.props)}>{this.props.openByClickOn}</div>;
      return (<div></div>);
    }

}

