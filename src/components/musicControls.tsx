import { DialogButton, Focusable } from "decky-frontend-lib";

import { useEffect, useRef, VFC } from "react";
import { useStateContext, AppActions } from "../context/context";
import * as python from "./../python";
import {
  musicControlButtonStyle,
  musicControlButtonStyleFirst,
} from "../styles/style";
import { FaPlay, FaPause, FaFastForward, FaFastBackward } from "react-icons/fa";

export const MusicControls: VFC = () => {
  const { state, dispatch } = useStateContext();
  const playPauseToggledTrimoutRef = useRef<NodeJS.Timer | null>(null);

  const onClickPrevious = () => {
    python.execute(python.triggerPrevious());
  };

  const onClickPlayPause = () => {
    if (state.hasAvailableTrack) {
      if (playPauseToggledTrimoutRef.current != null) {
        clearTimeout(playPauseToggledTrimoutRef.current!);
      }

      dispatch({
        type: AppActions.SetPlayingStateByUser,
        value: state.currentTrackStatus == "Playing" ? "Paused" : "Playing",
      });

      playPauseToggledTrimoutRef.current = setTimeout(() => {
        dispatch({
          type: AppActions.SetHasChangedPlaybackState,
          value: false,
        });
      }, 1000);
    }

    python.execute(python.triggerPlay());
  };

  const onClickNext = () => {
    python.execute(python.triggerNext());
  };

  const onDismount = () => {
    clearTimeout(playPauseToggledTrimoutRef!.current!);
    playPauseToggledTrimoutRef.current = null;
  };

  useEffect(() => {
    // Clear the interval when the component unmounts
    return () => {
      onDismount();
    };
  }, []);

  return (
    <Focusable
      style={{ marginTop: "10px", marginBottom: "10px", display: "flex" }}
      flow-children="horizontal"
    >
      <DialogButton
        style={musicControlButtonStyleFirst}
        onClick={onClickPrevious}
      >
        <FaFastBackward style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
      <DialogButton style={musicControlButtonStyle} onClick={onClickPlayPause}>
        {state.currentTrackStatus == "Playing" ? (
          <FaPause style={{ marginTop: "-4px", display: "block" }} />
        ) : (
          <FaPlay style={{ marginTop: "-4px", display: "block" }} />
        )}
      </DialogButton>
      <DialogButton style={musicControlButtonStyle} onClick={onClickNext}>
        <FaFastForward style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
    </Focusable>
  );
};
