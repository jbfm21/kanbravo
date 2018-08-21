//TODO: intercionalizar
'use strict';

import moment from 'moment';

import {default as FunctionHelper} from './FunctionHelper';
import {default as constants} from './Constants';
import {WipStatus, AgingType, LaneType, VisualStyle} from '../enums';

export default class BoardLayoutHelper
{
    static defaultVisualStyle()
    {
        return {title: 'Completo', type: VisualStyle.full.name, orientation: 'horizontal'};
    }

    static isToShow(visualStyleConfig, visualEntityName)
    {
        if (FunctionHelper.isUndefined(visualStyleConfig))
        {
            return true;
        }
        switch (visualStyleConfig.type)
        {
            case VisualStyle.compact.name:
                return ((visualEntityName === 'cardAssignedMember') || (visualEntityName === 'cardTaskBar') || (visualEntityName === 'cardInformation'));
            case VisualStyle.template.name:
                if ((visualEntityName === 'assignMemberToolTip') || (visualEntityName === 'cardTaskBar') || (visualEntityName === 'cardComments'))
                {
                    return false;
                }
                return true;
            case VisualStyle.full.name:
                return true;
            default:
                return visualStyleConfig[visualEntityName];
        }
    }

    static getLaneTypeAvatar(laneType, undefinedLaneTypeIcon)
    {
        if (FunctionHelper.isUndefined(laneType))
        {
            return (FunctionHelper.isUndefined(undefinedLaneTypeIcon)) ? {} : {icon: undefinedLaneTypeIcon, foreColor: {a: 1, b: 0, g: 0, r: 0}, backgroundColor: {a: 0, b: 255, g: 255, r: 255}};
        }
        switch (laneType.toLowerCase())
        {
            case LaneType.inprogress.name: return constants.INPROGRESS_ICON;
            case LaneType.wait.name: return constants.WAIT_ICON;
            case LaneType.ready.name: return constants.READY_ICON;
            case LaneType.tracking.name: return constants.TRACKING_ICON;
            case LaneType.completed.name: return constants.COMPLETED_ICON;
            default: return {};
        }
    }

    static getLaneInformation(lane, index, numberOfSlibingLanes)
    {
        const isFirstLane = index === 0;
        const isLastLane = (numberOfSlibingLanes - 1) === index;
        const isMiddleLane = !isFirstLane && !isLastLane;
        const isLeafLane = FunctionHelper.isUndefined(lane.children) || lane.children.length === 0;
        const isTopLevelLane = lane.depth === 1;
        const isHorizontalLane = lane.orientation === constants.LANE_HORIZONTAL_ORIENTATION;
        const isVerticalLane = !isHorizontalLane;
        const isHorizontalChildrenOrientation = !isLeafLane && lane.children[0].orientation === constants.LANE_HORIZONTAL_ORIENTATION;
        const isVerticalChildrenOrientation = !isLeafLane && lane.children[0].orientation === constants.LANE_VERTICAL_ORIENTATION;
        const dropZoneWidth = (lane.cardsWide * constants.CARD_WIDTH);

        return {
            isFirstLane: isFirstLane,
            isLastLane: isLastLane,
            isMiddleLane: isMiddleLane,
            isLeafLane: isLeafLane,
            isTopLevelLane: isTopLevelLane,
            isHorizontalLane: isHorizontalLane,
            isVerticalLane: isVerticalLane,
            isHorizontalChildrenOrientation: isHorizontalChildrenOrientation,
            isVerticalChildrenOrientation: isVerticalChildrenOrientation,
            dropZoneWidth: dropZoneWidth
        };
    }


    static getWipLimitStatus(wip, wipLimit)
    {
        if (wipLimit && wipLimit > 0)
        {
            if (wip < wipLimit) {return WipStatus.Below;}
            if (wip === wipLimit) {return WipStatus.OnTheEdge;}
            if (wip > wipLimit) {return WipStatus.Overflow;}
        }
        return WipStatus.Undefined;
    }

    static getWipOverFlowColor(wip, wipLimit)
    {
        let status = BoardLayoutHelper.getWipLimitStatus(wip, wipLimit);
        if (status === WipStatus.Below) {return constants.WIP_BELOW_COLOR;}
		if (status === WipStatus.OnTheEdge) {return constants.WIP_ONTHEEDGE_COLOR;}
		if (status === WipStatus.Overflow) {return constants.WIP_OVERFLOW_COLOR;}
        return constants.WIP_WITHOUTWIP_COLOR;
    }

    static getLaneWipLimitStatus(lane, wip)
    {
        return BoardLayoutHelper.getWipLimitStatus(wip, lane.wipLimit);
    }

    static getIsLaneWipOverFlowColor(lane, wip)
    {
        return BoardLayoutHelper.getWipOverFlowColor(wip, lane.wipLimit);
    }

    static getCardAgingBackground(agingConfigurations, card, selectedAgingType)
    {
        if (selectedAgingType === AgingType.none.name)
        {
            return null;
        }
        const dateToVerifyAge = moment(card.dateMetrics[selectedAgingType]).startOf('day');
        const now = moment().startOf('day');
        const numberOfDaysUntilNow = now.diff(dateToVerifyAge, 'days');

        for (let agingConfig of agingConfigurations) //eslint-disable-line
        {
            if (numberOfDaysUntilNow >= agingConfig.numberOfDays)
            {
                if (FunctionHelper.isUndefined(agingConfig.avatar))
                {
                    return null;
                }
                if (FunctionHelper.isDefined(agingConfig.avatar.imageSrc))
                {
                    return `url(${FunctionHelper.getDomainPath()}${agingConfig.avatar.imageSrc})`;
                }
                return FunctionHelper.convertRgbaToString(agingConfig.avatar.backgroundColor);
            }
        }
        return null;
    }

    static getRemainingDaysColor(numberOfDays)
    {
        if (numberOfDays > constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE)
        {
            return constants.DATE_INDATE_COLOR_WHITE;
        }
        if ((numberOfDays >= 0) && (numberOfDays <= constants.DATE_NUMBER_OF_DATES_TO_BE_IN_WARNING_STAGE))
        {
            return constants.DATE_WARNING_COLOR;
        }
        return constants.DATE_LATE_COLOR;
    }

    static isVerticalOrientation(selectedVisualStyle)
    {
        return (selectedVisualStyle && selectedVisualStyle.orientation && selectedVisualStyle.orientation === 'vertical');
    }
}


