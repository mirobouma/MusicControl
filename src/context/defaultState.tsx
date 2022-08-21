import default_music from "../../assets/default_music.png";

export const defaultState = {
  hasChangedPlaybackState: false,
  hasChangedProvider: true,
  isSeeking: false,
  isSettingVolume: false,
  hasAvailableTrack: false,
  currentSong: "Not Playing",
  currentArtist: "Unknown Artist",
  currentArtUrl: default_music,
  currentTrackId: "/not/used",
  currentTrackProgress: 0,
  currentTrackLength: 1,
  currentTrackStatus: "Paused",
  currentServiceProvider: "",
  providers: [],
  providersToIdentity: [],
  currentVolume: 1.0,
  canModifyVolume: false,
  canSeek: false,
};

export const defaultMeta = {
  hasAvailableTrack: false,
  hasChangedPlaybackState: false,
  isSeeking: false,
  isSettingVolume: false,
  currentSong: "Not Playing",
  currentArtist: "Unknown Artist",
  currentArtUrl: default_music,
  currentTrackId: "/not/used",
  currentTrackProgress: 0,
  currentTrackLength: 1,
  currentTrackStatus: "Paused",
  currentVolume: 1.0,
  canModifyVolume: false,
  canSeek: false,
};
