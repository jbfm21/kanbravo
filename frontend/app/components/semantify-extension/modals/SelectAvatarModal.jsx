'use strict';

import React from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import ColorPicker from 'react-color';
import classNames from 'classnames';
import {Header, Icon, Row, Column, Dropdown, Item, Input, Segment, Grid} from 'react-semantify';
import forms from 'newforms';
import Dropzone from 'react-dropzone';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../decorators';
import {IconProvider} from '../../../commons';
import {Modal, Button, Actions, Content, Avatar, FaIcon, MenuItems, SearchPaginatedGrid} from '../../../components';

import {default as SelectAvatarModalStore} from './SelectAvatarModalStore';

const COLOR_TYPE_TO_CUSTOMIZE = {foreColor: 'foreColor', backgroundColor: 'backgroundColor', borderColor: 'borderColor'};

const messages = defineMessages(
{
        modalTitle: {id: 'modal.selectAvatar.title', description: 'Modal Title', defaultMessage: 'Escolha um avatar'},
        selectAvatarResult: {id: 'modal.selectAvatar.result', description: 'Select image Result', defaultMessage: 'Resultado'},
        clearImageSelection: {id: 'modal.selectAvatar.clearSelection', description: 'Clear avatar selection', defaultMessage: 'Limpar seleção'},
        selectColor: {id: 'modal.selectAvatar.selectColor', description: 'Select Color', defaultMessage: 'Customizar cor: '},
        selectForeColor: {id: 'modal.selectAvatar.selectColor.foreColor', description: 'Select Fore Color', defaultMessage: 'Texto'},
        selectBackgroundColor: {id: 'modal.selectAvatar.selectColor.backgroundColor', description: 'Select Background Color', defaultMessage: 'Fundo'},
        selectBorderColor: {id: 'modal.selectAvatar.selectColor.borderColor', description: 'Select Border Color', defaultMessage: 'Borda'},
        applyLetterAvatar: {id: 'modal.selectAvatar.applyLetter', description: 'Apply Letter avatar', defaultMessage: 'Aplicar'},
        letters: {id: 'modal.selectAvatar.letter', description: 'Letter label', defaultMessage: 'Letras:'},
        image: {id: 'modal.selectAvatar.image', description: 'Image label', defaultMessage: 'Imagem:'},
        dropImage: {id: 'modal.selectAvatar.dropImage', description: 'Drop Image label', defaultMessage: 'Arraste uma imagem ou clique aqui'},
        dropImageHelp: {id: 'modal.selectAvatar.dropImage', description: 'Drop Image label', defaultMessage: '*utilize imagem preferencialmente de tamanho 60x60'},
        cancel: {id: 'modal.selectAvatar.cancel', description: 'Cancel model', defaultMessage: 'Cancelar'},
        ok: {id: 'modal.selectAvatar.selectAvatarAction', description: 'Select image action model', defaultMessage: 'Selecionar'}

});

var StateRecord = Immutable.Record({
    isToShowModal: false,
    avatarForm: null,
    icon: null,
    letter: null,
    imageSrc: null,
    imageFile: null,
    foreColor: {r: 0, g: 0, b: 0, a: 1},
    backgroundColor: {r: 255, g: 255, b: 255, a: 0},
    borderColor: {r: 0, g: 0, b: 0, a: 1},
    selectedColorTypeToCustomize: COLOR_TYPE_TO_CUSTOMIZE.foreColor,
    confirmFunction: null,
    cancelFunction: null
});

@airflux.FluxComponent
@ImmutableState
@ImmutableShouldUpdateComponent
class SelectAvatarModal extends React.Component
{
    static displayName = 'SelectAvatarModal';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor()
    {
        super();
        this.listenTo(SelectAvatarModalStore, this._listenToSelectAvatarModalStoreChange);

        let AvatarFormDefinition = forms.Form.extend({
            avatarLetter: forms.CharField({label: 'Letras', widgetAttrs: {placeholder: 'Digite no máximo 2 letras'}, initial: '', required: false, maxLength: 2, errorMessages: {invalid: 'Letras inválidas'}}),
            avatarImageFile: forms.ImageField({label: 'Imagem', widgetAttrs: {placeholder: 'Selecione uma imagem'}, initial: '', required: false, errorMessages: {invalid: 'Imagem inválida'}}),
            borderRadius: forms.DecimalField({label: 'Raio da Borda', widgetAttrs: {placeholder: ''}, initial: '', required: false, errorMessages: {invalid: 'Raio inválido'}}),
            borderWidth: forms.DecimalField({label: 'Tamanho da Borda', widgetAttrs: {placeholder: ''}, initial: '', required: false, errorMessages: {invalid: 'Tamanho inválido'}})
        });
        this.state = {data: new StateRecord({avatarForm: new AvatarFormDefinition({controlled: true, onChange: this._handleFormChange})})};
    }

    _listenToSelectAvatarModalStoreChange(store)
    {
        this.setImmutableState({isToShowModal: store.state.isToShowModal, confirmFunction: store.state.confirmFunction, cancelFunction: store.state.cancelFunction});
        if (store.state.avatar)
        {
            let {icon, letter, imageSrc, foreColor, backgroundColor, borderRadius, borderWidth} = store.state.avatar;
            this.setImmutableState({icon: icon, letter: letter, imageSrc: imageSrc, foreColor: foreColor, backgroundColor: backgroundColor});
            let form = this.state.data.avatarForm;
            form.setData({avatarLetter: letter, borderRadius: borderRadius, borderWidth: borderWidth});
        }
        this.forceUpdate();
    }

    _handleFormChange = () =>
    {
        this.forceUpdate();
    };

    _handleFormSubmit = (e) =>
    {
        e.preventDefault();
    };

    _closeModal = () =>
    {
        this.setImmutableState({isToShowModal: false, selectedColorTypeToCustomize: COLOR_TYPE_TO_CUSTOMIZE.foreColor});
    };

    _handleOkModal = (e) =>
    {
        e.preventDefault();
        this._closeModal();
        if (this.state.data.confirmFunction)
        {
            let {icon, letter, imageSrc, imageFile, foreColor, backgroundColor, borderColor, avatarForm} = this.state.data;
            let fields = avatarForm.boundFieldsObj();
            let borderWidth = fields.borderWidth.value();
            let borderRadius = fields.borderRadius.value();
            let avatar = {icon: icon, letter: letter, imageSrc: imageSrc, imageFile: imageFile, foreColor: foreColor, backgroundColor: backgroundColor, borderColor: borderColor, borderRadius: borderRadius, borderWidth: borderWidth};
            this.state.data.confirmFunction(avatar);
        }
    };

    _handleCancelModal = (e) =>
    {
        e.preventDefault();
        this._closeModal();
        if (this.state.data.cancelFunction)
        {
            this.state.data.cancelFunction();
        }
    };

    _handleSelectIcon = (icon) =>
    {
        this.setImmutableState({icon: icon, letter: null, imageSrc: null, imageFile: null});
        this.forceUpdate();
    };

    _handleApplyLetter = (e) =>
    {
        e.preventDefault();
        let {avatarForm} = this.state.data;
        let fields = avatarForm.boundFieldsObj();
        this.setImmutableState({icon: null, letter: fields.avatarLetter.value(), imageSrc: null, imageFile: null});
        this.forceUpdate();
    };

    _handleDropImage = (files) =>
    {
      this.setImmutableState({icon: null, letter: null, imageFile: files[0], imageSrc: files[0].preview});
    };

    _handleChangeColor = (color) =>
    {
         let {selectedColorTypeToCustomize} = this.state.data;
         this.setImmutableState({[selectedColorTypeToCustomize]: color.rgb});
    };

    _handleChangeColorTypeToCustomize= (selectedColorTypeToCustomize) =>
    {
        this.setImmutableState({selectedColorTypeToCustomize: selectedColorTypeToCustomize});
    };

    _handleClearSelection = () =>
    {
        this.setImmutableState({icon: null, letter: null, imageSrc: null, imageFile: null, foreColor: {r: 0, g: 0, b: 0, a: 1}, backgroundColor: {r: 255, g: 255, b: 255, a: 0}, borderColor: {r: 255, g: 255, b: 255, a: 0}});
    };

    _handleRenderGridItem = (iconName) =>
    {
        let {icon} = this.state.data;
        let className = classNames({gridItem: true, medium: true, notSelected: iconName !== icon, primary: iconName === icon, scaleOnHover: true});
        let iconClassName = classNames({gridItem: true, [`${iconName}`]: true});
        return (
            <Column key={iconName} value={iconName} onClick={this._handleSelectIcon.bind(this, iconName)}>
                <Button className={className}><FaIcon className={iconClassName} /> {iconName}</Button>
            </Column>
        );
    };

    _getColorToShowInColorPicker()
    {
        let {selectedColorTypeToCustomize, foreColor, backgroundColor, borderColor} = this.state.data;
        if (selectedColorTypeToCustomize === COLOR_TYPE_TO_CUSTOMIZE.foreColor) { return foreColor; }
        if (selectedColorTypeToCustomize === COLOR_TYPE_TO_CUSTOMIZE.backgroundColor) { return backgroundColor; }
        if (selectedColorTypeToCustomize === COLOR_TYPE_TO_CUSTOMIZE.borderColor) { return borderColor; }
        return null;
    }

    render()
    {
        let {isToShowModal, avatarForm, icon, letter, imageSrc, foreColor, backgroundColor, borderColor} = this.state.data;
        let fields = avatarForm.boundFieldsObj();
        let borderWidth = fields.borderWidth.value();
        let borderRadius = fields.borderRadius.value();
        let colorToShowInColorPicker = this._getColorToShowInColorPicker();
        let avatar = {icon: icon || '', letter: letter || null, imageSrc: imageSrc || null, foreColor: foreColor, backgroundColor: backgroundColor, borderColor: borderColor, borderRadius: borderRadius, borderWidth: borderWidth};
        return (
            <Modal className="k-select-avatar-modal" style="standard" size="fullscreen" isOpened={isToShowModal}>
                <Header className="k-background" style={{width: '100%', marginTop: '0px', marginBottom: '0px', padding: '0px', borderBottom: '1px solid black'}}>
                    <span style={{marginLeft: '10px', color: 'white', fontSize: '16px'}}><FormattedMessage {...messages.modalTitle} /></span>
                </Header>
                <Content className="k-size k-97percentHeight modal-content">
                    <Grid>
                        <Column className="two column-selected-avatar">
                            <Header><FormattedMessage {...messages.selectAvatarResult} /></Header>
                            <Content className="k-boxShadown">
                                <div className="k-centered.container" style={{marginBottom: '5px'}}>
                                    <Avatar isToShowBackGroundColor hostStyle={{width: null, height: null}} hostClassName={'k-display-inline-flex'} className={'k-display-inline'} style={{maxHeight: '60px', fontSize: '3.0em', padding: '10px', lineHeight: '1.2'}} avatar={avatar}/>
                                </div>
                                <Button className="mini basic" onClick={this._handleClearSelection}><FormattedMessage {...messages.clearImageSelection} /></Button>
                            </Content>
                            <Content style={{marginTop: '10px'}}>
                                <form name="avatarFormBoard" onSubmit={this._handleFormSubmit}>
                                    <span>Borda:</span> <Input className="mini">{fields.borderWidth.render({attrs: {style: {width: '60px'}}})}</Input>
                                    <span style={{marginLeft: '5px'}}>Raio:</span><Input className="mini">{fields.borderRadius.render({attrs: {style: {width: '60px'}}})}</Input>
                                </form>
                            </Content>
                            <Header>
                                <FormattedMessage {...messages.selectColor} />
                                <Dropdown className="inline" init>
                                    <div className="text"><FormattedMessage {...messages.selectForeColor} /></div>
                                    <Icon className="dropdown"/>
                                    <MenuItems className="transition hidden">
                                        <Item onClick={()=>this._handleChangeColorTypeToCustomize(COLOR_TYPE_TO_CUSTOMIZE.foreColor)}> <FormattedMessage {...messages.selectForeColor} /></Item>
                                        <Item onClick={()=>this._handleChangeColorTypeToCustomize(COLOR_TYPE_TO_CUSTOMIZE.backgroundColor)}> <FormattedMessage {...messages.selectBackgroundColor} /></Item>
                                        <Item onClick={()=>this._handleChangeColorTypeToCustomize(COLOR_TYPE_TO_CUSTOMIZE.borderColor)}> <FormattedMessage {...messages.selectBorderColor} /></Item>
                                    </MenuItems>
                                </Dropdown>
                            </Header>
                            <ColorPicker type="sketch" color={colorToShowInColorPicker} onChange={this._handleChangeColor} />
                        </Column>
                        <Column className="thirteen wide">
                            <form name="avatarForm" onSubmit={this._handleFormSubmit}>
                                <Grid>
                                    <Row>
                                        <Column className="eight wide">
                                            <Segment className="green" style={{marginTop: '0px', marginBottom: '0px'}}>
                                                <FormattedMessage {...messages.letters} /><Input className="small">{fields.avatarLetter.render({attrs: {style: {width: '100%'}}})}</Input>
                                                <Button className="small basic" style={{marginLeft: '10px'}} onClick={this._handleApplyLetter}> <FormattedMessage {...messages.applyLetterAvatar} /></Button>
                                            </Segment>
                                        </Column>
                                        <Column className="eight wide">
                                            <Segment className="red" style={{marginLeft: '10px', marginTop: '0px', marginBottom: '0px'}}>
                                                <FormattedMessage {...messages.image} />
                                                <Dropzone ref="dropzone" onDrop={this._handleDropImage} style={{paddingLeft: '2px', fontSize: '11px', marginLeft: '10px', width: '200px', height: '30px', borderWidth: '2px', borderColor: '#666', borderStyle: 'dashed', borderRadius: '5px', display: 'inline-block'}}>
                                                    <div><FormattedMessage {...messages.dropImage} /></div>
                                                </Dropzone>
                                                <span style={{fontSize: '12px', marginLeft: '10px'}}><FormattedMessage {...messages.dropImageHelp} /></span>
                                            </Segment>
                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column className="sixteen wide">
                                            <Segment className="blue k-size k-100percent">
                                                <SearchPaginatedGrid selectedItem={icon} provider={IconProvider} itemsPerPage={35} onRenderItem={this._handleRenderGridItem} className={'seven column withScrollBar text'}/>
                                            </Segment>
                                        </Column>
                                    </Row>
                                </Grid>
                            </form>
                        </Column>
                    </Grid>
                </Content>
                <Actions>
                    <Button className="positive right labeled icon" onClick={this._handleOkModal}><FormattedMessage {...messages.ok} /><Icon className="checkmark" /></Button>
                    <Button className="cancel red right" onClick={this._handleCancelModal}> <FormattedMessage {...messages.cancel} /></Button>
                </Actions>
            </Modal>
       );
    }
}

module.exports = injectIntl(SelectAvatarModal);
