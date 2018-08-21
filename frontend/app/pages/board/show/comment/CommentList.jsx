'use strict';

import React from 'react';
import {Comments} from 'react-semantify';

import {default as Comment} from './Comment.jsx';

export default class CommentList extends React.Component
{
    static displayName = 'CommentList';

    static propTypes =
    {
        editingCommentId: React.PropTypes.string,
        deletingCommentId: React.PropTypes.string,
        comments: React.PropTypes.array,
        onDelete: React.PropTypes.func.isRequired,
        onEdit: React.PropTypes.func.isRequired,
        onSave: React.PropTypes.func.isRequired,
        onCancel: React.PropTypes.func.isRequired
    };

    render()
	{
        const {onDelete, onEdit, onSave, onCancel, deletingCommentId, editingCommentId} = this.props;
        let commentNodes = this.props.comments.map(function(comment)
        {
            return (
                <Comment onDelete={onDelete} onEdit={onEdit} onSave={onSave} onCancel={onCancel} isDeleting={deletingCommentId === comment._id} isEditing={editingCommentId === comment._id} comment={comment} key={comment._id}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <Comments>
                    {commentNodes}
            </Comments>
        );
    }
}
