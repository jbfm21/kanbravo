'use strict';
import * as airflux from 'airflux';

const UIActions =
{

    //Toast Actions
    showServerSuccessMessage: new airflux.Action(),
    showServerErrorMessage: new airflux.Action(),
    showClientSuccessMessage: new airflux.Action(),
    showClientErrorMessage: new airflux.Action(),
    contextUpdated: new airflux.Action(),

    //Modal Functions
    showTextEditModal: new airflux.Action(), //params:  (text, confirmFunction, cancelFunction)
    showRichTextEditModal: new airflux.Action(), //params:  (text, textFormat, confirmFunction, cancelFunction)
    showCardFormModal: new airflux.Action(), //params:  (boardId, card)
    showParentCardFormModal: new airflux.Action(), //params:  (boardId, card)
    showFeedbackFormModal: new airflux.Action(), //params:  (feedback)
    showCardTemplateFormModal: new airflux.Action(), //params:  (card, confirmFunction, cancelFunction)
    showSelectAvatarModal: new airflux.Action(), //params:  (avatar, confirmFunction, cancelFunction)
    showCardCommentModal: new airflux.Action(), //params:  (card)
    refreshMemberWipPanel: new airflux.Action(), //params:  ()

    refreshCacheBoardAllConfiguration: new airflux.Action(), //params:  ()

    goToBoardSettingAfterAddNewBoard: new airflux.Action(),
    goToBoardShowAfterAddNewBoard: new airflux.Action(),
    setBoardVisualStyle: new airflux.Action(),
    setBoardAgingExhibitionMode: new airflux.Action(),
    setBoardSwimLaneStyle: new airflux.Action(),
    setShowProjectLegend: new airflux.Action(),
    setShowMemberWipPanel: new airflux.Action(),

    contextMenuShowCardCustomFieldPopup: new airflux.Action(),
    contextMenuShowCardTaskPopup: new airflux.Action(),
    contextMenuShowCardCommentPopup: new airflux.Action(),
    contextMenuShowCardImpedimentPopup: new airflux.Action(),
    contextMenuEditCard: new airflux.Action(),

    highlightCard: new airflux.Action(), //param: selectedItems, isTOHide

    //drag and drop card actions
    moveCardUI: new airflux.Action(),
    attachCardToLaneUI: new airflux.Action(),
    endDragCardUI: new airflux.Action(),
    refreshAllLanes: new airflux.Action(),
    refreshHeaderWip: new airflux.Action(),
    removeCardFromUI: new airflux.Action()

};

module.exports = UIActions;
