import path from 'path';
import * as R from 'ramda';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import download from '../../util/download';
import convertDpeToSlate from '../../util/dpe-to-slate';
import exportAdapter, { ExportData, isCaptionType } from '../../util/export-adapters';
import plainTextAlignToSlateJs from '../../util/export-adapters/slate-to-dpe/update-timestamps/plain-text-align-to-slate';
import updateBlocksTimestamps from '../../util/export-adapters/slate-to-dpe/update-timestamps/update-blocks-timestamps';
import insertTimecodesInLineInSlateJs from '../../util/insert-timecodes-in-line-in-words-list';
import { TranscriptData } from '../editor/transcript-editor';

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
  handleSave: () => Promise<void>;
  handleExport: (data: ExportData) => Promise<string>;
  handleReplaceText: () => void;
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
  handleSaveEditor,
  mediaUrl,
  transcriptData,
  transcriptDataLive,
  autoSaveContentType,
  title,
}: PropsWithChildren<{
  isEditable?: boolean;
  handleAnalyticsEvents?: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  handleSaveEditor: (value: string) => void;
  mediaUrl: string;
  transcriptData: TranscriptData;
  transcriptDataLive?: TranscriptData;
  autoSaveContentType: 'digitalpaperedit' | 'slate';
  title?: string;
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
    if (transcriptData) {
      const res = convertDpeToSlate(transcriptData);
      setValue(res);
    }
  }, [transcriptData, setValue]);

  // TODO: replace this with a more idiomatic mechanism
  // handles interim results for working with a Live STT
  useEffect(() => {
    if (transcriptDataLive) {
      const nodes = convertDpeToSlate(transcriptDataLive);
      // if the user is selecting the / typing the text
      // Transforms.insertNodes would insert the node at selection point
      // instead we check if they are in the editor
      if (editor.selection) {
        // get the position of the last node
        const positionLastNode = [editor.children.length];
        // insert the new nodes at the end of the document
        Transforms.insertNodes(editor, nodes, {
          at: positionLastNode,
        });
      }
      // use not having selection in the editor allows us to also handle the initial use case
      // where the might be no initial results
      else {
        // if there is no selection the default for insertNodes is to add the nodes at the end
        Transforms.insertNodes(editor, nodes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptDataLive]);

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

  const handleReplaceText = useCallback(() => {
    // TODO: convert to a proper modal
    const newText = prompt('Paste the text to replace here.');
    if (newText) {
      const newValue = plainTextAlignToSlateJs(transcriptData, newText, value);
      setValue(newValue);

      // TODO: consider adding some kind of word count here?

      // handles if click cancel and doesn't set speaker name
      handleAnalyticsEvents?.('ste_handle_replace_text', {
        fn: 'handleReplaceText',
      });
    }
  }, [handleAnalyticsEvents, transcriptData, value]);

  // TODO: refactor this function, to be cleaner and easier to follow.
  const handleRestoreTimecodes = useCallback(
    async (inlineTimecodes = false) => {
      // if nothing as changed and you don't need to modify the data
      // to get inline timecodes, then just return as is
      if (!isContentModified && !inlineTimecodes) {
        return value;
      }
      // only used by Word (OHMS) export
      // const alignedSlateData = await updateBlocksTimestamps(value, inlineTimecodes);
      const alignedSlateData = await updateBlocksTimestamps(value);
      setValue(alignedSlateData);
      setIsContentModified(false);

      if (inlineTimecodes) {
        // we don't want to show the inline timecode in the editor, but we want to return them to export function
        const alignedSlateDataWithInlineTimecodes = insertTimecodesInLineInSlateJs(alignedSlateData);
        return alignedSlateDataWithInlineTimecodes;
      }

      return alignedSlateData;
    },
    [isContentModified, setIsContentModified, setValue, value]
  );

  const fileTitle = useMemo(() => title ?? path.basename(mediaUrl).trim(), [mediaUrl, title]);

  // TODO: this could be refactored, and brought some of this logic inside the exportAdapter (?)
  // To make this a little cleaner
  const handleExport = useCallback(
    async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }: ExportData): Promise<string> => {
      // handles if click cancel and doesn't set speaker name
      handleAnalyticsEvents?.('ste_handle_export', {
        fn: 'handleExport',
        type,
        ext,
        speakers,
        timecodes,
        inlineTimecodes,
        hideTitle,
        atlasFormat,
        isDownload,
      });

      try {
        setIsProcessing(true);
        let tmpValue = value;
        if (timecodes) {
          tmpValue = await handleRestoreTimecodes();
        }

        if (inlineTimecodes) {
          tmpValue = await handleRestoreTimecodes(inlineTimecodes);
        }

        if (isContentModified && type === 'json-slate') {
          tmpValue = await handleRestoreTimecodes();
        }

        if (isContentModified && type === 'json-digitalpaperedit') {
          tmpValue = await handleRestoreTimecodes();
        }

        if (isContentModified && isCaptionType(type)) {
          tmpValue = await handleRestoreTimecodes();
        }
        // export adapter does not doo any alignment
        // just converts between formats
        let editorContent = exportAdapter({
          slateValue: tmpValue,
          type,
          transcriptTitle: fileTitle,
          speakers,
          timecodes,
          inlineTimecodes,
          hideTitle,
          atlasFormat,
        });

        if (ext === 'json') {
          editorContent = JSON.stringify(editorContent, null, 2);
        }
        if (ext !== 'docx' && isDownload) {
          download(editorContent, `${fileTitle}.${ext}`);
        }
        return editorContent;
      } finally {
        setIsProcessing(false);
      }
    },
    [fileTitle, handleAnalyticsEvents, handleRestoreTimecodes, isContentModified, value]
  );

  const handleSave = useCallback(async () => {
    try {
      setIsProcessing(true);
      const format = autoSaveContentType ?? 'digitalpaperedit';
      const editorContent = await handleExport({ type: `json-${format}`, isDownload: false });

      // handles if click cancel and doesn't set speaker name
      handleAnalyticsEvents?.('ste_handle_save', {
        fn: 'handleSave',
        format,
      });

      if (isEditable) {
        handleSaveEditor?.(editorContent);
      }
      setIsContentModified(false);
      setIsContentSaved(true);
    } finally {
      setIsProcessing(false);
    }
  }, [autoSaveContentType, handleAnalyticsEvents, handleExport, handleSaveEditor, isEditable]);

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
      handleExport,
      handleReplaceText,
      handleSave,
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
      handleExport,
      handleReplaceText,
      handleSave,
    ]
  );

  return <TranscriptEditorContext.Provider value={ctx}>{children}</TranscriptEditorContext.Provider>;
}
