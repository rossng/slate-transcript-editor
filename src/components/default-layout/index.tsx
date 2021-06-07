import { Box, ChakraProvider, extendTheme, Flex, Heading } from '@chakra-ui/react';
import React, { PropsWithChildren, useEffect } from 'react';
import { Descendant } from 'slate';
import { TranscriptData, TranscriptEditor } from '../editor/transcript-editor';
import { AutoPauseControl } from '../media/auto-pause-control';
import { MediaPlayer } from '../media/media-player';
import { SeekControls } from '../media/seek-controls';
import { SpeedControl } from '../media/speed-control';
import { TimecodeDisplay } from '../media/timecode-display';
import MenuButtons from '../menus/menu-buttons';
import { Instructions } from '../misc/instructions';
import { MediaPlayerContextProvider } from '../misc/media-player-context';
import { SpeakersCheatSheet } from '../misc/speakers-cheat-sheet';
import { TranscriptEditorContextProvider, useTranscriptEditorContext } from '../misc/transcript-editor-context';

export interface Props {
  transcriptData: TranscriptData;
  mediaUrl: string;
  handleSaveEditor: (value: string) => void;
  handleAutoSaveChanges?: (value: Descendant[]) => void;
  autoSaveContentType: 'digitalpaperedit' | 'slate';
  isEditable?: boolean;
  showTimecodes?: boolean;
  showSpeakers?: boolean;
  showTitle?: boolean;
  title?: string;
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
      isEditable={props.isEditable}
      mediaUrl={props.mediaUrl}
      transcriptData={props.transcriptData}
      title={props.title}
      autoSaveContentType={props.autoSaveContentType}
      handleSaveEditor={props.handleSaveEditor}
      handleAnalyticsEvents={props.handleAnalyticsEvents}
      transcriptDataLive={props.transcriptDataLive}
    >
      <MediaPlayerContextProvider>
        <DefaultLayoutInner showSpeakers={props.showSpeakers} showTimecodes={props.showTimecodes} showTitle={props.showTitle} />
      </MediaPlayerContextProvider>
    </TranscriptEditorContextProvider>
  );
}

const theme = extendTheme({});

function DefaultLayoutInner({
  showSpeakers,
  showTimecodes,
  showTitle,
  children,
  title,
}: PropsWithChildren<{ showSpeakers: boolean; showTimecodes: boolean; title?: string; showTitle: boolean }>) {
  const { isProcessing } = useTranscriptEditorContext();

  useEffect(() => {
    if (isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isProcessing]);

  /**
   * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
   * to provide current paragraph's highlight.
   * @param {Number} currentTime - float in seconds
   */

  return (
    <ChakraProvider theme={theme}>
      <Box>
        {showTitle && <Heading as="h5">{title}</Heading>}

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
              <Box>{children}</Box>
              <Instructions />
              <SpeakersCheatSheet />
            </Flex>
          </Box>

          <Box colSpan={7}>
            <TranscriptEditor showSpeakers={showSpeakers} showTimecodes={showTimecodes} />
          </Box>

          <Box colSpan={1}>
            <MenuButtons />
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}
