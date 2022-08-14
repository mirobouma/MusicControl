import subprocess
import os
import sys
import getpass

SP_DEST = "org.mpris.MediaPlayer2.spotify"
STRAWBERRY_DEST = "org.mpris.MediaPlayer2.strawberry"

MP_PATH = "/org/mpris/MediaPlayer2"
MP_MEMB = "org.mpris.MediaPlayer2.Player"
PROP_PATH = "org.freedesktop.DBus.Properties.Get"

class Plugin:
    def _sp_dbus(self, command, parameters):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        return subprocess.Popen(f"dbus-send --print-reply --dest={SP_DEST} {MP_PATH} {MP_MEMB}.{command} \
            {parameters} > /dev/null", stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]

    async def _sp_open(self, uri):
        return self._sp_dbus(self, "OpenUri", f"string:{uri}")

    async def sp_play(self):
        return self._sp_dbus(self, "PlayPause", "")

    async def sp_pause(self):
        return self._sp_dbus(self, "Pause", "")
    
    async def sp_next(self):
        return self._sp_dbus(self, "Next", "")

    async def sp_previous(self):
        return self._sp_dbus(self, "Previous", "")

    async def sp_seek(self, amount):
        return self._sp_dbus(self, "Seek", f"int64:\"{amount}\"")

    async def get_track_status(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        return subprocess.Popen(f"dbus-send --print-reply --dest={SP_DEST} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB}\" string:'PlaybackStatus' \
            | tail -1 \
            | cut -d \"\"\" -f2" \
            ,stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]

    async def get_track_progress(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result = subprocess.Popen(f"dbus-send --print-reply --dest={SP_DEST} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB}\" string:'Position' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev" \
            , stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]
        print(result)
        sys.stdout.flush()
        return result

    async def get_meta_data(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        try:
            result = subprocess.Popen(f"dbus-send --print-reply --dest={SP_DEST} {MP_PATH} {PROP_PATH} \
                string:\"{MP_MEMB}\" string:'Metadata' \
                | grep -Ev \"^method\"                           `# Ignore the first line.`   \
                | grep -Eo '(\"(.*)\")|(\\b[0-9][a-zA-Z0-9.]*\\b)' `# Filter interesting fiels.`\
                | sed -E '2~2 a|'                              `# Mark odd fields.`         \
                | tr -d '\n'                                   `# Remove all newlines.`     \
                | sed -E 's/\\|/\\n/g'                           `# Restore newlines.`        \
                | sed -E 's/(xesam:)|(mpris:)//'               `# Remove ns prefixes.`      \
                | sed -E 's/^\"//'                              `# Strip leading...`         \
                | sed -E 's/\"$//'                              `# ...and trailing quotes.`  \
                | sed -E 's/\"+/|/'                             `# Regard "" as seperator.`  \
                | sed -E 's/ +/ /g'                            `# Merge consecutive spaces.`",  
                stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]
        except:
            result = "Unavailable"

        return result

    async def _main(self):
        pass