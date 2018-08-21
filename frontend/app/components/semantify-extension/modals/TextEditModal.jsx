'use strict';

import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';

import {Modal, Button, Actions, Content} from '../../../components';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../decorators';
import {default as TextEditModalStore} from './TextEditModalStore';

const messages = defineMessages(
{
        modalTitle: {id: 'modal.textEdit.title', description: 'Modal Title', defaultMessage: 'Editor de texto'},
        cancel: {id: 'modal.textEdit.cancel', description: 'Cancel model', defaultMessage: 'Cancelar'},
        ok: {id: 'modal.textEdit.confirm', description: 'Confirm text editor', defaultMessage: 'Confirmar'}
});

var StateRecord = Immutable.Record({isToShowModal: false, text: '', confirmFunction: null, cancelFunction: null, options: {}});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class TextEditModal extends React.Component
{
    static displayName = 'TextEditModal';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor()
    {
        super();
        this.listenTo(TextEditModalStore, this._listenToTextEditModalStoreChange);
        this.state = {data: new StateRecord({})};
    }

    _listenToTextEditModalStoreChange(store)
    {
        this.setImmutableState({isToShowModal: store.state.isToShowModal, confirmFunction: store.state.confirmFunction, cancelFunction: store.state.cancelFunction, text: store.state.text, options: store.state.options});
        this.forceUpdate();
    }

    _handleOkModal = (e) =>
    {
        e.preventDefault();
        this.setImmutableState({isToShowModal: false});
        if (this.state.data.confirmFunction)
        {
            let {text} = this.state.data;
            this.state.data.confirmFunction(text);
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

    _handleChange = (e) =>
    {
        this.setImmutableState({text: e.target.value});
    };

    render()
    {
        let {isToShowModal, text, options} = this.state.data;
        return (
            <Modal className="TextEditModal" style="standard" size="fullscreen" isOpened={isToShowModal}>
                <Header className="k-background" style={{width: '100%', marginTop: '0px', marginBottom: '0px', padding: '0px', borderBottom: '1px solid black'}}>
                    <span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.modalTitle} /></span>
                </Header>
                <Content>
                    <textarea rows="20" style={{width: '100%'}} maxLength={options.maxLength} value={text} onChange={this._handleChange}/>
                </Content>
                <Actions>
                    <Button className="positive right labeled icon" onClick={this._handleOkModal}><FormattedMessage {...messages.ok} /><Icon className="checkmark" /></Button>
                    <Button className="cancel red right" onClick={this._handleCancelModal}> <FormattedMessage {...messages.cancel} /></Button>
                </Actions>
            </Modal>
       );
    }
}

module.exports = injectIntl(TextEditModal);
