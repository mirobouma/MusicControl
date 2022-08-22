import React, { useReducer, createContext } from "react";
import * as utils from "../utils";
import { defaultMeta, defaultState } from "./defaultState";

type ProviderIdentity = {
  provider: string;
  name: string;
};

enum AppActions {
  SetDefaultState,
  SetDefaultMeta,
  SetState,
  SetHasChangedProvider,
  SetHasAvailableTrack,
  SetIsSeeking,
  SeekToPosition,
  SetIsAdjustingVolume,
  AdjustVolumeByUser,
  SetPlayingState,
  SetPlayingStateByUser,
  SetCurrentServiceProvider,
  SetTrackProgress,
  SetCanModifyVolume,
  SetMetaData,
  SetVolume,
  SetCanSeek,
  SetProviders,
  AddProviderIdentity,
  SetHasChangedPlaybackState,
}

type Action =
  | { type: AppActions.SetDefaultState }
  | { type: AppActions.SetDefaultMeta }
  | { type: AppActions.SetState; value: State }
  | { type: AppActions.SetIsSeeking; value: State["isSeeking"] }
  | { type: AppActions.SeekToPosition; value: State["currentTrackProgress"] }
  | { type: AppActions.SetPlayingState; value: State["currentTrackStatus"] }
  | {
      type: AppActions.SetPlayingStateByUser;
      value: State["currentTrackStatus"];
    }
  | { type: AppActions.SetIsAdjustingVolume; value: State["isSettingVolume"] }
  | { type: AppActions.AdjustVolumeByUser; value: State["currentVolume"] }
  | { type: AppActions.SetVolume; value: State["currentVolume"] }
  | {
      type: AppActions.SetHasChangedPlaybackState;
      value: State["hasChangedPlaybackState"];
    }
  | { type: AppActions.SetTrackProgress; value: State["currentTrackProgress"] }
  | { type: AppActions.SetCanModifyVolume; value: State["canModifyVolume"] }
  | { type: AppActions.SetCanSeek; value: State["canSeek"] }
  | { type: AppActions.SetProviders; value: State["providers"] }
  | {
      type: AppActions.AddProviderIdentity;
      value: ProviderIdentity;
    }
  | {
      type: AppActions.SetHasChangedProvider;
      value: State["hasChangedProvider"];
    }
  | {
      type: AppActions.SetCurrentServiceProvider;
      value: State["currentServiceProvider"];
    }
  | {
      type: AppActions.SetHasAvailableTrack;
      value: State["hasAvailableTrack"];
    }
  | {
      type: AppActions.SetMetaData;
      value: Record<string, string>;
    };

type Dispatch = (action: Action) => void;

type State = {
  hasChangedPlaybackState: boolean;
  hasChangedProvider: boolean;
  isSeeking: boolean;
  isSettingVolume: boolean;
  hasAvailableTrack: boolean;
  currentSong: string;
  currentArtist: string;
  currentArtUrl: string;
  currentTrackId: string;
  currentTrackProgress: number;
  currentTrackLength: number;
  currentTrackStatus: string;
  currentServiceProvider: string;
  providers: string[];
  providersToIdentity: ProviderIdentity[];
  currentVolume: number;
  canModifyVolume: boolean;
  canSeek: boolean;
};

const AppStateContext = createContext<{
  state: State;
  dispatch: Dispatch;
}>({
  state: defaultState,
  dispatch: () => null,
});

function mainReducer(state: State, action: Action) {
  switch (action.type) {
    case AppActions.SetDefaultState: {
      return { ...state, ...defaultState };
    }
    case AppActions.SetDefaultMeta: {
      return { ...state, ...defaultMeta };
    }
    case AppActions.SetState: {
      return { ...state, ...action.value };
    }
    case AppActions.SetIsSeeking: {
      return { ...state, isSeeking: action.value };
    }
    case AppActions.SetHasChangedPlaybackState: {
      return { ...state, hasChangedPlaybackState: action.value };
    }
    case AppActions.SetCanSeek: {
      return { ...state, canSeek: action.value };
    }
    case AppActions.SeekToPosition: {
      return { ...state, currentTrackProgress: action.value, isSeeking: true };
    }
    case AppActions.SetPlayingState: {
      if (state.hasChangedPlaybackState) return state;
      return { ...state, currentTrackStatus: action.value };
    }
    case AppActions.SetPlayingStateByUser: {
      return { ...state, currentTrackStatus: action.value };
    }
    case AppActions.SetIsAdjustingVolume: {
      return { ...state, isSettingVolume: action.value };
    }
    case AppActions.SetHasChangedProvider: {
      return { ...state, hasChangedProvider: action.value };
    }
    case AppActions.SetProviders: {
      return { ...state, providers: action.value };
    }
    case AppActions.AddProviderIdentity: {
      return {
        ...state,
        providersToIdentity: [...state.providersToIdentity, action.value],
      };
    }
    case AppActions.SetTrackProgress: {
      if (state.isSeeking) return state;
      return {
        ...state,
        currentTrackProgress: utils.isValidNumber(action.value)
          ? action.value
          : 0.0,
      };
    }
    case AppActions.SetCanModifyVolume: {
      return { ...state, canModifyVolume: action.value };
    }
    case AppActions.AdjustVolumeByUser: {
      return { ...state, currentVolume: action.value, isSettingVolume: true };
    }
    case AppActions.SetVolume: {
      if (state.isSettingVolume) return state;

      return { ...state, currentVolume: action.value };
    }
    case AppActions.SetCurrentServiceProvider: {
      const hasChanged = state.currentServiceProvider != action.value;
      if (hasChanged) {
        return {
          ...state,
          currentServiceProvider: action.value,
          hasChangedProvider: true,
        };
      }

      return state;
    }
    case AppActions.SetHasAvailableTrack: {
      return { ...state, hasAvailableTrack: action.value };
    }
    case AppActions.SetMetaData: {
      const title = utils.isValidStringValueInRecord(action.value, "title")
        ? action.value["title"]
        : defaultState.currentSong;
      const artist = utils.isValidStringValueInRecord(action.value, "artist")
        ? action.value["artist"]
        : defaultState.currentArtist;
      const albumUrl = utils.getValidAlbumArtUrlInRecord(
        action.value,
        "artUrl"
      );
      const trackLength = utils.isValidNumberInRecord(action.value, "length")
        ? parseFloat(action.value["length"])
        : defaultState.currentTrackLength;
      const trackId = utils.isValidStringValueInRecord(action.value, "trackid")
        ? action.value["trackid"]
        : defaultState.currentTrackId;
      return {
        ...state,
        currentSong: title,
        currentArtist: artist,
        currentArtUrl: albumUrl,
        hasAvailableTrack: true,
        currentTrackLength: trackLength,
        currentTrackId: trackId,
      };
    }
    default: {
      return state;
    }
  }
}

const AppContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, defaultState);

  const value = { state, dispatch };
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

function useStateContext() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a AppContextProvider");
  }
  return context;
}

export {
  AppContextProvider,
  AppStateContext,
  ProviderIdentity,
  defaultState,
  AppActions,
  useStateContext,
};
