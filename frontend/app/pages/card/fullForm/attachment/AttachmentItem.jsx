//TODO: Intercionalizar
import React, {Component, PropTypes} from 'react';
import {Grid, Column} from 'react-semantify';
import {defineMessages, injectIntl, intlShape, FormattedMessage, FormattedDate, FormattedTime} from 'react-intl';
import {Label} from 'react-semantify';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';
import {Icon} from 'react-semantify';

import {FaIcon, Button, Bytes} from '../../../../components';
import {KanbanActions} from '../../../../actions';


const dragSource =
{
    beginDrag(props)
    {
        return {id: props.id, index: props.index};
    }
};

const dragTarget =
{
    hover(props, monitor, component)
    {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        // Don't replace items with themselves
        if (dragIndex === hoverIndex)
        {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY)
        {
            return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
        {
            return;
        }

        // Time to actually perform the action
        props.onMove(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
  }
};

const messages = defineMessages(
{
        delete: {id: 'modal.cardForm.attachmentTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
        new: {id: 'modal.cardForm.attachmentTab.new.label', description: 'New attachment', defaultMessage: 'novo'}
});

@DropTarget('ATTACHMENT', dragTarget, connect => ({connectDropTarget: connect.dropTarget()}))
@DragSource('ATTACHMENT', dragSource, (connect, monitor) => ({connectDragSource: connect.dragSource(), isDragging: monitor.isDragging()}))
class AttachmentItem extends Component
{
    static displayName = 'AttachmentItem';

    static propTypes =
    {
        attachment: PropTypes.object.isRequired,
        onDelete: PropTypes.func.isRequired,
        onMove: PropTypes.func.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        isDragging: PropTypes.bool.isRequired,
        intl: intlShape.isRequired
    };

    constructor()
    {
        super();
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        return (
            nextProps.attachment !== this.props.attachment ||
            nextProps.isDragging !== this.props.isDragging
        );
    }

    _handleDownloadFile = (e) =>
    {
        e.preventDefault();
        KanbanActions.card.downloadAttachment.asFunction(this.props.attachment.path, this.props.attachment.name);
    }

    render()
    {
        const {attachment, onDelete, isDragging, connectDragSource, connectDropTarget} = this.props;
        const lastModifiedDate = new Date(attachment.lastModifiedDate);
        const opacity = isDragging ? 0 : 1;
        return connectDragSource(connectDropTarget(
            <li style={{opacity: opacity}}>
                <Grid style={{width: '100%'}} >
                    <Column style={{width: '2%'}}>
                    {
                        attachment.isNew && <Label className="mini blue" style={{padding: '3px'}}><FormattedMessage {...messages.new}/></Label>
                    }
                    {
                        !attachment.isNew && <Icon className="download" style={{padding: '3px'}} onClick={this._handleDownloadFile}/>
                    }
                    </Column>
                    <Column className="six wide taskLabel">
                        <label >
                            {attachment.name}
                        </label>
                    </Column>
                    <Column className="two wide taskLabel">
                        <label><FormattedDate value={lastModifiedDate}/> <FormattedTime value={lastModifiedDate}/></label>
                    </Column>
                    <Column className="one wide taskLabel">
                        <Bytes bytes={attachment.size} />
                    </Column>
                    <Column className="four wide taskLabel">
                        <label>{attachment.type}</label>
                    </Column>
                    <Column style={{width: '8%'}}><Button onClick={onDelete} className="mini negative"><FaIcon className="fa-trash fa-1x"/><FormattedMessage {...messages.delete} /></Button></Column>
                </Grid>
            </li>
        ));
    }
}

module.exports = injectIntl(AttachmentItem);
