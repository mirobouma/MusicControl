import default_music from "../../assets/default_music.png";

export const defaultState = {
  hasChangedProvider: true,
  isSeeking: false,
  isSettingVolume: false,
  serviceIsAvailable: false,
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
