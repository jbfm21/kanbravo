import React from 'react';
import {default as Portal} from './Portal.jsx';
import {default as ModalInner} from './ModalInner.jsx';

export default class Modal extends React.Component
{
    static displayName = 'Modal';

    static propTypes = {
        isOpened: React.PropTypes.bool.isRequired,
        closeOnEsc: React.PropTypes.bool,
        closeOnOutsideClick: React.PropTypes.bool,
        onClose: React.PropTypes.func,
        closeIcon: React.PropTypes.bool,
        className: React.PropTypes.string,
        style: React.PropTypes.oneOf(['standard', 'basic']),
        size: React.PropTypes.oneOf(['', 'small', 'large', 'fullscreen']),
        children: React.PropTypes.node
    };

    static defaultProps = {
        style: 'standard',
        size: ''
    };

    render()
    {
        let className = `ui dimmer modals visible active page transition ${this.props.className}`;
        return (
            <Portal className={className}
                isOpened={this.props.isOpened}
                closeOnEsc={this.props.closeOnEsc}
                closeOnOutsideClick={this.props.closeOnOutsideClick}
                onClose={this.props.onClose}
            >
                <ModalInner style={this.props.style} size={this.props.size} closeIcon={this.props.closeIcon}>
                    {this.props.children}
                </ModalInner>
            </Portal>
        );
    }
}
