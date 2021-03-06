/**
 * @fileoverview Restrict usage of specified node modules.
 * @author Christian Schulz
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "disallow specified modules when loaded by `require`",
            category: "Node.js and CommonJS",
            recommended: false
        },

        schema: {
            type: "array",
            items: {
                type: "string"
            },
            uniqueItems: true
        }
    },

    create: function(context) {

        // trim restricted module names
        const restrictedModules = context.options;

        // if no modules are restricted we don't need to check the CallExpressions
        if (restrictedModules.length === 0) {
            return {};
        }

        /**
         * Function to check if a node is a string literal.
         * @param {ASTNode} node The node to check.
         * @returns {boolean} If the node is a string literal.
         */
        function isString(node) {
            return node && node.type === "Literal" && typeof node.value === "string";
        }

        /**
         * Function to check if a node is a require call.
         * @param {ASTNode} node The node to check.
         * @returns {boolean} If the node is a require call.
         */
        function isRequireCall(node) {
            return node.callee.type === "Identifier" && node.callee.name === "require";
        }

        /**
         * Function to check if a node has an argument that is an restricted module and return its name.
         * @param {ASTNode} node The node to check
         * @returns {undefined|string} restricted module name or undefined if node argument isn't restricted.
         */
        function getRestrictedModuleName(node) {
            let moduleName;

            // node has arguments and first argument is string
            if (node.arguments.length && isString(node.arguments[0])) {
                const argumentValue = node.arguments[0].value.trim();

                // check if argument value is in restricted modules array
                if (restrictedModules.indexOf(argumentValue) !== -1) {
                    moduleName = argumentValue;
                }
            }

            return moduleName;
        }

        return {
            CallExpression: function(node) {
                if (isRequireCall(node)) {
                    const restrictedModuleName = getRestrictedModuleName(node);

                    if (restrictedModuleName) {
                        context.report(node, "'{{moduleName}}' module is restricted from being used.", {
                            moduleName: restrictedModuleName
                        });
                    }
                }
            }
        };
    }
};
