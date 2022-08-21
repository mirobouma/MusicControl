import {
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "decky-frontend-lib";

import { VFC, useEffect, useRef } from "react";

import { musicControlDividerStyle } from "./../styles/style";

import { AlbumArt } from ".//../components/albumArt";
import { ArtistInfoPanel } from ".//../components/artistInfoPanel";
import { SongProgressSlider } from ".//../components/songProgressSlider";
import {
  AppActions,
  defaultState,
  ProviderIdentity,
  useStateContext,
} from ".//../context/context";
import * as python from ".//../python";
import { MediaProviderButton } from "./mediaProviderButton";
import { MusicControls } from "./musicControls";
import { VolumeControl } from "./volumeControl";

export const Content: VFC = () => {
  const { state, dispatch } = useStateContext();
  const periodicHookRef = useRef<NodeJS.Timer | null>(null);

  const updateStatus = () => {
    python.resolve(python.getMediaPlayerList(), (mediaPlayers: string) => {
      if (
        mediaPlayers == "Unavailable" ||
        mediaPlayers == null ||
        typeof mediaPlayers != "string" ||
        mediaPlayers == ""
      ) {
        dispatch({ type: AppActions.SetDefaultState });
        return;
      }

      const providers = mediaPlayers.split(",");
      dispatch({ type: AppActions.SetProviders, value: providers });

      if (providers.length > 0 && state.currentServiceProvider == "") {
        dispatch({
          type: AppActions.SetCurrentServiceProvider,
          value: providers[0],
        });
      }

      providers.forEach((provider: string) => {
        const identityIndex = state.providersToIdentity.findIndex(
          (mapping: ProviderIdentity) => mapping.provider == provider
        );

        if (identityIndex >= 0) return;

        python.resolve(
          python.getProviderIdentity(provider),
          (providerName: string) => {
            dispatch({
              type: AppActions.AddProviderIdentity,
              value: { provider: provider, name: providerName },
            });
          }
        );
      });

      updateTrackData();
    });
  };

  const isValidMetaData = (metaData: string) => {
    return (
      metaData != "Unavailable" &&
      metaData != null &&
      typeof metaData == "string" &&
      metaData != "" &&
      metaData.length > 0
    );
  };

  const updateTrackData = () => {
    python.resolve(python.getMetaData(), (metaData: string) => {
      if (!isValidMetaData(metaData)) {
        dispatch({ type: AppActions.SetDefaultState });
        updateStatus();
        return;
      }

      const variables = metaData.split("\n");
      const metaObject = {};

      variables.forEach((value: string) => {
        const keyValue = value.split("|");
        metaObject[keyValue[0]] = keyValue[1];
      });

      dispatch({ type: AppActions.SetMetaData, value: metaObject });

      // In some rare cases for the first time the metaData can be correct but it won't have any actual info yet
      if (
        (state.currentTrackId == "" ||
          state.currentTrackId == defaultState.currentTrackId) &&
        "trackId" in metaObject &&
        metaObject["trackId"] != ""
      ) {
        dispatch({ type: AppActions.SetHasChangedProvider, value: true });
      }

      if (!state.isSeeking) {
        python.resolve(python.getTrackProgress(), (progress: number) => {
          dispatch({ type: AppActions.SetTrackProgress, value: progress });
        });
      }

      python.resolve(python.triggerTrackStatus(), (status: string) => {
        dispatch({ type: AppActions.SetPlayingState, value: status });
      });

      if (state.canModifyVolume)
        python.resolve(python.getTrackVolume(), (volume: number) => {
          dispatch({
            type: AppActions.SetVolume,
            value: volume,
          });
        });

      if (state.hasChangedProvider) {
        python.resolve(python.testVolumeControl(), (result: string) => {
          dispatch({
            type: AppActions.SetCanModifyVolume,
            value: result == "true",
          });

          if (result == "true")
            python.resolve(python.getTrackVolume(), (volume: number) => {
              dispatch({
                type: AppActions.AdjustVolumeByUser,
                value: volume,
              });
              dispatch({
                type: AppActions.SetIsAdjustingVolume,
                value: false,
              });
            });
        });

        python.resolve(python.getCanSeek(), (result: string) => {
          dispatch({
            type: AppActions.SetCanSeek,
            value: result == "true",
          });
        });

        dispatch({
          type: AppActions.SetHasChangedProvider,
          value: false,
        });
      }
    });
  };

  const onDismount = () => {
    clearInterval(periodicHookRef!.current!);
    periodicHookRef.current = null;
  };

  useEffect(() => {
    console.debug("Setting up periodic hooks for MusicControl.");

    periodicHookRef.current = setInterval(function () {
      updateStatus();
    }, 1000);

    // Clear the interval when the component unmounts
    return () => {
      onDismount();
    };
  }, []);

  return (
    <PanelSection>
      <div className={staticClasses.PanelSectionTitle}>Currently Playing</div>
      <div style={{ display: "flex", marginBottom: "5px" }}>
        <AlbumArt albumArt={state.currentArtUrl} />
        <ArtistInfoPanel
          title={state.currentSong}
          artist={state.currentArtist}
        />
      </div>
      <SongProgressSlider />
      <MusicControls />
      <div style={musicControlDividerStyle}></div>
      <VolumeControl />
      <PanelSectionRow>
        <MediaProviderButton currentProvider={state.currentServiceProvider} />
      </PanelSectionRow>
    </PanelSection>
  );
};
