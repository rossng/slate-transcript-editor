import { chakra, Grid, GridItem, GridProps, Text } from '@chakra-ui/react';
import assert from 'assert';
import React, { useCallback } from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useMediaPlayerContext } from '../../misc/media-player-context';
import { useTranscriptEditorContext } from '../../misc/transcript-editor-context';

export interface TimedTextElementProps {
  element: Element;
  attributes: GridProps;
  children: React.ReactNode;
  showSpeakers: boolean;
  showTimecodes: boolean;
}

export function TimedTextElement({ showSpeakers, showTimecodes, ...props }: TimedTextElementProps): JSX.Element {
  const { editor, isEditable, handleAnalyticsEvents } = useTranscriptEditorContext();
  const { handleTimedTextClick, currentTime } = useMediaPlayerContext();

  /**
   * `handleSetSpeakerName` is outside of TimedTextElement
   * to improve the overall performance of the editor,
   * especially on long transcripts
   * @param {*} element - props.element, from `renderElement` function
   */
  const handleSetSpeakerName = useCallback(
    (element) => {
      if (isEditable) {
        const pathToCurrentNode = ReactEditor.findPath(editor, element);
        const oldSpeakerName = element.speaker;
        const newSpeakerName = prompt('Change speaker name', oldSpeakerName);
        if (newSpeakerName) {
          const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);

          // handles if set speaker name, and whether updates one or multiple
          handleAnalyticsEvents?.('ste_set_speaker_name', {
            fn: 'handleSetSpeakerName',
            changeSpeaker: true,
            updateMultiple: isUpdateAllSpeakerInstances,
          });

          if (isUpdateAllSpeakerInstances) {
            const rangeForTheWholeEditor = Editor.range(editor, []);
            // Apply transformation to the whole doc, where speaker matches old speaker name, and set it to new one
            Transforms.setNodes(
              editor,
              { type: 'timedText', speaker: newSpeakerName },
              {
                at: rangeForTheWholeEditor,
                match: (node: Node) => {
                  assert('type' in node && node.type === 'timedText');
                  return node.type === 'timedText' && node.speaker.toLowerCase() === oldSpeakerName.toLowerCase();
                },
              }
            );
          } else {
            // only apply speaker name transformation to current element
            Transforms.setNodes(editor, { type: 'timedText', speaker: newSpeakerName }, { at: pathToCurrentNode });
          }
        } else {
          // handles if click cancel and doesn't set speaker name
          handleAnalyticsEvents?.('ste_set_speaker_name', {
            fn: 'handleSetSpeakerName',
            changeSpeaker: false,
            updateMultiple: false,
          });
        }
      }
    },
    [editor, handleAnalyticsEvents, isEditable]
  );

  let textColspan = 12;
  if (!showSpeakers && !showTimecodes) {
    textColspan = 12;
  } else if (showSpeakers && !showTimecodes) {
    textColspan = 11;
  } else if (!showSpeakers && showTimecodes) {
    textColspan = 10;
  } else if (showSpeakers && showTimecodes) {
    textColspan = 9;
  }

  return (
    <Grid direction="row" justifyContent="flex-start" alignItems="flex-start" templateColumns="repeat(12, 1fr)" {...props.attributes}>
      {showTimecodes && (
        <GridItem contentEditable={false} colSpan={1}>
          <chakra.code
            contentEditable={false}
            userSelect="none"
            _hover={{
              textDecoration: 'underline',
            }}
            color={props.element.start > currentTime ? '#9e9e9e' : 'black'}
            cursor="pointer"
            className={'timecode'}
            onClick={handleTimedTextClick}
            onDoubleClick={handleTimedTextClick}
            title={props.element.startTimecode}
            data-start={props.element.start}
          >
            {props.element.startTimecode}
          </chakra.code>
        </GridItem>
      )}
      {showSpeakers && (
        <GridItem contentEditable={false} colSpan={2}>
          <Text
            noWrap
            contentEditable={false}
            userSelect="none"
            cursor="pointer"
            width="100%"
            textTransform="uppercase"
            className={'text-truncate text-muted'}
            title={props.element.speaker}
            onClick={() => handleSetSpeakerName(props.element)}
          >
            {props.element.speaker}
          </Text>
        </GridItem>
      )}
      <GridItem colSpan={textColspan}>{props.children}</GridItem>
    </Grid>
  );
}
