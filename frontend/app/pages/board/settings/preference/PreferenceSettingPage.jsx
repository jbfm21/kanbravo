import React from 'react';
import * as airflux from 'airflux';
import _ from 'lodash';
import Immutable from 'immutable';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {Header, Segment} from 'react-semantify';
import Loader from 'react-loader';
import forms from 'newforms';

import {KanbanActions} from '../../../../actions';
import {FormDefinition} from '../../../../commons';
import {Container, Content, Meta, FaIcon, FormField, Button, FormToast} from '../../../../components';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../../decorators';
import {default as PreferenceSettingStore} from './PreferenceSettingStore';

const messages = defineMessages(
{
    title: {id: 'preferenceSetting.title', description: 'Preference Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'preferenceSetting.subtitle', description: 'Preference Setting subtitle', defaultMessage: 'Personaliza aqui as suas preferências'},
    notificationTitle: {id: 'preferenceSetting.notification.title', description: 'Preference Setting title for Notification', defaultMessage: 'Notificações (em breve)'},
    listTitle: {id: 'preferenceSetting.list.title', description: 'Preference Setting list title', defaultMessage: 'Cartões (em breve poderá customizar o layout dos cartões)'},
    updateSuccess: {id: 'boardPreference.update.success', description: 'boardPreference update success', defaultMessage: 'Informações atualizadas com sucesso.'}
});

var StateRecord = Immutable.Record({isLoading: false, preferenceForm: null, boardMember: null, actionMessage: null, messageKind: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class PreferenceSettingPage extends React.Component
{
    static displayName = 'PreferenceSettingPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    constructor(props)
    {
        super(props);
        this.pageName = 'PreferenceSettingPage';

        this.listenTo(PreferenceSettingStore, this._listenToPreferenceSettingStoreChange);

        const formDefinition = new FormDefinition(this.props.intl);

        const PreferenceFormEntity = forms.Form.extend({
            isToReceiveBoardChangeNotification: forms.BooleanField(formDefinition.formFields.isToReceiveBoardChangeNotification)
        });

        this.state = {data: new StateRecord({preferenceForm: new PreferenceFormEntity({controlled: true, onChange: this._handleFormChange})})};
    }

    componentWillMount()
    {
        KanbanActions.boardSetting.boardMember.getLoggedUserBoardPreference.asFunction(this.props.params.boardId);
    }

    _listenToPreferenceSettingStoreChange(store) //eslint-disable-line no-unused-vars
    {
        switch (store.actionState)
        {
            case KanbanActions.boardSetting.boardMember.getLoggedUserBoardPreference.progressed:
            case KanbanActions.boardSetting.boardMember.updateBoardMemberPreference.progressed:
                this.setImmutableState({isLoading: true, actionMessage: null});
                break;

            case KanbanActions.boardSetting.boardMember.getLoggedUserBoardPreference.failed:
            case KanbanActions.boardSetting.boardMember.updateBoardMemberPreference.failed:
                this.setImmutableState({isLoading: false, messageKind: 'negative', actionMessage: store.actionMessage});
                break;

            case KanbanActions.boardSetting.boardMember.getLoggedUserBoardPreference.completed:
                this.state.data.preferenceForm.reset(store.state.boardMember.boardPreference);
                this.setImmutableState({isLoading: false, actionMessage: null, boardMember: store.state.boardMember});
                break;

            case KanbanActions.boardSetting.boardMember.updateBoardMemberPreference.completed:
                this.state.data.preferenceForm.reset(store.state.boardMember.boardPreference);
                const {formatMessage} = this.props.intl;
                this.setImmutableState({isLoading: false, messageKind: 'positive', actionMessage: formatMessage(messages.updateSuccess), boardMember: store.state.boardMember});
                break;

            default: break;
        }
    }

    _handleFormChange = () =>
    {
        this.setImmutableState({actionMessage: null});
        this.forceUpdate();
    };

    _handleFormSubmit = (e) =>  //eslint-disable-line no-unused-vars
    {
        e.preventDefault();
        let {boardMember, preferenceForm} = this.state.data;
        _.assign(boardMember.boardPreference, preferenceForm.cleanedData);
        KanbanActions.boardSetting.boardMember.updateBoardMemberPreference.asFunction(boardMember);
    };

    render()
    {
        const iconHeaderStyle = {marginRight: 10 + 'px'};
        const {isLoading, actionMessage, messageKind, preferenceForm} = this.state.data;
        const fields = preferenceForm.boundFieldsObj();

        return (
            <form name="formPreference">
                <Container className={`setting segments ${this.pageName}`}>
                    <Loader loaded={!isLoading} />
                    <Segment className="clearing">
                        <Header className="left floated" style={{width: '80%'}}>
                            <FormattedMessage {...messages.title} />
                            <Meta style={{fontSize: '14px', lineHeight: '1.4285em', fontWeight: 'normal', marginTop: '10px'}}><FormattedMessage {...messages.subtitle} /></Meta>
                            <FormToast message={actionMessage} kind={messageKind} />
                        </Header>
                        <Header className="right floated">
                            <Button className="positive" onClick={this._handleFormSubmit}>Salvar</Button>
                        </Header>
                    </Segment>
                    <Segment className="red">
                        <Header>
                            <FaIcon className="fa-envelope" style={iconHeaderStyle}/><Content><FormattedMessage {...messages.notificationTitle} /></Content>
                        </Header>
                        <Content className="add form">
                            <div className="ui relaxed horizontal list" style={{padding: '0px', display: 'inline-flex', width: '100%'}}>
                                <div className="item"><FormField editableMode disabled={false} inputClassName="mini" showLabel boundField={fields.isToReceiveBoardChangeNotification} requiredIcon=""/></div>
                            </div>
                        </Content>
                    </Segment>
                    <Segment className="blue">
                        <Header>
                            <FaIcon className="fa-list-alt" style={iconHeaderStyle}/><Content><FormattedMessage {...messages.listTitle} /></Content>
                        </Header>
                        <Content className="list form text withScrollBar" />
                    </Segment>
                </Container>
            </form>
        );
    }
}

module.exports = injectIntl(PreferenceSettingPage);
