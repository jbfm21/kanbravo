import React from 'react';
import Loader from 'react-loader';
import {default as FunctionHelper} from './FunctionHelper';

export default class LoadServerContent extends React.Component
{
    static displayName = 'LoadServerContent';

    static propTypes =
    {
        isLoading: React.PropTypes.bool,
        serverErrorMessage: React.PropTypes.string,
        children: React.PropTypes.node
    };

	componentWillUnmount ()
	{
		this.ignoreLastFetch = true;
	}

	//TODO: Verificar se o quadro é nulo, em caso de erro. caso tenha retornado erro, mostrar mensagem amigavel
    render()
	{
        let {serverErrorMessage, isLoading} = this.props;
        let finishLoadingWithSuccess = !isLoading && FunctionHelper.isUndefined(serverErrorMessage);
        return (
            <div>
                <Loader loaded={!isLoading} />
                {
                    finishLoadingWithSuccess && <div>{this.props.children}</div>
                }
            </div>
        );
    }
}
