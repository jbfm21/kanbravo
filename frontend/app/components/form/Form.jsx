'use strict';

import React from 'react';
import Loader from 'react-loader';
import {Form as FormUI} from 'react-semantify';
import {FormField, FormToast, Button} from '../../components';

export default class Form extends React.Component
{
    static displayName = 'Form';

    static propTypes =
    {
        formKey: React.PropTypes.string.isRequired,
        form: React.PropTypes.object.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        actionLabel: React.PropTypes.string.isRequired,
        errorMessageToShow: React.PropTypes.string,
        isLoading: React.PropTypes.bool.isRequired,
        children: React.PropTypes.node
    };

    constructor()
    {
        super();
    }

    _handleFormSubmit = (e) =>
    {
            e.preventDefault();
            var form = this.props.form;
            var isValid = form.validate();
            if (!isValid)
            {
                return;
            }
            this.props.onSubmit(form.cleanedData, form.data);
    };

    render()
    {
        let {form, errorMessageToShow, actionLabel, isLoading} = this.props;
        return (
            <FormUI className="segment error">
                <Loader loaded={!isLoading} />
                {
                    form.boundFields().map((bf) => <FormField key={bf.htmlName} boundField={bf} containerClassName={'tiny-fields-separator'} showErrorMessage/>)
                }
                <FormToast message={errorMessageToShow} kind="negative" />
                <Button className="positive" disabled={isLoading} onClick={this._handleFormSubmit}>{actionLabel}</Button>
                {this.props.children}
            </FormUI>

        );
    }
}

