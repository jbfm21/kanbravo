import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import Dropzone from 'react-dropzone';
import update from 'react/lib/update';
import {Header, Segment} from 'react-semantify';
import {FaIcon, Content} from '../../../../components';

import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';


import {default as AttachmentItem} from './AttachmentItem.jsx';

//TODO: implementar shouldUpdate

var StateRecord = Immutable.Record({attachments: [], newFiles: []});


const messages = defineMessages(
{
        newAttachmentPlaceHolder: {id: 'modal.cardForm.attachmentTab.newAttachment.placeHolder', description: 'New Attachment TextArea PlaceHolder', defaultMessage: 'Arraste um arquivo ou clique aqui'},
        cardAttachments: {id: 'modal.cardForm.attachmentTab.cardAttachments', description: '', defaultMessage: 'Anexos cadastrados'}
});


@ImmutableState
class AttachmentTab extends Component
{
    static displayName = 'AttachmentTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super();
        this.state = (FunctionHelper.isDefined(props.card.attachments)) ? {data: new StateRecord({attachments: props.card.attachments})} : {data: new StateRecord()};
    }

    componentWillReceiveProps(nextProps)
    {
        const attachments = (FunctionHelper.isDefined(nextProps.card.attachments)) ? nextProps.card.attachments : [];
        this.setImmutableState({attachments: attachments, newFiles: []});
    }

    getAttachments() //metodo chamado externamente
    {
        return this.state.data.attachments;
    }

    _handleDropFile = (files) =>
    {
        let newFiles = files.map(function (file)
        {
            file['id'] = FunctionHelper.uuid(); //eslint-disable-line
            file['isNew'] = true;                //eslint-disable-line
            return file;
		});
        const attachments = this.state.data.attachments.concat(newFiles);
        this.setImmutableState({attachments: attachments});
    };

    _handleDelete = (attachmentToDelete, e) =>
    {
        e.preventDefault();
        let attachmentList = this.state.data.attachments.map(function (attachment)
        {
			return attachment !== attachmentToDelete ? attachment : FunctionHelper.extend({}, attachment, {isDeleted: true});
		});
        this.setImmutableState({attachments: attachmentList});
	}

    _handleMove = (dragIndex, hoverIndex) =>
    {
        const {attachments} = this.state.data;
        const dragTask = attachments[dragIndex];
        const newAttachmentsList = update(attachments, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragTask]]});
        this.setImmutableState({attachments: newAttachmentsList});
    }

    render()
    {
        const {attachments} = this.state.data;

        let attachmentItems = attachments.filter(attachment => !attachment.isDeleted).map(function (attachment, i)
        {
            return (<AttachmentItem key={attachment.id} attachment={attachment} index={i} onMove={this._handleMove.bind(this)} onDelete={this._handleDelete.bind(this, attachment)}/>);
        }, this);

        return (
            <div style={{marginTop: '10px'}}>
                <Segment className="red">
                    <Content className="k-new-setting">
                        <Dropzone multiple onDrop={this._handleDropFile} style={{border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', width: '100%', height: '30px'}} >
                            <div style={{marginLeft: '10px'}}><FormattedMessage {...messages.newAttachmentPlaceHolder} /></div>
                        </Dropzone>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/><Content><FormattedMessage {...messages.cardAttachments} /></Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        <ul className="k-card-list-edit">
                            {attachmentItems}
                        </ul>
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(AttachmentTab, {withRef: true});
