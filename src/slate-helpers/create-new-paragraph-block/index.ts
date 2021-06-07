import { Element } from 'slate';
import { shortTimecode } from '../../util/timecode-converter'; //'../../../timecode-converter';

function createNewParagraphBlock({
  speaker,
  start,
  text = '',
  words = [],
  startTimecode,
}: {
  speaker: any;
  start: any;
  text: string;
  words: any;
  startTimecode?: any;
}): Element {
  let newStartTimecode = startTimecode;
  if (!newStartTimecode) {
    newStartTimecode = shortTimecode(start);
  }
  return {
    speaker,
    start,
    startTimecode: newStartTimecode,
    type: 'timedText',
    children: [
      {
        text,
        words,
      },
    ],
  };
}

export default createNewParagraphBlock;
