import React from 'react';
import ReactDom from 'react-dom';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Sidebar} from 'react-semantify';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {UIActions, KanbanActions} from '../../../../actions';
import {ReactInterval, Loader} from '../../../../components';
import CustomScroll from 'react-custom-scroll';

import {default as CardCommentStore} from './CardCommentStore';
import {default as CommentList} from './CommentList.jsx';
import {default as CommentForm} from './CommentForm.jsx';
import {default as CommentNavigator} from './CommentNavigator.jsx';

const messages = defineMessages(
{
        modalTitle: {id: 'modal.comments.title', description: 'Modal Title', defaultMessage: 'Comentários'},
        close: {id: 'modal.comments.close', description: 'close modal', defaultMessage: 'Fechar'},
        loadingNew: {id: 'modal.comments.loading', description: 'Loading', defaultMessage: 'Verificando novos comentários...'},
        loadingOld: {id: 'modal.comments.loading', description: 'Loading', defaultMessage: 'Recuperando comentários antigos...'}
});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class CardCommentModal extends React.Component
{
    static displayName = 'CardCommentModal';

    static StateRecord = Immutable.Record({shouldScrollBottom: false, isSubmitingNewComment: false, isLoadingNewComments: false, isLoadingOldComments: false, editingCommentId: null, deletingCommentId: null});

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    static contextTypes =
    {
        loggedUser: React.PropTypes.any
    };

    constructor(props)
    {
        super(props);
        this.listenTo(CardCommentStore, this._listenToCardCommentStoreChange);
        this.state = {data: new CardCommentModal.StateRecord({})};
    }

    componentDidUpdate()
    {
        this.reactIntervalToUpdateNewComments.start();
        if (this.state.data.shouldScrollBottom)
        {
            var node = ReactDom.findDOMNode(this.customScroll.getScrolledElement());
            this.customScroll.updateScrollPosition(node.scrollHeight + 1000);
        }
    }

    componentWillUnMount()
    {
        CardCommentStore.clearState();
        this._clearState();
        this.reactIntervalToUpdateNewComments.stop();
    }

    _clearState = () =>
    {
        this.setImmutableState({shouldScrollBottom: false, isSubmitingNewComment: false, isLoadingNewComments: false, isLoadingOldComments: false, editingCommentId: null, deletingCommentId: null});
    }

    _listenToCardCommentStoreChange(store)
    {
        const that = this;
        switch (store.actionState)
        {
            case UIActions.showCardCommentModal:
                this.setImmutableState({isLoadingOldComments: true});
                window.$('.ui.sidebar.cardCommentModal').sidebar('setting', 'transition', 'overlay').sidebar('setting', {onHide: function(){that.componentWillUnMount()}}).sidebar('show'); //eslint-disable-line
                break;

            case KanbanActions.cardSetting.comment.list.progressed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingOldComments: true});
                break;
            case KanbanActions.cardSetting.comment.listOldComment.progressed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingOldComments: true});
                break;
            case KanbanActions.cardSetting.comment.listNewComment.progressed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingNewComments: true});
                break;
            case KanbanActions.cardSetting.comment.add.progressed:
                this.setImmutableState({shouldScrollBottom: true, isSubmitingNewComment: true});
                break;
            case KanbanActions.cardSetting.comment.update.progressed:
                break;
            case KanbanActions.cardSetting.comment.delete.progressed:
                this.setImmutableState({shouldScrollBottom: false});
                break;

            case KanbanActions.cardSetting.comment.list.completed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingOldComments: false});
                break;
            case KanbanActions.cardSetting.comment.listOldComment.completed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingOldComments: false});
                break;
            case KanbanActions.cardSetting.comment.listNewComment.completed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingNewComments: false});
                break;
            case KanbanActions.cardSetting.comment.add.completed:
                this.setImmutableState({shouldScrollBottom: true, isSubmitingNewComment: false});
                break;
            case KanbanActions.cardSetting.comment.update.completed:
            {
                let {newComments, oldComments} = store.state;
                this.setImmutableState({shouldScrollBottom: false, editingCommentId: null, newComments: newComments, oldComments: oldComments});
                break;
            }
            case KanbanActions.cardSetting.comment.delete.completed:
                this.setImmutableState({shouldScrollBottom: false, deletingCommentId: null});
                break;

            case KanbanActions.cardSetting.comment.list.failed:
            case KanbanActions.cardSetting.comment.listOldComment.failed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingOldComments: false});
                break;
            case KanbanActions.cardSetting.comment.listNewComment.failed:
                this.setImmutableState({shouldScrollBottom: false, isLoadingNewComments: false});
                break;
            case KanbanActions.cardSetting.comment.add.failed:
                this.setImmutableState({shouldScrollBottom: false, isSubmitingNewComment: false});
                break;
            case KanbanActions.cardSetting.comment.update.failed:
                this.setImmutableState({shouldScrollBottom: false});
                break;
            case KanbanActions.cardSetting.comment.delete.failed:
                this.setImmutableState({shouldScrollBottom: false, deletingCommentId: null});
                break;

            default: break;
        }
    }

    _handleCommentSubmit = (comment) => //eslint-disable-line
    {
        const {card} = CardCommentStore.getState();
        comment.author = this.context.loggedUser;
        comment.updatedDate = new Date();
        KanbanActions.cardSetting.comment.add.asFunction(card, comment);
    }

    _handleRequestMoreOldComments = (cursorBeforeValue, limit) =>
    {
        const {card} = CardCommentStore.getState();
        KanbanActions.cardSetting.comment.listOldComment.asFunction(card, cursorBeforeValue, limit);
    }

    _handleRequestShowAll = () =>
    {
        const {card} = CardCommentStore.getState();
        KanbanActions.cardSetting.comment.list.asFunction(card);
    }

    _handleRequestMoreNewComments = () =>
    {
        /*
        let {card, after, limit} = this.state.data;
        KanbanActions.cardSetting.comment.listNewComment.asFunction(card, after, limit);*/
    }

    _handleDelete = (comment) =>
    {
        this.setImmutableState({deletingCommentId: comment._id});
        KanbanActions.cardSetting.comment.delete.asFunction(comment);
	}

    _handleEdit = (comment) =>
    {
        this.setImmutableState({shouldScrollBottom: false, editingCommentId: comment._id});
    }

    _handleSave = (commentToSave) =>
    {
        KanbanActions.cardSetting.comment.update.asFunction(commentToSave);
	}

	_handleCancel = () =>
    {
        this.setImmutableState({shouldScrollBottom: false, editingCommentId: null});
	}

    render()
    {
        let {isLoadingNewComments, isLoadingOldComments, isSubmitingNewComment, editingCommentId, deletingCommentId} = this.state.data;
        let {before, limit, totalOfCommentsInDb, oldComments, newComments} = CardCommentStore.getState();
        let totalOfFetchedComments = (oldComments) ? oldComments.length : 0;
        return (
            <Sidebar className="right vertical cardCommentModal" style={{backgroundColor: '#E1E1E1', opacity: 1, width: '40%'}}>
                <ReactInterval ref={c => {this.reactIntervalToUpdateNewComments = c;}} timeout={5000} enabled={false} callback={this._handleRequestMoreNewComments} />
                <Header className="k-background" style={{width: '98%', marginTop: '0px', marginBottom: '0px', padding: '0px', borderBottom: '1px solid black'}}>
                    <span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.modalTitle} /></span>
                </Header>
                <div className="commentBox" style={{height: '88%', width: '98%'}}>
                    <div style={{backgroundColor: '#E1E1E1', marginBottom: '10px'}}>
                        <CommentNavigator cursorBeforeValue={before} limit={limit} totalOfCommentsInDb={totalOfCommentsInDb} totalOfFetchedComments={totalOfFetchedComments} onRequestMoreOldComments={this._handleRequestMoreOldComments} onRequestShowAll={this._handleRequestShowAll} />
                    </div>
                    <div style={{height: '95%', overflow: 'auto', backgroundColor: '#f6f7f9'}}>
                        <CustomScroll ref={c => {this.customScroll = c;}} allowOuterScroll={false} heightRelativeToParent="calc(100% - 20px)">
                            {
                                isLoadingOldComments && <Loader className={'active mini k-size k-100percent inline'}><br/><FormattedMessage {...messages.loadingOld} /></Loader>
                            }
                            <CommentList onDelete={this._handleDelete} onEdit={this._handleEdit} onSave={this._handleSave} onCancel={this._handleCancel} comments={oldComments} editingCommentId={editingCommentId} deletingCommentId={deletingCommentId}/>
                            <hr />
                            <CommentList onDelete={this._handleDelete} onEdit={this._handleEdit} onSave={this._handleSave} onCancel={this._handleCancel} comments={newComments} editingCommentId={editingCommentId} deletingCommentId={deletingCommentId} />
                            {
                               isLoadingNewComments && <Loader className={'active mini k-size k-100percent inline '}><br/><FormattedMessage {...messages.loadingNew} /></Loader>
                            }
                        </CustomScroll>
                    </div>
                </div>
                <div style={{width: '98%', backgroundColor: '#E1E1E1'}}>
                    <div style={{padding: '10px'}}>
                        <CommentForm isSubmitingNewComment={isSubmitingNewComment} onCommentSubmit={this._handleCommentSubmit} />
                    </div>
                </div>
            </Sidebar>
       );
    }
}

module.exports = injectIntl(CardCommentModal);
