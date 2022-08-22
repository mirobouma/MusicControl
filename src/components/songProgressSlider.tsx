import { useEffect, useRef, VFC } from "react";
import { PanelSectionRow, SliderField } from "decky-frontend-lib";
import { useStateContext, AppActions } from "../context/context";
import * as python from "./../python";

export const SongProgressSlider: VFC = () => {
  const { state, dispatch } = useStateContext();
  const seekTimeoutRef = useRef<NodeJS.Timer | null>(null);

  const onSliderChanged = (value: number) => {
    const roundedProgress = Math.round(value * state.currentTrackLength);

    python.execute(
      python.triggerSetPosition(roundedProgress, state.currentTrackId)
    );

    dispatch({
      type: AppActions.SeekToPosition,
      value: roundedProgress,
    });

    if (seekTimeoutRef.current != null) {
      clearTimeout(seekTimeoutRef.current!);
    }

    seekTimeoutRef.current = setTimeout(() => {
      dispatch({
        type: AppActions.SetIsSeeking,
        value: false,
      });
    }, 1500);
  };

  const onDismount = () => {
    clearTimeout(seekTimeoutRef!.current!);
    seekTimeoutRef.current = null;
  };

  useEffect(() => {
    // Clear the interval when the component unmounts
    return () => {
      onDismount();
    };
  }, []);

  if (state.currentTrackLength <= 1) return <div></div>;
  return (
    <PanelSectionRow>
      <SliderField
        value={state.currentTrackProgress / state.currentTrackLength}
        min={0}
        max={1}
        step={0.05}
        disabled={!state.canSeek}
        onChange={onSliderChanged}
      ></SliderField>
    </PanelSectionRow>
  );
};
