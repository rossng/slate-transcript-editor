import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SlateHelpers from '../../slate-helpers';
import { useTranscriptEditorContext } from './transcript-editor-context';

interface MediaPlayerCtx {
  currentTime: number;
  duration: number;
  handleTimedTextClick: (event: React.MouseEvent<HTMLElement>) => void;
  mediaRef: React.RefObject<HTMLVideoElement>;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

const MediaPlayerContext = createContext<MediaPlayerCtx | undefined>(undefined);

export function useMediaPlayerContext(): MediaPlayerCtx {
  const ctx = useContext(MediaPlayerContext);
  if (!ctx) {
    throw new Error('MediaPlayerContext not available - are you outside the provider?');
  }
  return ctx;
}

export function MediaPlayerContextProvider({ children }: PropsWithChildren<Record<never, never>>): JSX.Element {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const { editor, handleAnalyticsEvents } = useTranscriptEditorContext();

  const handleTimeUpdated = useCallback(
    (e) => {
      setCurrentTime(e.target.currentTime);
      // TODO: setting duration here as a workaround
      setDuration(mediaRef.current.duration);
      //  TODO: commenting this out for now, not sure if it will fire to often?
      // if (props.handleAnalyticsEvents) {
      //   // handles if click cancel and doesn't set speaker name
      //   props.handleTimeUpdated('ste_handle_time_update', {
      //     fn: 'handleTimeUpdated',
      //     duration: mediaRef.current.duration,
      //     currentTime: e.target.currentTime,
      //   });
      // }
    },
    [mediaRef]
  );

  useEffect(() => {
    // Update the document title using the browser API
    if (mediaRef && mediaRef.current) {
      // setDuration(mediaRef.current.duration);
      const current = mediaRef.current;
      current.addEventListener('timeupdate', handleTimeUpdated);

      return function cleanup() {
        // removeEventListener
        current.removeEventListener('timeupdate', handleTimeUpdated);
      };
    } else {
      console.warn('Could not register handleTimeUpdated');
    }
  }, [handleTimeUpdated, mediaRef]);

  const handleTimedTextClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('timecode')) {
        const start = target.dataset.start;
        if (mediaRef && mediaRef.current) {
          mediaRef.current.currentTime = parseFloat(start);
          mediaRef.current.play();

          // handles if click cancel and doesn't set speaker name
          handleAnalyticsEvents?.('ste_handle_timed_text_click', {
            fn: 'handleTimedTextClick',
            clickOrigin: 'timecode',
            timeInSeconds: mediaRef.current.currentTime,
          });
        }
      } else if (target.dataset.slateString) {
        const parentNode = target.parentNode as HTMLElement;
        if (parentNode.dataset.start) {
          const { startWord } = SlateHelpers.getSelectionNodes(editor, editor.selection);
          if (mediaRef && mediaRef.current && startWord && startWord.start) {
            mediaRef.current.currentTime = parseFloat(startWord.start);
            mediaRef.current.play();

            // handles if click cancel and doesn't set speaker name
            handleAnalyticsEvents?.('ste_handle_timed_text_click', {
              fn: 'handleTimedTextClick',
              clickOrigin: 'word',
              timeInSeconds: mediaRef.current.currentTime,
            });
          } else {
            // fallback in case there's some misalignment with the words
            // use the start of paragraph instead
            const start = parseFloat(parentNode.dataset.start);
            if (mediaRef && mediaRef.current && start) {
              mediaRef.current.currentTime = start;
              mediaRef.current.play();

              // handles if click cancel and doesn't set speaker name
              handleAnalyticsEvents?.('ste_handle_timed_text_click', {
                fn: 'handleTimedTextClick',
                origin: 'paragraph-fallback',
                timeInSeconds: mediaRef.current.currentTime,
              });
            }
          }
        }
      }
    },
    [editor, handleAnalyticsEvents, mediaRef]
  );

  const ctx = useMemo(
    (): MediaPlayerCtx => ({
      currentTime,
      duration,
      handleTimedTextClick,
      mediaRef,
      playbackRate,
      setPlaybackRate,
    }),
    [currentTime, duration, handleTimedTextClick, playbackRate]
  );

  return <MediaPlayerContext.Provider value={ctx}>{children}</MediaPlayerContext.Provider>;
}
