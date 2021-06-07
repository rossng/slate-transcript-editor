import { BaseEditor } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

export interface TranscriptWord {
  id: number;
  start: number;
  end: number;
  text: string;
}

type CustomText = { words: TranscriptWord[]; text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: {
      type: 'timedText';
      speaker: string;
      start: number; // seconds
      previousTimings: string; // e.g. "1 2 3 4 5"
      startTimecode: string; // e.g. "00:00:25"
      children: CustomText[];
    };
    Text: CustomText;
  }
}
