import React, {Component, PropTypes} from 'react';
import {Editor} from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import {convertToRaw, EditorState, ContentState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
//import draftToMarkdown from 'draftjs-to-markdown';
import Immutable from 'immutable';

import {FunctionHelper} from '../../../../commons';

import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../../decorators';

var StateRecord = Immutable.Record({editorState: EditorState.createEmpty()});

@ImmutableShouldUpdateComponent
@ImmutableState
export default class StatefullRichTextEditor extends Component
{
    static propTypes =
    {
        htmlValue: PropTypes.string,
        wrapperClassName: PropTypes.string
    };

    static defaultProps =
    {
        wrapperClassName: 'richedittext-wrapper'
    };


    constructor()
    {
        super();
        this.state = {data: new StateRecord({editorState: EditorState.createEmpty()})};
    }

    componentWillMount()
    {
        if (FunctionHelper.isDefined(this.props.htmlValue))
        {
            const contentBlock = htmlToDraft(this.props.htmlValue);
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const inputEditorState = EditorState.createWithContent(contentState);
            this.setImmutableState({editorState: inputEditorState});
        }
        else
        {
            this.setImmutableState({editorState: EditorState.createEmpty()});
        }
    }

    _handleonEditorStateChange = (editorContent) =>
    {
        this.setImmutableState({editorState: editorContent});
    };

    clearText()
    {
        this.setImmutableState({editorState: EditorState.createEmpty()});
    }

    setHtmlValue(text) //eslint-disable-line
    {
        const contentBlock = htmlToDraft(text);
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const inputEditorState = EditorState.createWithContent(contentState);
        this.setImmutableState({editorState: inputEditorState});
    }

    getHtmlValue()
    {
        return draftToHtml(convertToRaw(this.state.data.editorState.getCurrentContent()));
    }

    render()
    {
        return (
            <Editor
                editorState={this.state.data.editorState}
                toolbarClassName="richedittext-toolbar"
                wrapperClassName={this.props.wrapperClassName}
                editorClassName="richedittext-editor"
                onEditorStateChange={this._handleonEditorStateChange}
            />
        );
    }
}
