/**
 * handles splitting a paragraph, as well as associated block paragraph data
 * such as word timecodes, previous times,
 * and adjusting start time for the paragraph etc..
 */
// import getClosestBlock from '../get-closest-block';
import isSameBlock from './is-same-block';
import isBeginningOftheBlock from './is-beginning-of-the-block.js';
import isSelectionCollapsed from './is-selection-collapsed';
import splitTextAtOffset from './split-text-at-offset';
import splitWordsListAtOffset from './split-words-list-at-offset';
import countWords from '../../../util/count-words';
import SlateHelpers from '../index';
import isTextSameAsWordsList from './is-text-same-as-words-list';

function handleSplitParagraph(editor) {
  // get char offset
  const { anchor, focus } = editor.selection;
  console.log('editor.selection', editor.selection);
  const { offset: anchorOffset, path: anchorPath } = anchor;
  const { offset: focusOffset, path: focusPath } = focus;

  if (isSameBlock(anchorPath, focusPath)) {
    if (isBeginningOftheBlock(anchorOffset, focusOffset)) {
      console.info('in the same block, but at the beginning of a paragraph for now you are not allowed to create an empty new line');
      return;
    }
    if (isSelectionCollapsed(anchorOffset, focusOffset)) {
      // get current block
      const [blockNode, path] = SlateHelpers.getClosestBlock(editor);
      const currentBlockNode = blockNode;
      // split into two blocks
      const text = currentBlockNode.children[0].text;
      // split text in
      const [textBefore, textAfter] = splitTextAtOffset(text, anchorOffset);
      // also split words list
      const currentBlockWords = currentBlockNode.children[0].words;
      // TODO: edge case splitting in the middle of a word eg find a way to prevent that for now? or is not a problem?
      const numberOfWordsBefore = countWords(textBefore);
      const [wordsBefore, wordsAfter] = splitWordsListAtOffset(currentBlockWords, numberOfWordsBefore);
      ////////////////////////////////////////////
      // if cursor in the middle of a word then move cursor to space just before
      const isCaretInMiddleOfAword = isTextSameAsWordsList(textBefore, wordsBefore);
      if (isCaretInMiddleOfAword) {
        // TODO: code below doesn't work
        // TODO: next line has some code repetition, see if can do DRY.
        // const textBeforeList = textBefore.trim().replace(/\s\s+/g, ' ').split(' ');
        // textBeforeList.pop();
        // const nextPointOffset = textBeforeList.join(' ').trim().length;
        // const nextPoint = {
        //   path,
        //   offset: nextPointOffset,
        // };
        // SlateHelpers.setSelection({ editor, nextPoint });

        return;
      }
      ////////////////////////////////////////////
      // get start time of first block
      const { speaker, start } = currentBlockNode;
      // adjust previousTimings
      const blockParagraphBefore = SlateHelpers.createNewParagraphBlock({
        speaker,
        start,
        text: textBefore,
        words: wordsBefore,
      });
      // adjust start time (start and startTimecode) of second block, which is start time of second lsit of words
      const startTimeSecondParagraph = wordsAfter[0].start;
      const blockParagraphAfter = SlateHelpers.createNewParagraphBlock({
        speaker,
        start: startTimeSecondParagraph,
        text: textAfter,
        words: wordsAfter,
      });

      //delete original block
      SlateHelpers.removeNodes({ editor });
      // insert these two blocks
      SlateHelpers.insertNodesAtSelection({
        editor,
        blocks: [blockParagraphBefore, blockParagraphAfter],
        moveSelection: true,
      });
      return;
    } else {
      console.info('in same block but with wide selection, not handling this use case for now, and collapsing the selection instead');
      SlateHelpers.collapseSelectionToAsinglePoint(editor);
      return;
    }
  } else {
    console.info('in different block, not handling this use case for now, and collapsing the selection instead');
    SlateHelpers.collapseSelectionToAsinglePoint(editor);
    return;
  }
}
export default handleSplitParagraph;
