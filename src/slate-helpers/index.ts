import { breakParagraph } from './break-paragraph';
import { collapseSelectionToASinglePoint } from './collapse-selection-to-a-single-point';
import createNewParagraphBlock from './create-new-paragraph-block';
import getClosestBlock from './get-closest-block';
import { getNodeByPath } from './get-node-by-path';
import { getSelectionNodes } from './get-selection-nodes';
import { handleDeleteInParagraph } from './handle-delete-in-paragraph';
import { handleSplitParagraph } from './handle-split-paragraph';
import { insertNodesAtSelection } from './insert-nodes-at-selection';
import { insertText } from './insert-text';
import { mergeNodes } from './merge-nodes';
import { removeNodes } from './remove-nodes';
import { setNode } from './set-node';
import { setSelection } from './set-selection';
import { splitNodes } from './split-nodes';

const SlateHelpers = {
  getClosestBlock,
  getSelectionNodes,
  insertNodesAtSelection,
  mergeNodes,
  removeNodes,
  setNode,
  splitNodes,
  breakParagraph,
  insertText,
  collapseSelectionToASinglePoint,
  handleSplitParagraph,
  createNewParagraphBlock,
  handleDeleteInParagraph,
  setSelection,
  getNodeByPath,
};

export default SlateHelpers;
