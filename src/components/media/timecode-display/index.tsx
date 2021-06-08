import { Text } from '@chakra-ui/react';
import React from 'react';
import { shortTimecode } from '../../../util/timecode-converter';
import { useMediaPlayerContext } from '../../misc/media-player-context';

export function TimecodeDisplay(): JSX.Element {
  const { currentTime, duration } = useMediaPlayerContext();

  return (
    <Text>
      <code style={{ color: 'grey' }}>{shortTimecode(currentTime)}</code>
      <span style={{ color: 'grey' }}> {' | '}</span>
      <code style={{ color: 'grey' }}>{duration ? `${shortTimecode(duration)}` : '00:00:00'}</code>
    </Text>
  );
}
