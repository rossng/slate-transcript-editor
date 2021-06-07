import { Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { MdInfoOutline, MdKeyboard, MdKeyboardReturn, MdPeople, MdSave } from 'react-icons/md';
import { useTranscriptEditorContext } from '../transcript-editor-context';

export function Instructions(): JSX.Element {
  const context = useTranscriptEditorContext();

  return (
    <Tooltip
      enterDelay={100}
      label={
        <Text>
          {!context.isEditable && (
            <>
              You are in read only mode. <br />
            </>
          )}
          Double click on a word or time stamp to jump to the corresponding point in the media. <br />
          {context.isEditable && (
            <>
              <MdKeyboard /> Start typing to edit text.
              <br />
              <MdPeople /> You can add and change names of speakers in your transcript.
              <br />
              <MdKeyboardReturn /> Hit enter in between words to split a paragraph.
              <br />
              <MdSave />
              Remember to save regularly.
              <br />
            </>
          )}
          <MdSave /> Export to get a copy.
        </Text>
      }
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <MdInfoOutline fontSize="small" color="primary" />
        <Text>How Does this work?</Text>
      </div>
    </Tooltip>
  );
}
