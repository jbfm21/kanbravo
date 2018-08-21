'use strict';

import React from 'react';
import * as airflux from 'airflux';
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import {Form, Header, Card, Grid, Column} from 'react-semantify';
import Immutable from 'immutable';
import forms from 'newforms';

import {FormField, Button, Content, Description, LoadServerContent, FormToast} from '../../components';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../decorators';
import {FormDefinition, FunctionHelper} from '../../commons';
import {KanbanActions} from '../../actions';

import {default as FeedBackStore} from './FeedBackStore';
import {default as constants} from '../../commons/Constants';

const messages = defineMessages(
{
    addPopupTitle: {id: 'navbar.addCard.popup.title', description: 'Add card popup title', defaultMessage: 'O que está achando do produto?'},
    saveButton: {id: 'feedbackForm.button.save', description: 'save button', defaultMessage: 'Enviar'},
    feedbackAddSuccess: {id: 'feedbackForm.add.success', description: 'Feedback add success', defaultMessage: 'Olá, obrigado pelo apoio. Em breve analisaremos o seu comentário...'}
});

const StateRecord = Immutable.Record({isLoading: false, feedbackForm: null, actionMessage: null, messageKind: null});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class FeedbackForm extends React.Component
{
    static _textAreaId = '#addFeedBackTitleTextArea';
    static displayName = 'FeedbackForm';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
        this.listenTo(FeedBackStore, this._listenToFeedbackFormStoreChange);
        const formDefinition = new FormDefinition(this.props.intl);
        const FeedbackFormEntity = forms.Form.extend({title: forms.CharField(formDefinition.formFields.feedbackTitle)});
        this.state = {data: new StateRecord({feedbackForm: new FeedbackFormEntity({controlled: true, onChange: this.forceUpdate.bind(this)})})};
    }

    componentDidMount()
    {
        window.$(FeedbackForm._textAreaId).bind('keypress', this._onFeedBackTextAreaKeyPress.bind(this)); //eslint-disable-line
    }

    _listenToFeedbackFormStoreChange(store)
    {
        switch (store.actionState)
        {
            case KanbanActions.feedback.add.progressed:
                this._clearUI();
                this.setImmutableState({isLoading: true});
                break;
            case KanbanActions.feedback.add.completed:
                const {feedbackForm} = this.state.data;
                const {formatMessage} = this.props.intl;
                feedbackForm.reset({status: feedbackForm.cleanedData.status});
                this.setImmutableState({isLoading: false, messageKind: 'positive', actionMessage: formatMessage(messages.feedbackAddSuccess)});
                break;
            case KanbanActions.feedback.add.failed:
                this.setImmutableState({isLoading: false, messageKind: 'negative', actionMessage: store.actionMessage});
                break;
            default: break;
        }
    }

    _handleFeedbackFormSubmit = (e) =>  //eslint-disable-line no-unused-vars
    {
        e.preventDefault();
        const {feedbackForm} = this.state.data;
        if (!feedbackForm.validate())
        {
            return;
        }
        KanbanActions.feedback.add.asFunction(feedbackForm.cleanedData);
    };

    _clearUI()
    {
        if (FunctionHelper.isNotNullOrEmpty(this.state.data.actionMessage))
        {
            this.setImmutableState({actionMessage: '', messageKind: null});
        }
    }

    _onFeedBackTextAreaKeyPress = (e) =>
    {
        this._clearUI();
        if ((e.keyCode || e.which) === constants.ENTER_KEY)
        {
            this._handleFeedbackFormSubmit(e);
        }
    }

    render()
    {
        const {isLoading, feedbackForm, actionMessage, messageKind} = this.state.data;
        const fields = feedbackForm.boundFieldsObj();
        return (
            <Form name="feedbackForm">
                <LoadServerContent isLoading={isLoading} />
                <Card style={{width: '100%', borderWidth: '0px', boxShadow: 'none'}}>
                    <Content>
                        <Header><FormattedMessage {...messages.addPopupTitle} /></Header>
                        <Description>
                            <Grid>
                                <Column className="sixteen wide">
                                    <FormField editableMode inputClassName="title" style={{marginTop: '5px'}} showLabel={false} showErrorMessage={false} boundField={fields.title} requiredIcon=""/>
                                    <FormToast message={actionMessage} kind={messageKind} style={{fontSize: '10px', marginTop: '5px'}} />
                                </Column>
                            </Grid>
                        </Description>
                    </Content>
                    <Content className="extra">
                        <div className="ui buttons">
                            <Button disable={isLoading} onClick={this._handleFeedbackFormSubmit}><FormattedMessage {...messages.saveButton} /></Button>
                        </div>
                    </Content>
                </Card>
            </Form>
        );
    }
}

module.exports = injectIntl(FeedbackForm);
