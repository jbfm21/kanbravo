'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';
import {stateFromMarkdown} from 'draft-js-import-markdown';


import {Editor} from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import draftToMarkdown from 'draftjs-to-markdown';
import {convertToRaw, EditorState, ContentState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';

import {Modal, Button, Actions, Content} from '../../../components';
import {FunctionHelper} from '../../../commons';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../decorators';
import {default as RichTextEditModalStore} from './RichTextEditModalStore';

const messages = defineMessages(
{
        modalTitle: {id: 'modal.textEdit.title', description: 'Modal Title', defaultMessage: 'Editor de texto'},
        cancel: {id: 'modal.textEdit.cancel', description: 'Cancel model', defaultMessage: 'Cancelar'},
        ok: {id: 'modal.textEdit.confirm', description: 'Confirm text editor', defaultMessage: 'Confirmar'}
});

var StateRecord = Immutable.Record({isToShowModal: false, editorState: EditorState.createEmpty(), textFormat: null, confirmFunction: null, cancelFunction: null});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class RichTextEditModal extends React.Component
{
    static displayName = 'RichTextEditModal';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor()
    {
        super();
        this.listenTo(RichTextEditModalStore, this._listenToRichTextEditModalStoreChange);
        this.state = {data: new StateRecord({editorState: EditorState.createEmpty()})};
    }

    _listenToRichTextEditModalStoreChange(store)
    {
        if (FunctionHelper.isDefined(store.state.text))
        {
            switch (store.state.textFormat)
            {
                case 'html':
                {
                    const contentBlock = htmlToDraft(store.state.text);
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    const inputEditorState = EditorState.createWithContent(contentState);
                    this.setImmutableState({editorState: inputEditorState});
                    break;
                }
                case 'markdown':
                    let contentState = stateFromMarkdown(store.state.text);
                    const inputEditorState = EditorState.createWithContent(contentState);
                    this.setImmutableState({editorState: inputEditorState});
                    //TODO_URGENTE
                    break;
                default:
                    this.setImmutableState({editorState: EditorState.createEmpty()});
                    break;
            }
        }
        else
        {
            this.setImmutableState({editorState: EditorState.createEmpty()});
        }
        this.setImmutableState({textFormat: store.state.textFormat, isToShowModal: store.state.isToShowModal, confirmFunction: store.state.confirmFunction, cancelFunction: store.state.cancelFunction});
        this.forceUpdate();
    }

    _handleOkModal = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isToShowModal: false});
        if (this.state.data.confirmFunction)
        {
            let {editorState, textFormat} = this.state.data;
            switch (textFormat)
            {
                case 'html':
                    this.state.data.confirmFunction(draftToHtml(convertToRaw(editorState.getCurrentContent())));
                    break;
                case 'markdown':
                    this.state.data.confirmFunction(draftToMarkdown(convertToRaw(editorState.getCurrentContent())));
                    break;
                default:
                    break;
            }
        }
    };

    _handleCancelModal = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isToShowModal: false});
        if (this.state.data.cancelFunction)
        {
            this.state.data.cancelFunction();
        }
    };

    _handleonEditorStateChange = (editorContent) =>
    {
        this.setImmutableState({editorState: editorContent});
    };

    render()
    {
        let {isToShowModal, editorState} = this.state.data;
        return (
            <Modal className="k-richTextEditModal" style="standard" size="fullscreen" isOpened={isToShowModal}>
                <Header className="k-background" style={{width: '100%', marginTop: '0px', marginBottom: '0px', padding: '0px', borderBottom: '1px solid black'}}>
                    <span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.modalTitle} /></span>
                </Header>
                <Content className="k-size k-100percentHeight">
                    <Editor
                        editorState={editorState}
                        toolbarClassName="richedittext-toolbar"
                        wrapperClassName="richedittext-wrapper-modal"
                        editorClassName="richedittext-editor-modal"
                        onEditorStateChange={this._handleonEditorStateChange}
                    />
                </Content>
                <Actions>
                    <Button className="positive right labeled icon" onClick={this._handleOkModal}><FormattedMessage {...messages.ok} /><Icon className="checkmark" /></Button>
                    <Button className="cancel red right" onClick={this._handleCancelModal}> <FormattedMessage {...messages.cancel} /></Button>
                </Actions>
            </Modal>
       );
    }
}

module.exports = injectIntl(RichTextEditModal);
