/**
 * @file Object
 * @author cxtom(cxtom2008@gmail.com)
 */

import {
    EmitHint,
    isPropertyAccessExpression,
    isIdentifier,
    isCallExpression,
    isBinaryExpression,
    SyntaxKind,
    createCall,
    createIdentifier
} from 'byots';

import method from '../utilities/method';
import {isClassInstance} from '../utilities/nodeTest';
import {createDiagnostic, getUnSupportedMessage} from '../utilities/error';

const staticMap = {
    assign: method('array_merge', {self: false}),
    keys: method('array_keys', {self: false}),
    values: method('array_values', {self: false}),
    freeze(node, {emitWithHint}) {
        emitWithHint(EmitHint.Unspecified, node.arguments[0]);
    }
};

function emitPropertyExists(objNode, propNode, typeChecker, emitExpression) {
    if (isClassInstance(objNode, typeChecker)) {
        return emitExpression(
            createCall(createIdentifier('property_exists'), [], [
                objNode,
                propNode
            ])
        );
    }
    return emitExpression(
        createCall(createIdentifier('array_key_exists'), [], [
            propNode,
            objNode
        ])
    );
}

export default {

    emit(hint, node, {helpers, typeChecker, helperNamespace, errors, sourceFile}) {

        const expNode = node.expression;
        let func;

        if (
            hint === EmitHint.Expression
            && isCallExpression(node)
            && isPropertyAccessExpression(expNode)
            && isIdentifier(expNode.expression)
            && expNode.expression.escapedText === 'Object'
        ) {
            const name = helpers.getTextOfNode(expNode.name);
            func = staticMap[name];
            if (func) {
                return func(node, helpers, {helperNamespace});
            }
            errors.push(createDiagnostic(node, sourceFile, getUnSupportedMessage(`Object.${name}`)));
        }

        if (
            isPropertyAccessExpression(node)
            && isIdentifier(node.name)
            && node.name.getText(sourceFile) === 'prototype'
        ) {
            errors.push(createDiagnostic(node, sourceFile, 'Xxx.prototype is not supported.'));
        }

        if (
            hint === EmitHint.Expression
            && isBinaryExpression(node)
            && node.operatorToken.kind === SyntaxKind.InKeyword
        ) {
            return emitPropertyExists(node.right, node.left, typeChecker, helpers.emitExpression);
        }

        if (
            isCallExpression(node)
            && isPropertyAccessExpression(expNode)
            && isIdentifier(expNode.name)
            && helpers.getTextOfNode(expNode.name) === 'hasOwnProperty'
        ) {
            return emitPropertyExists(expNode.expression, node.arguments[0], typeChecker, helpers.emitExpression);
        }

        return false;
    }
};
