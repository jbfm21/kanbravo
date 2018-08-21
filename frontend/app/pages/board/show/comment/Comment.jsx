'use strict';

import React from 'react';
import marked from 'marked';
import moment from 'moment';
import {FormattedDate, FormattedTime, FormattedRelative} from 'react-intl';
import {Comment as UIComment, Icon} from 'react-semantify';

import {default as CommentForm} from './CommentForm.jsx';

import {Avatar, Metadata, Content, Text} from '../../../../components';
import {UserEntity} from '../../../../entities';

import {FunctionHelper} from '../../../../commons';

export default class Comment extends React.Component
{
    static displayName = 'Comment';

    static propTypes =
    {
        onDelete: React.PropTypes.func.isRequired,
        onEdit: React.PropTypes.func.isRequired,
        onSave: React.PropTypes.func.isRequired,
        onCancel: React.PropTypes.func.isRequired,
        comment: React.PropTypes.object.isRequired,
        isDeleting: React.PropTypes.bool,
        isEditing: React.PropTypes.bool,
        children: React.PropTypes.node
    };

    static contextTypes =
    {
        loggedUser: React.PropTypes.any
    };

    constructor(props)
    {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (
            nextProps.comment !== this.props.comment ||
            nextProps.isEditing !== this.props.isEditing ||
            nextProps.isDeleting !== this.props.isDeleting ||
            nextProps.children !== this.props.children
        );
    }

    _rawMarkup = () =>
    {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return {__html: rawMarkup};
    }

    _isToShowRelativeDate(date)
    {
        const today = moment();
        const numberOfMonth = today.diff(date, 'month');
        return numberOfMonth < 1;
    }

    _handleDeleteComment = () =>
    {
        this.props.onDelete(this.props.comment);
    }

    _handleEdit = () =>
    {
        this.props.onEdit(this.props.comment);
    }

    _handleCancel = () =>
    {
        this.props.onCancel();
    }

    _handleSave = (commentWithTextOnly) => //eslint-disable-line
    {
        if (commentWithTextOnly)
        {
            let editedComment = FunctionHelper.extend({}, this.props.comment, commentWithTextOnly);
            this.props.onSave(editedComment);
            return;
        }
        this.props.onDelete(this.props.comment);
    }

    render()
	{
        const {comment, isEditing, isDeleting} = this.props;
        const date = new Date(comment.updatedDate);
        const author = new UserEntity(comment.author);
        const isToShowRelative = this._isToShowRelativeDate(date);
        const opacity = (isDeleting) ? '0.5' : '1';
        const canDeleteAndEdit = this.context.loggedUser._id === author._id && (!isEditing && !isDeleting);
        return (
            <UIComment className={'k-card-comment'} style={{borderBottom: '1px solid #e1e2e3', opacity: opacity}}>
                <div className="avatar">
                    <Avatar isToShowBackGroundColor avatar={author.avatar} hostStyle={{width: null, height: null}} style={{width: '25px', height: '25px', lineHeight: '1'}} />
                </div>
                <Content>
                    <a className="author" style={{color: '#365899', fontWeight: 'bold'}}>{author.fullname}</a>
                    <Metadata>
                       {
                           isToShowRelative &&
                               <span className="date" style={{fontSize: '10px'}}><FormattedRelative updateInterval={10000000} value={date}/></span>}
                       {
                           !isToShowRelative &&
                               <span className="date" style={{fontSize: '10px'}}><FormattedDate value={date}/><FormattedTime value={date}/></span>
                       }
                       {
                           canDeleteAndEdit &&
                                <div style={{position: 'absolute', right: '20px'}}>
                                    <Icon className={'large blue edit'} style={{cursor: 'pointer'}} onClick={this._handleEdit}/>
                                    <Icon className={'large red remove'} style={{cursor: 'pointer'}} onClick={this._handleDeleteComment}/>
                                </div>
                       }

                    </Metadata>
                    {
                        !isEditing &&
                            <Text style={{margin: '0px'}}>
                                <span style={{color: '#1d2129', fontFamily: 'helvetica, arial, sans-serif', fontSize: '12px', lineHeight: '16.08px', wordWrap: 'break-word'}} dangerouslySetInnerHTML={this._rawMarkup()} />
                            </Text>
                    }
                    {
                        isEditing &&
                            <CommentForm editableMode defaultText={comment.text} onCommentSubmit={this._handleSave} onCommentCancel={this._handleCancel} />
                    }
                </Content>
            </UIComment>
       );
    }
}
