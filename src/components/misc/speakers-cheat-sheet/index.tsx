import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import React from 'react';
import { useTranscriptEditorContext } from '../transcript-editor-context';

export function SpeakersCheatSheet(): JSX.Element {
  const context = useTranscriptEditorContext();

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            Speakers
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          {context.speakerOptions.map((speakerName, index) => {
            return (
              <Text key={index + speakerName} className={'text-truncate'}>
                {speakerName}
              </Text>
            );
          })}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
