import { Switch, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { useTranscriptEditorContext } from '../../misc/transcript-editor-context';

export function AutoPauseControl(): JSX.Element {
  const { handleAnalyticsEvents, setIsPauseWhileTyping, isPauseWhileTyping, isEditable } = useTranscriptEditorContext();

  const handleSetPauseWhileTyping = () => {
    if (handleAnalyticsEvents) {
      // handles if click cancel and doesn't set speaker name
      handleAnalyticsEvents('ste_handle_set_pause_while_typing', {
        fn: 'handleSetPauseWhileTyping',
        isPauseWhileTyping: !isPauseWhileTyping,
      });
    }
    setIsPauseWhileTyping(!isPauseWhileTyping);
  };

  return (
    <>
      {isEditable && (
        <Tooltip
          enterDelay={3000}
          label={
            <Text>
              {`Turn ${isPauseWhileTyping ? 'off' : 'on'} pause while typing functionality. As
          you start typing the media while pause playback until you stop. Not
          recommended on longer transcript as it might present performance issues.`}
            </Text>
          }
        >
          <Text>
            <Switch color="primary" isChecked={isPauseWhileTyping} onChange={handleSetPauseWhileTyping} />
            Pause media while typing
          </Text>
        </Tooltip>
      )}
    </>
  );
}
