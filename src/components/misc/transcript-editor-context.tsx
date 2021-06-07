import * as R from 'ramda';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';

interface TranscriptEditorCtx {
  isEditable: boolean;
  setValue: React.Dispatch<React.SetStateAction<Descendant[]>>;
  value: Descendant[];
  editor: BaseEditor & ReactEditor & HistoryEditor;
  setIsContentModified: React.Dispatch<React.SetStateAction<boolean>>;
  isContentModified: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessing: boolean;
  setIsContentSaved: React.Dispatch<React.SetStateAction<boolean>>;
  isContentSaved: boolean;
  setIsPauseWhileTyping: React.Dispatch<React.SetStateAction<boolean>>;
  isPauseWhileTyping: boolean;
  speakerOptions: string[];
  insertTextInaudible: () => void;
  insertMusicNote: () => void;
  handleAnalyticsEvents: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  mediaUrl: string;
}

const TranscriptEditorContext = createContext<TranscriptEditorCtx | undefined>(undefined);

export function useTranscriptEditorContext(): TranscriptEditorCtx {
  const ctx = useContext(TranscriptEditorContext);
  if (!ctx) {
    throw new Error('TranscriptEditorContext not available - are you outside the provider?');
  }
  return ctx;
}

export function TranscriptEditorContextProvider({
  children,
  isEditable,
  handleAnalyticsEvents,
  mediaUrl,
}: PropsWithChildren<{
  defaultShowSpeakers?: boolean;
  defaultShowTimecodes?: boolean;
  isEditable?: boolean;
  handleAnalyticsEvents?: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  mediaUrl: string;
}>): JSX.Element {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([]);
  const [speakerOptions, setSpeakerOptions] = useState<string[]>([]);
  const [isPauseWhileTyping, setIsPauseWhileTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unnecessarily running alignment if the slate value content has not been modified by the user since
  // last save or alignment
  const [isContentModified, setIsContentModified] = useState(false);
  const [isContentSaved, setIsContentSaved] = useState(true);

  useEffect(() => {
    const getUniqueSpeakers = R.pipe(R.pluck('speaker'), R.uniq);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const uniqueSpeakers = getUniqueSpeakers(value);
    setSpeakerOptions(uniqueSpeakers);
  }, [value]);

  const insertTextInaudible = useCallback(() => {
    Transforms.insertText(editor, '[INAUDIBLE]');

    handleAnalyticsEvents?.('ste_clicked_on_insert', {
      btn: '[INAUDIBLE]',
      fn: 'insertTextInaudible',
    });
  }, [editor, handleAnalyticsEvents]);

  const insertMusicNote = useCallback(() => {
    Transforms.insertText(editor, '♪'); // or ♫

    handleAnalyticsEvents?.('ste_clicked_on_insert', {
      btn: '♫',
      fn: 'handleInsertMusicNote',
    });
  }, [editor, handleAnalyticsEvents]);

  const ctx = useMemo(
    (): TranscriptEditorCtx => ({
      isEditable,
      setValue,
      value,
      editor,
      setIsContentModified,
      isContentModified,
      setIsProcessing,
      isProcessing,
      setIsContentSaved,
      isContentSaved,
      setIsPauseWhileTyping,
      isPauseWhileTyping,
      speakerOptions,
      insertTextInaudible,
      insertMusicNote,
      handleAnalyticsEvents,
      mediaUrl,
    }),
    [
      editor,
      insertMusicNote,
      insertTextInaudible,
      isContentModified,
      isContentSaved,
      isEditable,
      isPauseWhileTyping,
      isProcessing,
      speakerOptions,
      value,
      handleAnalyticsEvents,
      mediaUrl,
    ]
  );

  return <TranscriptEditorContext.Provider value={ctx}>{children}</TranscriptEditorContext.Provider>;
}
