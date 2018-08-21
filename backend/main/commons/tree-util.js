'use strict';

var _ = require('lodash');

class TreeUtil
{

    static createNodePathString(leafNode)
    {
        let path = '';
        TreeUtil.transverseLeafNodeToParentAndDoAction(leafNode, (node) =>
        {
            let parentTitle = (node && node.title) ? node.title : 'root';
            path = '/' + parentTitle + path;
        });
        return path;
    }
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

    static findNodeByPredicate(root, predicate)
    {
        return _([root]).flattenDeep().find(predicate);
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

    static transversePreOrderAllNodesAndDoAction(rootNode, action)
    {
        for (var f in rootNode.children) //eslint-disable-line
        {
            action(rootNode.children[f]);
            TreeUtil.transversePreOrderAllNodesAndDoAction(rootNode.children[f], action);
        }
    }

    static transverseLeafNodeToParentAndDoAction(leaftNode, action)
    {
        let stack = [];
        stack.push(leaftNode);
        while (stack.length > 0)
        {
            let node = stack.pop();
            action(node);
            if (node.parent)
            {
                stack.push(node.parent);
            }
        }
    }

    static getNodeById(root, id, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            addParentReference: false
        });

        let stack = [];
        stack.push(root);

        while (stack.length > 0)
        {
            let node = stack.pop();
            if (node._id.toString() === id.toString())
            {
                return node;
            }
            else if (node.children && node.children.length)
            {
                for (let ii = 0; ii < node.children.length; ii += 1)
                {
                    if (actualOptions.addParentReference)
                    {
                        node.children[ii].parent = node;
                    }
                    stack.push(node.children[ii]);
                }
            }
        }
        return null;
    }

    static calculateLeafNodes(node, calculateFunction)
    {
        if (!node.children || node.children.length === 0)
        {
            return calculateFunction(node);
        }
        return node.children.reduce(function(c, d)
        {
            // c is the accumulator, we start with c=0
            // d is the node of the array that gets computed
            return c + TreeUtil.calculateLeafNodes(d, calculateFunction);
        }, 0);
    }

    static getLeafNodesHash(node)
    {
        let leafNodes = TreeUtil.getLeafNodes(node);
        return _.fromPairs(leafNodes.map((item) => [item._id.toString(), item]));
    }

    static getLeafNodes(node) //eslint-disable-line
    {
        let leafNodes = [];
        const _getLeafNodes = (n) =>
        {
            if (!n.children || n.children.length === 0)
            {
                leafNodes.push(n);
            }
            for (var f in n.children) //eslint-disable-line
            {
                _getLeafNodes(n.children[f]);
            }
        };
        _getLeafNodes(node);
        return leafNodes;
    }

    static getFirstLeaf(node)
    {
        if (!node.children || node.children.length === 0)
        {
            return node;
        }
        return TreeUtil.getFirstLeaf(node.children[0]);
    }
}

module.exports = TreeUtil;
