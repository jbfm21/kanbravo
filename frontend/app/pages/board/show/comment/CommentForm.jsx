'use strict';

import React from 'react';
import classNames from 'classNames';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import Immutable from 'immutable';
import Textarea from 'react-textarea-autosize';
import {Icon} from 'react-semantify';

import {ImmutableState} from '../../../../decorators';
import {Loader, Button} from '../../../../components';
import {UIActions} from '../../../../actions';

const messages = defineMessages(
{
    placeholder: {id: 'modal.comments.form.newcomment.placeholder', description: 'New comment form placeholder', defaultMessage: 'Diga algo...'},
    instruction: {id: 'modal.comments.form.newcomment.instruction', description: 'New comment form instruction', defaultMessage: 'Pressione Cntrl+Enter para publicar (utilize a sintaxe de markdown)'}
});

const ESCAPE_KEY = 27;

@ImmutableState
class CommentForm extends React.Component
{
    static displayName = 'CommentForm';
    static StateRecord = Immutable.Record({text: ''});

    static propTypes =
    {
        onCommentSubmit: React.PropTypes.func,
        onCommentCancel: React.PropTypes.func,
        defaultText: React.PropTypes.string,
        isSubmitingNewComment: React.PropTypes.bool.isRequired,
        editableMode: React.PropTypes.bool,
        intl: intlShape.isRequired
    };

    static defaultProps =
    {
        defaultText: '',
        isSubmitingNewComment: false,
        editableMode: false
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new CommentForm.StateRecord({text: props.defaultText})};
    }

    componentDidMount()
    {
        let that = this;
        window.$('#commentTextArea').bind('keydown', function(e) //eslint-disable-line
        {
            if (e.ctrlKey && ((e.keyCode || e.which) === 13 || (e.keyCode || e.which) === 10))
            {
                e.preventDefault();
                that._handleSubmit(e);
                return true;
            }

            if ((e.keyCode || e.which) === ESCAPE_KEY)
            {
                e.preventDefault();
                that.setImmutableState({text: that.props.defaultText});
                that.props.onCommentCancel();
                return true;
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return (this.props.isSubmitingNewComment !== nextProps.isSubmitingNewComment) || (this.state.data !== nextState.data);
    }

    _handleTextChange = (e) =>
    {
        this.setState({text: e.target.value});
        this.setImmutableState({text: e.target.value});
    };

    _handleTextEditModalShow = (text, e) =>
    {
        if (e) {e.preventDefault();}
        UIActions.showRichTextEditModal.asFunction(text, 'markdown', this._handleTextEditModalTextChanged.bind(this), this._handleTextEditModalCancel.bind(this));
    };

    _submit = (text) =>
    {
        if (!text)
        {
            return;
        }
        this.props.onCommentSubmit({text: text});
        if (this.props.defaultText === '')
        {
            //Limpa somente se for o formulário de adição
            this.setImmutableState({text: ''});
        }
    }

    _handleTextEditModalTextChanged = (text) =>
    {
        this._submit(text);
        //this.setImmutableState({text: text});
    };

    _handleTextEditModalCancel = () =>
    {
    };

    _handleSubmit = (e) =>
    {
        e.preventDefault();
        var text = this.state.data.text.trim();
        this._submit(text);
    }

    render()
	{
        const {formatMessage} = this.props.intl;
        const {isSubmitingNewComment, editableMode} = this.props;
        const placehHolder = formatMessage(messages.placeholder);
        const that = this;
        const containerClassName = classNames('k-card-comment-form', {editableMode: editableMode});
        return (
            <div className={containerClassName}>
                <div>
                    <Textarea id="commentTextArea" placeholder={placehHolder} value={this.state.data.text} onChange={this._handleTextChange} minRows={1} style={{width: '93%'}}/>
                    <Button onClick={that._handleTextEditModalShow.bind(this, this.state.data.text)} className={'basic circular icon mini k-right-bottom-icon'} ><Icon className={'mini expand'}/></Button>
                    {
                        isSubmitingNewComment && <Loader className={'active mini inline'} style={{position: 'relative', top: '-10px', marginLeft: '10px'}}></Loader>
                    }
                </div>
                <div style={{fontWeight: 'bold', color: '#7f7f7f', fontSize: '11px', paddingTop: '1px'}}>
                    <FormattedMessage {...messages.instruction} />
                </div>
            </div>
        );
    }
}
module.exports = injectIntl(CommentForm);
