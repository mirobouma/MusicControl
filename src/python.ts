import { ServerAPI } from "decky-frontend-lib";

let server: ServerAPI | undefined = undefined;

export function resolve(promise: Promise<any>, setter: any) {
  (async function () {
    const data = await promise;
    if (data.success) {
      console.debug("Got resolved", data, "promise", promise);
      setter(data.result);
    } else {
      console.warn("Resolve failed:", data, "promise", promise);
    }
  })();
}

export function execute(promise: Promise<any>) {
  (async function () {
    const data = await promise;
    if (data.success) {
      console.debug("Got executed", data, "promise", promise);
    } else {
      console.warn("Execute failed:", data, "promise", promise);
    }
  })();
}

export function setServer(s: ServerAPI) {
  server = s;
}

// Python functions
export function getMetaData(): Promise<any> {
  return server!.callPluginMethod("get_meta_data", {});
}

export function cacheAlbumArt(artUrl: string): Promise<any> {
  return server!.callPluginMethod("cache_album_art", { artUrl: artUrl });
}

export function triggerPlay(): Promise<any> {
  return server!.callPluginMethod("sp_play", {});
}

export function triggerNext(): Promise<any> {
  return server!.callPluginMethod("sp_next", {});
}

export function triggerPrevious(): Promise<any> {
  return server!.callPluginMethod("sp_previous", {});
}

export function triggerSeek(amount: number): Promise<any> {
  return server!.callPluginMethod("sp_seek", { amount });
}

export function triggerSetPosition(
  position: number,
  trackid: string
): Promise<any> {
  return server!.callPluginMethod("sp_set_position", {
    position: position,
    trackid: trackid,
  });
}

export function triggerTrackStatus(): Promise<any> {
  return server!.callPluginMethod("sp_track_status", {});
}

export function getProviderIdentity(orgPath: string): Promise<any> {
  return server!.callPluginMethod("sp_identity", { orgPath });
}

export function getTrackProgress(): Promise<any> {
  return server!.callPluginMethod("sp_track_progress", {});
}

export function getTrackVolume(): Promise<any> {
  return server!.callPluginMethod("sp_get_volume", {});
}

export function getCanSeek(): Promise<any> {
  return server!.callPluginMethod("sp_can_seek", {});
}

export function triggerSetVolume(volume: number): Promise<any> {
  return server!.callPluginMethod("sp_set_volume", { volume });
}

export function getMediaPlayerList(): Promise<any> {
  return server!.callPluginMethod("sp_list_media_players", {});
}

export function testVolumeControl(): Promise<any> {
  return server!.callPluginMethod("sp_test_volume_control", {});
}

export function setMediaPlayer(player: string): Promise<any> {
  if (player == "")
    return server!.callPluginMethod("sp_set_media_player", {
      player: "org.mpris.MediaPlayer2.spotify",
    });

  return server!.callPluginMethod("sp_set_media_player", { player });
}
