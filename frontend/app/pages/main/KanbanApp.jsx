'use strict';

import _ from 'lodash';
import React from 'react';
import * as airflux from 'airflux';
import {ToastContainer} from 'react-toastr';
import {injectIntl, intlShape} from 'react-intl';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';

var ReactToastr = require('react-toastr');


import TopNavBar from './TopNavBar.jsx';
import {KanbanActions} from '../../actions';
import {FunctionHelper} from '../../commons';
import {TextEditModal, RichTextEditModal, SelectAvatarModal} from '../../components';
import {AuthStore, ToastStore, BoardListStore, BoardContextStore} from '../../stores';

import {default as CardFormModal} from '../../pages/card/fullForm/CardFormModal.jsx';
import {default as CardCommentModal} from '../../pages/board/show/comment/CardCommentModal.jsx';


let ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

const TOAST_CONFIG = {timeOut: 5000, extendedTimeOut: 2000, closeButton: true, showAnimation: 'animated fadeIn', hideAnimation: 'animated fadeOut'};

@DragDropContext(HTML5Backend)
@airflux.FluxComponent
class KanbanApp extends React.Component
{
    static displayName = 'KanbanApp';

    static propTypes =
    {
        children: React.PropTypes.node,
        params: React.PropTypes.object,
        intl: intlShape.isRequired
    };

    static childContextTypes =
    {
        loggedUser: React.PropTypes.any
    };

    constructor()
    {
        super();
        this.state = {loggedUser: null, boardList: null};

        this.listenTo(AuthStore, this._listenToAuthStoreChange);
        this.listenTo(ToastStore, this._listenToToastStoreChange);
        this.listenTo(BoardListStore, this._listenToBoardListStoreChange);
        this.listenTo(BoardContextStore, this._listenToBoardContextStore);
    }

    getChildContext()
    {
        return {loggedUser: this.state.loggedUser};
    }

    _listenToToastStoreChange(store)
    {
        const {formatMessage} = this.props.intl;
        if (_.isString(store.state.message))
        {
            this.toastContainer._notify(store.state.type, store.state.message, formatMessage(store.state.title), TOAST_CONFIG);
            return;
        }
        this.toastContainer._notify(store.state.type, formatMessage(store.state.message), formatMessage(store.state.title), TOAST_CONFIG);
    }

    _listenToBoardContextStore(store) //eslint-disable-line
    {
        if (store && store.forceApplicationUpdate)
        {
            this.forceUpdate();
        }
    }

    _listenToAuthStoreChange(store)
    {
        if (FunctionHelper.isUndefined(store.state) || FunctionHelper.isUndefined(store.state.loggedUser))
        {
            return;
        }
        this.setState({loggedUser: store.state.loggedUser, boardList: null});
        KanbanActions.board.list.asFunction();
        const isToLoadBoardInformation = FunctionHelper.isDefined(this.props.params.boardId);
        if (isToLoadBoardInformation)
        {
            KanbanActions.board.get.asFunction(this.props.params.boardId);
        }
    }

    _listenToBoardListStoreChange = (store) =>
    {
        if (FunctionHelper.isUndefined(store.state))
        {
            return;
        }
        this.setState({boardList: store.state.boardList});
        BoardContextStore.setBoardList(store.state.boardList);

        const isToClearBoardContext = FunctionHelper.isUndefined(this.props.params.boardId);
        if (isToClearBoardContext)
        {
            BoardContextStore.clearState();
        }
    };

    _clearState = () =>
    {
        BoardContextStore.clearState();
        this.setState({loggedUser: null, boardList: null});
    };

    _handleLogout = (e) =>
    {
        e.preventDefault();
        this._clearState();
        KanbanActions.user.logout.asFunction();
    };

    render()
    {
        const selectedBoard = BoardContextStore.getSelectedBoard();
        let {boardList} = this.state;
        return (
            <div>
                <TopNavBar boardList={boardList} selectedBoard={selectedBoard} onLogout={this._handleLogout} />
                <div style={{marginTop: '30px'}}>
                    {this.props.children}
                </div>
                <ToastContainer ref={c => {this.toastContainer = c; return;}} toastMessageFactory={ToastMessageFactory} className="toast-top-full-width" />
                <TextEditModal />
                <RichTextEditModal />
                <SelectAvatarModal />
                <CardFormModal />
                <CardCommentModal />
                <div style={{color: 'white', marginLeft: '10px', marginTop: '10px', display: 'inline-flex'}}>KanBravo - Versão Alfa 0.5 - 20/04/2017 - By J.Braf. - Pequenas entregas, Grandes Produtos</div>
            </div>
        );
    }
}

module.exports = injectIntl(KanbanApp);

