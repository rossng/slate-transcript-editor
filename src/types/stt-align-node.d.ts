import { TranscriptData } from 'components/editor/transcript-editor';

declare module 'stt-align-node' {
  function alignSTT(words: TranscriptData, text: string): TranscriptWords[];
}
