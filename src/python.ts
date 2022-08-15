import { ServerAPI } from "decky-frontend-lib";

var server: ServerAPI | undefined = undefined;

export function resolve(promise: Promise<any>, setter: any) {
    (async function () {
        let data = await promise;
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
        let data = await promise;
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
export function startDbusDaemon(): Promise<any> {
    return server!.callPluginMethod("start_dbus_daemon", {});
}

// Python functions
export function getMetaData(): Promise<any> {
    return server!.callPluginMethod("get_meta_data", {});
}

export function sp_play(): Promise<any> {
    return server!.callPluginMethod("sp_play", {});
}

export function sp_next(): Promise<any> {
    return server!.callPluginMethod("sp_next", {});
}

export function sp_seek(amount: number): Promise<any> {
    return server!.callPluginMethod("sp_seek", {amount});
}

export function sp_setPosition(position: number, trackid: string): Promise<any> {
    return server!.callPluginMethod("sp_set_position",  {
        position: position,
        trackid: trackid,
      });
}

export function sp_track_status(): Promise<any> {
    return server!.callPluginMethod("sp_track_status", {});
}

export function sp_previous(): Promise<any> {
    return server!.callPluginMethod("sp_previous", {});
}

export function sp_track_progress(): Promise<any> {
    return server!.callPluginMethod("sp_track_progress", {});
}

export function sp_list_media_players(): Promise<any> {
    return server!.callPluginMethod("sp_list_media_players", {});
}

export function sp_get_media_player(): Promise<any> {
    return server!.callPluginMethod("sp_get_media_player", {});
}

export function sp_set_media_player(player: string): Promise<any> {
    if(player == "")
    return server!.callPluginMethod("sp_set_media_player", {player: "org.mpris.MediaPlayer2.spotify"});
   
    return server!.callPluginMethod("sp_set_media_player", {player});
}

export function sp_start(): Promise<any> {
    return server!.callPluginMethod("sp_start", {});
}