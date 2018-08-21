'use strict';

import React from 'react';
import Immutable from 'immutable';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';

import {Avatar, Button} from '../semantify-extension';
import {ImmutableState} from '../../decorators';
import {UIActions} from '../../actions';

var StateRecord = Immutable.Record({showImageModel: false});

const messages = defineMessages(
{
    selectAvatarButton: {id: 'list.item.selectAvatar.button', description: 'Select Avatar', defaultMessage: 'Escolha um avatar'}
});

@ImmutableState
class AvatarField extends React.Component
{

    static displayName = 'AvatarField';

    static propTypes =
    {
        editableMode: React.PropTypes.bool,
        avatar: React.PropTypes.object.isRequired,
        avatarClassName: React.PropTypes.string,
        style: React.PropTypes.object,
        avatarLineHeight: React.PropTypes.string,
        onSelectAvatar: React.PropTypes.func
    };

    static defaultProps = {
        editableMode: false,
        avatarClassName: null
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord()};
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return this.state.data.showImageModel !== nextState.data.showImageModel ||
            this.props.editableMode !== nextProps.editableMode ||
            this.props.avatarClassName !== nextProps.avatarClassName ||
            this.props.avatar !== nextProps.avatar ||
            (this.props.avatar && nextProps.avatar && (
                this.props.avatar.icon !== nextProps.avatar.icon ||
                this.props.avatar.letter !== nextProps.avatar.letter ||
                this.props.avatar.imageSrc !== nextProps.avatar.imageSrc ||
                this.props.avatar.foreColor !== nextProps.avatar.foreColor ||
                this.props.avatar.backgroundColor !== nextProps.avatar.backgroundColor ||
                this.props.avatar.borderColor !== nextProps.avatar.borderColor ||
                this.props.avatar.borderWidth !== nextProps.avatar.borderWidth ||
                this.props.avatar.borderRadius !== nextProps.avatar.borderRadius

            ));
    }

    _handleTextEditModalTextChanged = (dataForm, field, text) =>
    {
        dataForm.updateData({[field.name]: text});
    };

    _handleTextEditModalCancel = () =>
    {
    };


    _handleSelectAvatarModalShow = (e) =>
    {
        if (e) {e.preventDefault();}
        let {avatar} = this.props;
        UIActions.showSelectAvatarModal.asFunction(avatar, this._handleSelectAvatarModalChange, this._handleSelectAvatarModalCancel);
    };

    _handleSelectAvatarModalChange = (avatar) =>
    {
        this.props.onSelectAvatar(avatar);
    };

    _handleSelectAvatarModalCancel = () =>
    {
    };

    render()
    {
        let that = this;
        let {avatarClassName, editableMode, avatar, avatarLineHeight, style} = this.props;
        let isToShowSelectAvatarButton = editableMode && (!avatar || (avatar && (!avatar.icon && !avatar.imageSrc && !avatar.letter)));
        let onAvatarClickEvent = editableMode ? this._handleSelectAvatarModalShow : null;
        return (
            <div className={avatarClassName} style={style}>
                <Avatar isToShowBackGroundColor style={{width: '40px', height: isToShowSelectAvatarButton ? null : '40px', lineHeight: avatarLineHeight, fontSize: '1.7em'}} avatar={avatar} onClick={onAvatarClickEvent} />
                {
                    isToShowSelectAvatarButton && this.props.editableMode &&
                        <Button onClick={that._handleSelectAvatarModalShow} className="basic tiny"><FormattedMessage {...messages.selectAvatarButton} /></Button>
                }
            </div>
        );
    }
}

module.exports = injectIntl(AvatarField);
