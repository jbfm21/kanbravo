'use strict';
import {ContextMenuLayer} from 'react-contextmenu';
import {default as KCard} from './KCard.jsx';

export default ContextMenuLayer('card_context_menu', (props) =>({name: props.card, lane: props.lane}))(KCard);
