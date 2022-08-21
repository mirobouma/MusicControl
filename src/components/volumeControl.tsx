import { useEffect, useRef, VFC } from "react";
import { SliderField, staticClasses } from "decky-frontend-lib";
import { useStateContext, AppActions } from "../context/context";
import * as python from "./../python";

export const VolumeControl: VFC = () => {
  const { state, dispatch } = useStateContext();
  const volumeTimeoutRef = useRef<NodeJS.Timer | null>(null);

  const onSliderChanged = (value: number) => {
    const normalizedValue = (value /= 100.0);
    python.execute(python.triggerSetVolume(normalizedValue));

    dispatch({
      type: AppActions.AdjustVolumeByUser,
      value: normalizedValue,
    });

    if (volumeTimeoutRef.current != null) {
      clearTimeout(volumeTimeoutRef.current!);
    }

    volumeTimeoutRef.current = setTimeout(() => {
      dispatch({
        type: AppActions.SetIsAdjustingVolume,
        value: false,
      });
    }, 1500);
  };

  const onDismount = () => {
    clearTimeout(volumeTimeoutRef!.current!);
    volumeTimeoutRef.current = null;
  };

  useEffect(() => {
    // Clear the interval when the component unmounts
    return () => {
      onDismount();
    };
  }, []);

  if (!state.serviceIsAvailable || !state.canModifyVolume) return <div />;
  return (
    <div>
      <div className={staticClasses.PanelSectionTitle}>Playback Volume</div>
      <div>
        <SliderField
          value={Math.round(state.currentVolume * 100)}
          min={0}
          max={100}
          step={1}
          onChange={onSliderChanged}
        ></SliderField>
      </div>
    </div>
  );
};
