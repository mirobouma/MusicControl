import { DialogButton, Focusable } from "decky-frontend-lib";

import { VFC } from "react";
import { useStateContext, AppActions } from "../context/context";
import * as python from "./../python";
import { musicControlButtonStyle } from "../styles/style";
import { FaPlay, FaPause, FaFastForward, FaFastBackward } from "react-icons/fa";

export const MusicControls: VFC = () => {
  const { state, dispatch } = useStateContext();

  const onClickPrevious = () => {
    python.execute(python.sp_previous());
  };

  const onClickPlayPause = () => {
    dispatch({
      type: AppActions.SetPlayingState,
      value: state.currentTrackStatus == "Playing" ? "Paused" : "Playing",
    });
    python.execute(python.sp_play());
  };

  const onClickNext = () => {
    python.execute(python.sp_next());
  };

  return (
    <Focusable
      style={{ marginTop: "10px", marginBottom: "10px", display: "flex" }}
      flow-children="horizontal"
    >
      <DialogButton style={musicControlButtonStyle} onClick={onClickPrevious}>
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
