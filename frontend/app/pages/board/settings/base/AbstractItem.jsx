'use strict';

import React from 'react';
//import Immutable from 'immutable';
//import {injectIntl} from 'react-intl';
import {List, Item as UIItem, Grid, Column} from 'react-semantify';
import Immutable from 'immutable';
import {_} from 'lodash';

import {ImmutableState, ImmutableShouldUpdateComponent} from '../../../../decorators';

import {default as ActionButtons} from './ActionButtons.jsx';
import {default as EnumTemplateMode} from './EnumTemplateMode';

@ImmutableState
@ImmutableShouldUpdateComponent
class Item extends React.Component
{

    static displayName = 'Item';

    static propTypes = {
        templateMode: React.PropTypes.oneOf([EnumTemplateMode.InsertTemplate.name, EnumTemplateMode.EditDeleteTemplate.name]),
        entity: React.PropTypes.object,
        boardId: React.PropTypes.string,
        onSelectItem: React.PropTypes.func,
        onDeselectItem: React.PropTypes.func,
        onAddSubmit: React.PropTypes.func,
        onEditSubmit: React.PropTypes.func,
        onDeleteSubmit: React.PropTypes.func
    };

    constructor(props, formDefinition, additionalStateData)
    {
        super(props);
        let immutableRecordMetaData = {editableMode: false, dataForm: null};
         _.assign(immutableRecordMetaData, additionalStateData);
        let StateRecord = Immutable.Record(immutableRecordMetaData);
        this.state = {data: new StateRecord({dataForm: new formDefinition({controlled: true, onChange: this._handleFormChange})})};
    }

    componentDidMount()
    {
        this.baseResetForm();
    }

    get form()
    {
        return this.state.data.dataForm;
    }

    getFormDataToSubmit() //esse metodo nao pode ser substituido por arrow function
    {
        const dataToSubmit = this.state.data.dataForm.cleanedData;
        if (this.props.entity)
        {
            let entityDataToSubmit = {};
            _.assign(entityDataToSubmit, this.props.entity); //faz uma cópia dos valores originais
            _.assign(entityDataToSubmit, dataToSubmit);
            return entityDataToSubmit;
        }
        return dataToSubmit;
    }

    baseResetForm() //esse metodo nao pode ser substituido por arrow function
    {
        this.state.data.dataForm.reset(this.props.entity);
    }

    enableFormForEdit = () =>
    {
        this.setImmutableState({editableMode: true});
    };

    disableFormForEdit = () =>
    {
        this.setImmutableState({editableMode: false});
    };

    editCompleted = () =>
    {
        this.actionButtons.getWrappedInstance().setSelectMode();
        this.disableFormForEdit();
    };

    _handleFormChange = () =>
    {
        this.forceUpdate();
    };

    render()
    {
        const that = this;
        let {editableMode, dataForm} = this.state.data;
        const {templateMode, onSelectItem, onDeselectItem, onAddSubmit, onEditSubmit, onDeleteSubmit} = this.props;
        editableMode = editableMode || (templateMode === EnumTemplateMode.InsertTemplate.name); //caso seja formulário de adição ativa o modo de edição
        return (
            <form>
                <List>
                    <UIItem>
                        <Grid style={{width: '100%'}}>
                            <Column className="thirteen wide">
                                {
                                    that.renderForm(editableMode, dataForm)
                                }
                            </Column>
                            <Column className="center aligned three wide">
                                <ActionButtons item={that} templateMode={templateMode} onSelectItem={onSelectItem} onDeselectItem={onDeselectItem} onAddSubmit={onAddSubmit} onEditSubmit={onEditSubmit} onDeleteSubmit={onDeleteSubmit} ref={c => {that.actionButtons = c; return;}} />
                            </Column>
                        </Grid>
                    </UIItem>
                </List>
            </form>
       );
    }
}

module.exports = Item;
