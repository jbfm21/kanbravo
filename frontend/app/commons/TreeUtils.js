'use strict';
import {LaneType} from '../enums';
import moment from 'moment';
import {default as FunctionHelper} from './FunctionHelper';

class TreeUtil
{
    static printTree(node)
    {
        let a = ' ';
        for (let i = 0; i < node.depth; i++)
        {
            a += '     ';
        }
        for (var f in node.children) //eslint-disable-line
        {
            TreeUtil.printTree(node.children[f]);
        }
    }

    /*
    * options.isToTransverseChildren: Function to check if is to transverse children or not
    *
    */
    static transverseAllNodesInPreOrderAndDoAction(node, action, options)
    {
        action(node);
        if (options.isToTransverseChildren && options.isToTransverseChildren(node))
        {
            for (var f in node.children) //eslint-disable-line
            {
                TreeUtil.transverseAllNodesInPreOrderAndDoAction(node.children[f], action, options);
            }
        }
    }

    static transverseAllNodesAndDoAction(rootNode, action)
    {
        let stack = [];
        stack.push(rootNode);

        while (stack.length > 0)
        {
            let node = stack.pop();
            action(node);
            if (node.children && node.children.length)
            {
                for (let ii = 0; ii < node.children.length; ii += 1)
                {
                    stack.push(node.children[ii]);
                }
            }
        }
        return rootNode;

    }

    static getAllLeafNodes(rootNode)
    {
        let stack = [];
        let leafNodes = [];
        stack.push(rootNode);
        while (stack.length > 0)
        {
            let node = stack.pop();
            if (node.children && node.children.length > 0)
            {
                stack.push(...node.children);
            }
            else
            {
                leafNodes.push(node);
            }
        }
        return leafNodes;
    }

    static calculateLeafNodes(node, calculateFunction)
    {
        if (!node.children || node.children.length === 0)
        {
            return calculateFunction(node);
        }
        return node.children.reduce(function(c, d)
        {
            if (FunctionHelper.isDefined(d.laneType) && d.laneType === LaneType.tracking.name)
            {
                return c + 0;
            }
            // c is the accumulator, we start with c=0
            // d is the node of the array that gets computed
            return c + TreeUtil.calculateLeafNodes(d, calculateFunction);
        }, 0);
    }

    static getFirstLeaf(node)
    {
        if (!node.children || node.children.length === 0)
        {
            return node;
        }
        return TreeUtil.getFirstLeaf(node.children[0]);
    }

    static getAllNodesInPreOrder(rootNode)
    {
        let stack = [];
        let nodes = [];
        stack.push(rootNode);
        nodes.push(rootNode);
        while (stack.length > 0)
        {
            let node = stack.shift();
            if (node.children && node.children.length > 0)
            {
                stack.push(...node.children);
                nodes.push(...node.children);
            }
        }
        return nodes;
    }

    static createTreeObjectOfMovementCards(movements)
    {
        let incrementedKey = 1;
        let root = {key: incrementedKey, showChildren: true, title: '', children: []};
        incrementedKey++;
        let lastMovementNode = null;
        for (let movementIndex = 0; movementIndex < movements.length; movementIndex++)
        {
            let movement = movements[movementIndex];
            let chain = movement.path.split('/');
            chain.shift(); //remove a primeira barra que vem vazio
            chain.shift(); //remove o root
            let currentNode = root;
            let lastCurrentNodeChildren = null;
            for (let chainIndex = 0; chainIndex < chain.length; chainIndex++) //eslint-disable-line
            {
                let wantedNode = chain[chainIndex];
                lastCurrentNodeChildren = currentNode.children[currentNode.children.length - 1];
                if (lastCurrentNodeChildren && wantedNode === lastCurrentNodeChildren.title)
                {
                    if (!lastCurrentNodeChildren.startDate)
                    {
                        lastCurrentNodeChildren.startDate = movement.startDate;
                    }
                    currentNode = currentNode.children[currentNode.children.length - 1];
                }
                else
                {
                    if (lastCurrentNodeChildren)
                    {
                        lastMovementNode.endDate = movement.startDate;
                    }
                    let nodeToPush = {showChildren: true, key: incrementedKey, depth: chainIndex, startDate: movement.startDate, laneType: movement.laneType, title: wantedNode, path: movement.path, activity: movement.activity, children: []};
                    incrementedKey++;
                    if (movement.laneType === LaneType.completed.name)
                    {
                        nodeToPush.endDate = movement.startDate;
                    }
                    currentNode.children.push(nodeToPush);
                    if (currentNode.children[currentNode.children.length - 2])
                    {
                        currentNode.children[currentNode.children.length - 2].endDate = movement.startDate;
                    }
                    currentNode = currentNode.children[currentNode.children.length - 1];
                    lastMovementNode = currentNode;
                }
            }
        }

        root.startDate = root.children[0].startDate;
        root.endDate = root.children[root.children.length - 1].endDate;

        let nodesInPreOrder = TreeUtil.getAllNodesInPreOrder(root);

        while (nodesInPreOrder.length > 0)
        {
            let node = nodesInPreOrder.pop();
            if (node.children.length > 0)
            {
                node.totalDuration = 0;
                node.workingDuration = 0;
                node.waitingDuration = 0;
                for (let nodeChildren of node.children)
                {
                    node.totalDuration += (nodeChildren.totalDuration) ? nodeChildren.totalDuration : 0;
                    node.workingDuration += (nodeChildren.workingDuration) ? nodeChildren.workingDuration : 0;
                    node.waitingDuration += (nodeChildren.waitingDuration) ? nodeChildren.waitingDuration : 0;
                }
                node.percentualWorking = (FunctionHelper.isDefined(node.workingDuration) && FunctionHelper.isDefined(node.totalDuration) && node.totalDuration > 0) ? (node.workingDuration / node.totalDuration) * 100 : 0;
            }
            else
            {
                node.totalDuration = moment(node.endDate).diff(moment(node.startDate), 'minutes');
                if (node.laneType === LaneType.inprogress.name)
                {
                    node.workingDuration = node.totalDuration;
                }
                else
                {
                    node.waitingDuration = node.totalDuration;
                }
            }
        }

        return root;
    }
}

module.exports = TreeUtil;

