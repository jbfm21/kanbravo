'use strict';

import React from 'react';
import Immutable from 'immutable';
import {injectIntl, defineMessages, FormattedMessage} from 'react-intl';

import {FaIcon, Float, Button} from '../../../../components';
import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';
import {default as EnumActionMode} from './EnumActionMode';
import {default as EnumTemplateMode} from './EnumTemplateMode';

const messages = defineMessages(
{
    editButton: {id: 'list.item.edit.button', description: 'Edit button', defaultMessage: 'Editar'},
    deleteButton: {id: 'list.item.delete.button', description: 'Delete button', defaultMessage: 'Excluir'},
    confirmDeleteButton: {id: 'list.item.delete.button.confirm', description: 'Confirm delete button', defaultMessage: 'Excluir'},
    saveButton: {id: 'list.item.save.button', description: 'Save button', defaultMessage: 'Salvar'},
    cancelButton: {id: 'list.item.cancel.button', description: 'Cancel button', defaultMessage: 'Cancelar'}
});

var StateRecord = Immutable.Record({actionMode: EnumActionMode.SelectMode});

@ImmutableState
@ImmutableShouldUpdateComponent
class ActionButtons extends React.Component
{
    static displayName = 'ActionButtons';

    static propTypes = {
        item: React.PropTypes.object,
        templateMode: React.PropTypes.oneOf([EnumTemplateMode.InsertTemplate.name, EnumTemplateMode.EditDeleteTemplate.name]),
        onSelectItem: React.PropTypes.func,
        onDeselectItem: React.PropTypes.func,
        onAddSubmit: React.PropTypes.func,
        onEditSubmit: React.PropTypes.func,
        onDeleteSubmit: React.PropTypes.func,
        isFormValid: React.PropTypes.func
    };

    constructor(props)
    {
        super(props);
        this.state = {data: new StateRecord()};
    }

    get actionMode()
    {
        return this.state.actionMode;
    }

    componentDidMount()
    {
    }

    isInInsertOrEditMode()
    {
        return this.state.data.actionMode === EnumActionMode.EditMode || this.props.templateMode === EnumTemplateMode.InsertTemplate.name;
    }

    setSelectMode()
    {
        this.setImmutableState({actionMode: EnumActionMode.SelectMode});
    }

    setEditMode()
    {
        this.setImmutableState({actionMode: EnumActionMode.EditMode});
    }

    _isFormValid = () =>
    {
        var form = this.props.item.form;
        var isValid = form.validate() && (!this.props.isFormValid || this.props.isFormValid());
        if (!isValid)
        {
            this.props.item.forceUpdate();
            return false;
        }
        return true;
    };

    _setItemSelectedMode(actionMode)
    {
        if (this.state.data.actionMode === actionMode)
        {
            return true;
        }
        let isItemSelected = this.props.onSelectItem(this.props.item);
        if (isItemSelected)
        {
            if (actionMode === EnumActionMode.EditMode)
            {
                this.props.item.enableFormForEdit();
            }
            this.setImmutableState({actionMode: actionMode});
        }
        return isItemSelected;
    }

    _unselectItem()
    {
        this.setSelectMode();
        this.props.onDeselectItem(this.props.item);
    }

    _handleAddSubmit = (e) =>
    {
        e.preventDefault();
        if (this._isFormValid())
        {
            this.props.onAddSubmit(this.props.item);
        }
    };

    _handleDeleteStart = (e) =>
    {
        e.preventDefault();
        this._setItemSelectedMode(EnumActionMode.DeleteMode);
    };

    _handleDeleteCancel = (e) =>
    {
        e.preventDefault();
        this._unselectItem();
    };

    _handleDeleteSubmit = (e) =>
    {
        e.preventDefault();
        this.props.onDeleteSubmit(this.props.item);
    };

    _handleEditStart = (e) =>
    {
        e.preventDefault();
        this._setItemSelectedMode(EnumActionMode.EditMode);
    };

    _handleEditCancel = (e) =>
    {
        e.preventDefault();
        this.props.item.resetForm();
        this.props.item.disableFormForEdit();
        this._unselectItem();
    };

    _handleEditSubmit = (e) =>
    {
        e.preventDefault();
        if (this._isFormValid())
        {
            this.props.onEditSubmit(this.props.item);
        }
    };

    render()
    {
        let buttonStyle = {marginRight: '5px'};
        return (
            <div>
                {(() =>
                 {
                    switch (this.props.templateMode)
                    {
                        case EnumTemplateMode.InsertTemplate.name:
                           return (
                               <Float className="right">
                                   <Button onClick={this._handleAddSubmit} className="add"><FaIcon className="fa-floppy-o fa-1x" style={buttonStyle}/><FormattedMessage {...messages.saveButton} /></Button>
                               </Float>
                           );
                         case EnumTemplateMode.EditDeleteTemplate.name:
                         default:
                            switch (this.state.data.actionMode)
                            {
                                case EnumActionMode.EditMode:
                                    return (
                                        <Float className="right">
                                            <Button onClick={this._handleEditSubmit} className="positive"><FaIcon className="fa-floppy-o fa-1x" style={buttonStyle} /><FormattedMessage {...messages.saveButton} /></Button>
                                            <Button onClick={this._handleEditCancel}><FaIcon className="fa-times-circle-o fa-1x" style={buttonStyle} /><FormattedMessage {...messages.cancelButton} /></Button>
                                        </Float>

                                    );
                                case EnumActionMode.DeleteMode:
                                    return (
                                        <Float className="right">
                                            <Button onClick={this._handleDeleteSubmit} className="negative"><FaIcon className="fa-trash fa-1x" style={buttonStyle} /><FormattedMessage {...messages.confirmDeleteButton} /></Button>
                                            <Button onClick={this._handleDeleteCancel}><FaIcon className="fa-times-circle-o fa-1x" style={buttonStyle} /><FormattedMessage {...messages.cancelButton} /></Button>
                                        </Float>
                                    );
                                case EnumActionMode.SelectMode:
                                default:
                                    return (
                                        <Float className="right">
                                            <Button onClick={this._handleEditStart} className="edit"><FaIcon className="fa-pencil fa-1x" style={buttonStyle} /><FormattedMessage {...messages.editButton} /></Button>
                                            <Button onClick={this._handleDeleteStart} className="delete"><FaIcon className="fa-trash fa-1x" style={buttonStyle} /><FormattedMessage {...messages.deleteButton} /></Button>
                                        </Float>
                                    );
                            }
                    }
                })()}
            </div>
       );
    }
}

module.exports = injectIntl(ActionButtons, {withRef: true});

