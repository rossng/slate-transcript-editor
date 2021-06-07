import { Button, FormControl, FormHelperText, Grid, MenuItem, Select, Switch, Tooltip, Typography } from '@material-ui/core';
import { Forward10, Replay10 } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { shortTimecode } from '../../util/timecode-converter';
import { Instructions } from '../Instructions';
import { SpeakersCheatSheet } from '../SpeakersCheatSheet';
import { useTranscriptEditorContext } from '../TranscriptEditorContext';

const PLAYBACK_RATE_VALUES = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 10;

export function MediaPlayer(): JSX.Element {
  const {
    mediaRef,
    mediaUrl,
    currentTime,
    playbackRate,
    handleAnalyticsEvents,
    setPlaybackRate,
    setIsPauseWhileTyping,
    isPauseWhileTyping,
    isEditable,
    ...context
  } = useTranscriptEditorContext();

  const handleSetPlaybackRate = useCallback(
    (e) => {
      const previousPlaybackRate = playbackRate;
      const n = e.target.value;
      const tmpNewPlaybackRateValue = parseFloat(n);
      if (mediaRef && mediaRef.current) {
        mediaRef.current.playbackRate = tmpNewPlaybackRateValue;
        setPlaybackRate(tmpNewPlaybackRateValue);

        handleAnalyticsEvents?.('ste_handle_set_playback_rate', {
          fn: 'handleSetPlaybackRate',
          previousPlaybackRate,
          newPlaybackRate: tmpNewPlaybackRateValue,
        });
      }
    },
    [playbackRate, mediaRef, setPlaybackRate, handleAnalyticsEvents]
  );

  const handleSeekBack = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime - SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      handleAnalyticsEvents?.('ste_handle_seek_back', {
        fn: 'handleSeekBack',
        newCurrentTimeInSeconds: newCurrentTime,
        seekBackValue: SEEK_BACK_SEC,
      });
    }
  };

  const handleFastForward = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime + SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      handleAnalyticsEvents?.('ste_handle_fast_forward', {
        fn: 'handleFastForward',
        newCurrentTimeInSeconds: newCurrentTime,
        seekBackValue: SEEK_BACK_SEC,
      });
    }
  };

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
    <Grid container direction="column" justifyContent="flex-start" alignItems="stretch" spacing={2}>
      <Grid item container>
        <video
          style={{ backgroundColor: 'black' }}
          ref={mediaRef}
          src={mediaUrl}
          width={'100%'}
          // height="auto"
          controls
          playsInline
        ></video>
      </Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} item>
        <Grid item>
          <p>
            <code style={{ color: 'grey' }}>{shortTimecode(currentTime)}</code>
            <span style={{ color: 'grey' }}> {' | '}</span>
            <code style={{ color: 'grey' }}>{context.duration ? `${shortTimecode(context.duration)}` : '00:00:00'}</code>
          </p>
        </Grid>
        <Grid item>
          <FormControl>
            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={playbackRate} onChange={handleSetPlaybackRate}>
              {PLAYBACK_RATE_VALUES.map((playbackRateValue, index) => {
                return (
                  <MenuItem key={index + playbackRateValue} value={playbackRateValue}>
                    {' '}
                    x {playbackRateValue}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>Speed</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <Tooltip title={<Typography variant="body1">{` Seek back by ${SEEK_BACK_SEC} seconds`}</Typography>}>
            <Button color="primary" onClick={handleSeekBack}>
              <Replay10 color="primary" fontSize="large" />
            </Button>
          </Tooltip>
          <Tooltip title={<Typography variant="body1">{` Fast forward by ${SEEK_BACK_SEC} seconds`}</Typography>}>
            <Button color="primary" onClick={handleFastForward}>
              <Forward10 color="primary" fontSize="large" />
            </Button>
          </Tooltip>
        </Grid>

        <Grid item>
          {isEditable && (
            <Tooltip
              enterDelay={3000}
              title={
                <Typography variant="body1">
                  {`Turn ${isPauseWhileTyping ? 'off' : 'on'} pause while typing functionality. As
          you start typing the media while pause playback until you stop. Not
          recommended on longer transcript as it might present performance issues.`}
                </Typography>
              }
            >
              <Typography variant="subtitle2" gutterBottom>
                <Switch color="primary" checked={isPauseWhileTyping} onChange={handleSetPauseWhileTyping} />
                Pause media while typing
              </Typography>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      <Grid item>
        <Instructions />
      </Grid>
      <Grid item>
        <SpeakersCheatSheet />
      </Grid>
    </Grid>
  );
}
