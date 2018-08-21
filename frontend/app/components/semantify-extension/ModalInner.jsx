const React = require('react');
const Component = React.Component;
const PropTypes = React.PropTypes;

export default class ModalInner extends Component
{
    static displayName = 'ModalInner';

    static propTypes = {
        style: PropTypes.oneOf(['standard', 'basic']),
        size: PropTypes.oneOf(['', 'small', 'large', 'fullscreen']),
        closeIcon: PropTypes.bool,
        closePortal: PropTypes.func,
        children: React.PropTypes.node
    };

    static defaultProps = {
        style: 'standard',
        size: ''
    };

    constructor(props)
    {
        super(props);
        this.state = {modalHeight: '0px'};
    }

    componentDidMount()
    {
        let modalHeight = window.$('#reactInnerModal').outerHeight(); //eslint-disable-line no-undef
        this.setState({modalHeight: modalHeight});
    }

    render()
    {
        let className = `ui modal transition visible active ${this.props.style} ${this.props.size}`;

        let closeIcon = null;
        if (this.props.closeIcon)
        {
            closeIcon = <i className="close icon" onClick={this.props.closePortal}></i>; //eslint-disable-line react/jsx-handler-names
        }

        return (
            <div id="reactInnerModal" className={className} style={{top: '5px'}}>
                {closeIcon}
                {this.props.children}
            </div>
        );
    }
}
