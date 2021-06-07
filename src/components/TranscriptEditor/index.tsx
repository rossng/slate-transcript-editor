import { Box, Paper } from '@material-ui/core';
import debounce from 'lodash/debounce';
import React, { useCallback } from 'react';
import { Descendant } from 'slate';
import { DefaultElement, Editable, RenderElementProps, RenderLeafProps, Slate } from 'slate-react';
import { TranscriptWord } from 'types/slate';
import SlateHelpers from '../slate-helpers';
import { TimedTextElement } from '../TimedTextElement';
import { useTranscriptEditorContext } from '../TranscriptEditorContext';

const PAUSE_WHILE_TYPING_TIMEOUT_MILLISECONDS = 1500;
// const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;

const pauseWhileTyping = (current) => {
  current.play();
};
const debouncePauseWhileTyping = debounce(pauseWhileTyping, PAUSE_WHILE_TYPING_TIMEOUT_MILLISECONDS);

export interface TranscriptData {
  words?: TranscriptWord[];
  paragraphs?: TranscriptParagraph[];
}

interface TranscriptParagraph {
  id: number;
  start: number;
  end: number;
  speaker: string;
}

export function TranscriptEditor({
  showSpeakers,
  showTimecodes,
  handleAutoSaveChanges,
}: {
  showSpeakers: boolean;
  showTimecodes: boolean;
  handleAutoSaveChanges?: (value: Descendant[]) => void;
}): JSX.Element {
  const {
    setValue,
    value,
    setIsContentModified,
    setIsContentSaved,
    isPauseWhileTyping,
    editor,
    handleTimedTextClick,
    mediaRef,
    handleAnalyticsEvents,
    isEditable,
  } = useTranscriptEditorContext();

  const renderElement = useCallback(
    (elementProps: RenderElementProps) => {
      switch (elementProps.element.type) {
        case 'timedText':
          return <TimedTextElement showSpeakers={showSpeakers} showTimecodes={showTimecodes} {...elementProps} />;
        default:
          return <DefaultElement {...elementProps} />;
      }
    },
    [showSpeakers, showTimecodes]
  );

  const renderLeaf = useCallback(
    ({ attributes, children }: RenderLeafProps): JSX.Element => {
      return (
        <span
          onDoubleClick={handleTimedTextClick}
          className={'timecode text'}
          data-start={children.props.parent.start}
          data-previous-timings={children.props.parent.previousTimings}
          // title={'double click on a word to jump to the corresponding point in the media'}
          {...attributes}
        >
          {children}
        </span>
      );
    },
    [handleTimedTextClick]
  );

  /**
   * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
   * to provide current paragraph's highlight.
   * @param {Number} currentTime - float in seconds
   */

  // const debounced_version = throttle(handleRestoreTimecodes, 3000, { leading: false, trailing: true });
  // TODO: revisit logic for
  // - splitting paragraph via enter key
  // - merging paragraph via delete
  // - merging paragraphs via deleting across paragraphs
  const handleOnKeyDown = async (event) => {
    setIsContentModified(true);
    setIsContentSaved(false);
    //  ArrowRight ArrowLeft ArrowUp ArrowUp
    if (event.key === 'Enter') {
      // intercept Enter, and handle timecodes when splitting a paragraph
      event.preventDefault();
      // console.info('For now disabling enter key to split a paragraph, while figuring out the alignment issue');
      // handleSetPauseWhileTyping();
      // TODO: Edge case, hit enters after having typed some other words?
      const isSuccess = SlateHelpers.handleSplitParagraph(editor);

      // handles if click cancel and doesn't set speaker name
      handleAnalyticsEvents?.('ste_handle_split_paragraph', {
        fn: 'handleSplitParagraph',
        isSuccess,
      });

      if (isSuccess) {
        // as part of splitting paragraphs there's an alignment step
        // so content is not counted as modified
        setIsContentModified(false);
      }
    }
    if (event.key === 'Backspace') {
      const isSuccess = SlateHelpers.handleDeleteInParagraph({ editor: editor, event });
      // Commenting that out for now, as it might get called too often
      // if (props.handleAnalyticsEvents) {
      //   // handles if click cancel and doesn't set speaker name
      //   props.handleAnalyticsEvents('ste_handle_delete_paragraph', {
      //     fn: 'handleDeleteInParagraph',
      //     isSuccess,
      //   });
      // }
      if (isSuccess) {
        // as part of splitting paragraphs there's an alignment step
        // so content is not counted as modified
        setIsContentModified(false);
      }
    }
    // if (event.key.length == 1 && ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 49 && event.keyCode <= 57))) {
    //   const alignedSlateData = await debouncedSave(value);
    //   setValue(alignedSlateData);
    //   setIsContentIsModified(false);
    // }

    if (isPauseWhileTyping) {
      // logic for pause while typing
      // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
      // TODO: currently eve the video was paused, and pause while typing is on,
      // it will play it when stopped typing. so added btn to turn feature on off.
      // and disabled as default.
      // also pause while typing might introduce performance issues on longer transcripts
      // if on every keystroke it's creating and destroying a timer.
      // should find a more efficient way to "debounce" or "throttle" this functionality
      if (mediaRef && mediaRef.current && !mediaRef.current.paused) {
        mediaRef.current.pause();
        debouncePauseWhileTyping(mediaRef.current);
      }
    }
    // auto align when not typing
  };
  return (
    <Box>
      {value.length !== 0 ? (
        <>
          <Paper elevation={3}>
            <section className="editor-wrapper-container">
              <Slate
                editor={editor}
                value={value}
                onChange={(value) => {
                  if (handleAutoSaveChanges) {
                    handleAutoSaveChanges(value);
                    setIsContentSaved(true);
                  }
                  return setValue(value);
                }}
              >
                <Editable
                  readOnly={typeof isEditable === 'boolean' ? !isEditable : false}
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  onKeyDown={handleOnKeyDown}
                />
              </Slate>
            </section>
          </Paper>
        </>
      ) : (
        <section className="text-center">
          <i className="text-center">Loading...</i>
        </section>
      )}
    </Box>
  );
}
