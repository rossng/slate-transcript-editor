import { Box, ChakraProvider, extendTheme, Flex, Heading } from '@chakra-ui/react';
import path from 'path';
import React, { PropsWithChildren, useCallback, useEffect } from 'react';
import { Descendant, Transforms } from 'slate';
import download from '../../util/download';
import convertDpeToSlate from '../../util/dpe-to-slate';
import generatePreviousTimingsUpToCurrent from '../../util/dpe-to-slate/generate-previous-timings-up-to-current';
import exportAdapter, { ExportData, isCaptionType } from '../../util/export-adapters';
import plainTextAlignToSlateJs from '../../util/export-adapters/slate-to-dpe/update-timestamps/plain-text-align-to-slate';
import updateBlocksTimestamps from '../../util/export-adapters/slate-to-dpe/update-timestamps/update-blocks-timestamps';
import insertTimecodesInLineInSlateJs from '../../util/insert-timecodes-in-line-in-words-list';
import { TranscriptData, TranscriptEditor } from '../editor/transcript-editor';
import { AutoPauseControl } from '../media/auto-pause-control';
import { MediaPlayer } from '../media/media-player';
import { SeekControls } from '../media/seek-controls';
import { SpeedControl } from '../media/speed-control';
import { TimecodeDisplay } from '../media/timecode-display';
import SideBtns from '../menus/side-btns';
import { Instructions } from '../misc/instructions';
import { MediaPlayerContextProvider, useMediaPlayerContext } from '../misc/media-player-context';
import { SpeakersCheatSheet } from '../misc/speakers-cheat-sheet';
import { TranscriptEditorContextProvider, useTranscriptEditorContext } from '../misc/transcript-editor-context';

const REPLACE_WHOLE_TEXT_INSTRUCTION =
  'Replace whole text. \n\nAdvanced feature, if you already have an accurate transcription for the whole text, and you want to restore timecodes for it, you can use this to replace the text in this transcript. \n\nFor now this is an experimental feature. \n\nIt expects plain text, with paragraph breaks as new line breaks but no speakers.';

export interface Props {
  transcriptData: TranscriptData;
  mediaUrl: string;
  handleSaveEditor: (value: string) => void;
  handleAutoSaveChanges?: (value: Descendant[]) => void;
  autoSaveContentType: 'digitalpaperedit' | 'slate';
  isEditable?: boolean;
  showTimecodes?: boolean;
  showSpeakers?: boolean;
  title?: string;
  showTitle?: boolean;
  transcriptDataLive?: TranscriptData;
  handleAnalyticsEvents?: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  optionalBtns?: React.ReactNode | React.ReactNodeArray;
  mediaType?: string;
}

DefaultLayout.defaultProps = {
  showTitle: false,
  showTimecodes: true,
  showSpeakers: true,
  autoSaveContentType: 'digitalpaperedit',
  isEditable: true,
};

export function DefaultLayout(props: PropsWithChildren<Props>): JSX.Element {
  return (
    <TranscriptEditorContextProvider
      defaultShowSpeakers={props.showSpeakers}
      defaultShowTimecodes={props.showTimecodes}
      isEditable={props.isEditable}
      mediaUrl={props.mediaUrl}
    >
      <MediaPlayerContextProvider>
        <DefaultLayoutInner showTitle={props.showTitle} autoSaveContentType={props.autoSaveContentType} {...props} />
      </MediaPlayerContextProvider>
    </TranscriptEditorContextProvider>
  );
}

const theme = extendTheme({});

function DefaultLayoutInner({ showSpeakers, showTimecodes, ...props }: PropsWithChildren<Props>) {
  const { setValue, value, setIsContentModified, isContentModified, setIsContentSaved, setIsProcessing, isProcessing, editor } =
    useTranscriptEditorContext();
  const { currentTime } = useMediaPlayerContext();

  useEffect(() => {
    if (isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isProcessing]);

  useEffect(() => {
    if (props.transcriptData) {
      const res = convertDpeToSlate(props.transcriptData);
      setValue(res);
    }
  }, [props.transcriptData, setValue]);

  // handles interim results for working with a Live STT
  useEffect(() => {
    if (props.transcriptDataLive) {
      const nodes = convertDpeToSlate(props.transcriptDataLive);
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
  }, [props.transcriptDataLive]);

  const getSlateContent = useCallback(() => {
    return value;
  }, [value]);

  const getFileName = useCallback(() => {
    return path.basename(props.mediaUrl).trim();
  }, [props.mediaUrl]);

  const getFileTitle = useCallback(() => {
    if (props.title) {
      return props.title;
    }
    return getFileName();
  }, [getFileName, props.title]);

  const handleReplaceText = useCallback(() => {
    const newText = prompt(`Paste the text to replace here.\n\n${REPLACE_WHOLE_TEXT_INSTRUCTION}`);
    if (newText) {
      const newValue = plainTextAlignToSlateJs(props.transcriptData, newText, value);
      setValue(newValue);

      // TODO: consider adding some kind of word count here?

      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents?.('ste_handle_replace_text', {
        fn: 'handleReplaceText',
      });
    }
  }, [props, setValue, value]);

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

  // TODO: this could be refactored, and brought some of this logic inside the exportAdapter (?)
  // To make this a little cleaner
  const handleExport = useCallback(
    async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }: ExportData): Promise<string> => {
      if (props.handleAnalyticsEvents) {
        // handles if click cancel and doesn't set speaker name
        props.handleAnalyticsEvents('ste_handle_export', {
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
      }

      try {
        setIsProcessing(true);
        let tmpValue = getSlateContent();
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
          transcriptTitle: getFileTitle(),
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
          download(editorContent, `${getFileTitle()}.${ext}`);
        }
        return editorContent;
      } finally {
        setIsProcessing(false);
      }
    },
    [getFileTitle, getSlateContent, handleRestoreTimecodes, isContentModified, props, setIsProcessing]
  );

  const handleSave = useCallback(async () => {
    try {
      setIsProcessing(true);
      const format = props.autoSaveContentType ? props.autoSaveContentType : 'digitalpaperedit';
      const editorContent = await handleExport({ type: `json-${format}`, isDownload: false });

      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents?.('ste_handle_save', {
        fn: 'handleSave',
        format,
      });

      if (props.handleSaveEditor && props.isEditable) {
        props.handleSaveEditor(editorContent);
      }
      setIsContentModified(false);
      setIsContentSaved(true);
    } finally {
      setIsProcessing(false);
    }
  }, [handleExport, props, setIsContentModified, setIsContentSaved, setIsProcessing]);

  /**
   * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
   * to provide current paragraph's highlight.
   * @param {Number} currentTime - float in seconds
   */

  return (
    <ChakraProvider theme={theme}>
      <div style={{ paddingTop: '1em' }}>
        <style scoped>
          {`/* Next words */
             .timecode[data-previous-timings*="${generatePreviousTimingsUpToCurrent(currentTime)}"]{
                  color:  #9E9E9E;
              }

              // NOTE: The CSS is here, coz if you put it as a separate index.css the current webpack does not bundle it with the component

              /* TODO: Temporary, need to scope this to the component in a sensible way */
              .editor-wrapper-container {
                font-family: Roboto, sans-serif;
              }

              .editor-wrapper-container {
                padding: 8px 16px;
                height: 85vh;
                overflow: auto;
              }
          `}
        </style>
        {props.showTitle && <Heading as="h5">{props.title}</Heading>}

        <Flex spacing={2} flexDir="row">
          <Box>
            <Flex flexDir="column">
              <MediaPlayer />
              <Flex flexDir="row" justifyContent="space-between" mt={4}>
                <TimecodeDisplay />
                <SpeedControl />
              </Flex>
              <SeekControls />
              <AutoPauseControl />
              <Box>{props.children}</Box>
              <Instructions />
              <SpeakersCheatSheet />
            </Flex>
          </Box>

          <Box colSpan={7}>
            <TranscriptEditor showSpeakers={showSpeakers} showTimecodes={showTimecodes} />
          </Box>

          <Box colSpan={1}>
            <SideBtns
              handleExport={handleExport}
              handleReplaceText={handleReplaceText}
              handleSave={handleSave}
              REPLACE_WHOLE_TEXT_INSTRUCTION={REPLACE_WHOLE_TEXT_INSTRUCTION}
            >
              {props.optionalBtns}
            </SideBtns>
          </Box>
        </Flex>
      </div>
    </ChakraProvider>
  );
}
