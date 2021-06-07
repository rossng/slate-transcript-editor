import assert from 'assert';
import { TranscriptData } from 'components/editor/transcript-editor';
import { Descendant, Element } from 'slate';
import { alignSTT } from 'stt-align-node';
import { TranscriptWord } from 'types/slate';
import countWords from '../../../count-words';
import generatePreviousTimingsUpToCurrent from '../../../dpe-to-slate/generate-previous-timings-up-to-current';
import { shortTimecode } from '../../../timecode-converter';

const createSlateContentFromSlateJsParagraphs = (currentContent: Descendant[], newEntities: TranscriptWord[]): Descendant[] => {
  // Update entites to block structure.
  const updatedBlockArray = [];
  let totalWords = 0;

  for (const blockIndex in currentContent) {
    const block = currentContent[blockIndex];
    assert(Element.isElement(block));
    const text = block.children[0].text;
    // if copy and pasting large chunk of text
    // currentContentBlock, would not have speaker and start/end time info
    // so for updatedBlock, getting start time from first word in blockEntities
    const wordsInBlock = countWords(text);
    const blockEntites = newEntities.slice(totalWords, totalWords + wordsInBlock);
    let speaker = block.speaker;
    const start = parseFloat(blockEntites[0].start as unknown as string);
    // const end = parseFloat(blockEntites[blockEntites.length - 1].end);
    // const currentParagraph = { start, end };
    // The speakers would also not exist. unles in future iteration
    // ad optin to have a convention for spaker formatting, eg all caps with : at beginning of sentence
    // or somthing like that but out of scope for now.
    if (!speaker) {
      speaker = 'U_UKN';
    }

    const newText = blockEntites
      .map((w) => {
        return w.text;
      })
      .join(' ')
      .trim();

    const updatedBlock = {
      type: 'timedText',
      speaker: speaker,
      start,
      previousTimings: generatePreviousTimingsUpToCurrent(start),
      startTimecode: shortTimecode(start),
      children: [
        {
          text: newText,
          words: blockEntites,
        },
      ],
    };

    updatedBlockArray.push(updatedBlock);
    totalWords += wordsInBlock;
  }
  return updatedBlockArray;
};

function plainTextAlignToSlateJs(words: TranscriptData, text: string, slateJsValue: Descendant[]): Descendant[] {
  // TODO: maybe there's a more performant way to do this?
  // As on larger over 1 hour transcript it might freeze the UI 🤷‍♂️
  const alignedWords = alignSTT(words, text);
  const updatedBlockArray = createSlateContentFromSlateJsParagraphs(slateJsValue, alignedWords);
  return updatedBlockArray;
}

export default plainTextAlignToSlateJs;
