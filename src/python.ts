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

export function sp_previous(): Promise<any> {
    return server!.callPluginMethod("sp_previous", {});
}

export function getTrackProgress(): Promise<any> {
    return server!.callPluginMethod("get_track_progress", {});
}

export function sp_start(): Promise<any> {
    return server!.callPluginMethod("sp_start", {});
}