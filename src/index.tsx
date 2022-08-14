import {
  ButtonItem,
  definePlugin,
  Field,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  SliderField,
  staticClasses,
  DialogButton, 
  Focusable
} from "decky-frontend-lib";

import { CSSProperties, VFC, useState } from "react";
import { FaMusic, FaCog, FaPlay, FaPause, FaFastForward, FaFastBackward } from "react-icons/fa";
import * as python from "./python";

import default_music from "../assets/default_music.png";
import styles from '../styles/style.css'
import { debug } from "webpack";

var firstTime: boolean = true;
var periodicHook: NodeJS.Timer | null = null;

var serviceIsAvailable: boolean = false;
var currentSong: string = "Not Playing";
var currentArtist: string = "Unknown";
var currentArtUrl: string = default_music;
var currentTrackProgress: number = 0;
var currentTrackLength: number = 1;

var updateCurrentTrack = function(){};

const titleStyles: CSSProperties = {
  display: 'flex',
  paddingTop: '3px',
  paddingBottom: '14px',
  paddingRight: '16px',
  boxShadow: 'unset',
};

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  python.setServer(serverAPI);

  const [currentSongGlobal, setCurrentSong_internal] = useState<string>(currentSong);
  const setCurrentSong = (value: string) => {
    currentSong = value;
    setCurrentSong_internal(value);
  };

  const [serviceAvailableGlobal, setServiceIsAvailable_internal] = useState<boolean>(serviceIsAvailable);
  const setServiceIsAvailable = (value: boolean) => {
    serviceIsAvailable = value;
    setServiceIsAvailable_internal(value);
  };

  const [currentArtistGlobal, setCurrentArtist_internal] = useState<string>(currentArtist);
  const setCurrentArtist = (value: string) => {
    currentArtist = value;
    setCurrentArtist_internal(value);
  };

  const [currentArtUrlGlobal, setCurrentArtUrl_internal] = useState<string>(currentArtUrl);
  const setCurrentArtUrl = (value: string) => {
    // no support for file links yet :( sorry
    if (value == "" || typeof value == undefined || value.startsWith('file:///'))
    {
      currentArtUrl = default_music;
      setCurrentArtUrl_internal(default_music);
      return;
    }
    
    currentArtUrl = value;
    setCurrentArtUrl_internal(value);
  };

  const [currentTrackProgressGlobal, setCurrentTrackProgress_internal] = useState<number>(currentTrackProgress);
  const setCurrentTrackProgress = (value: number) => {
    if (isNaN(value))
    {
      currentTrackProgress = 0;
      return;
    }
     
    currentTrackProgress = value;
    setCurrentTrackProgress_internal(value);
  };

  const [currentTrackLengthGlobal, setCurrentTrackLength_internal] = useState<number>(currentTrackLength);
  const setCurrentTrackLength = (value: number) => {
    if (isNaN(value))
    {
      currentTrackLength = 1;
      return;
    }
    currentTrackLength = value;
    setCurrentTrackLength_internal(value);
  };

  updateCurrentTrack = function () {
    python.resolve(python.getMetaData(),  (metaData: string) => {
      if (metaData == "Unavailable" || metaData == null)
      {
        setServiceIsAvailable(true);
      }
      else
      {
        if (serviceIsAvailable == false)
          setServiceIsAvailable(true);
        
        const variables = metaData.split('\n');
        var dataLookup  = {};

        variables.forEach((value: string) => {
          const keyValue = value.split('|');
          dataLookup[keyValue[0]] = keyValue[1];
        });

        setCurrentSong(dataLookup["title"]);
        setCurrentArtUrl(dataLookup["artUrl"]);
        setCurrentArtist(dataLookup["artist"]);
        setCurrentTrackLength(dataLookup["length"]);

        python.resolve(python.getTrackProgress(), (progress: number) => {
          console.log("Progress:" + progress);
          setCurrentTrackProgress(progress);
        });
      }
    });
  };

  if (firstTime) 
  {
    if (periodicHook != null) {
      clearInterval(periodicHook);
      periodicHook = null;
    }

    firstTime = false;

    console.log("Setting up periodic hook");
    periodicHook = setInterval(function() {
      console.log("Updating current track");
      updateCurrentTrack();
    }, 1000);
  }

  return (
    <PanelSection>
      <div className={staticClasses.PanelSectionTitle}> Currently playing</div>
      <div style={{display: 'flex'}}>
        <div style={{width: '80px', height:'80px'}}>
          <img style={{width: '80px', height:'80px'}} src={currentArtUrlGlobal} />
        </div>
        <div style={{width: '100%', marginLeft: '10px'}}>
          <div style={{width: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            {currentSongGlobal}
          </div>
          <div style={{
              content: "",
              bottom: '-0.5px',
              left: '0',
              right: '0',
              height: '5px',
              background: '#23262e',
              width: '100%',
              marginTop: '5px',
              marginBottom: '5px',
          }}></div>
          <div style={{width: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            {currentArtistGlobal}
          </div>
          <div style={{
              content: "",
              bottom: '-0.5px',
              left: '0',
              right: '0',
              height: '5px',
              background: '#23262e',
              width: '100%',
              marginTop: '5px',
              marginBottom: '5px',
          }}></div>
        </div>
      </div>
      <PanelSectionRow>
        <SliderField value={currentTrackProgressGlobal / currentTrackLengthGlobal} min={0} max={1} step={0.05}
         onChange={(value: number) => {
            const roundedProgress = Math.round(value * currentTrackLength);
            python.sp_seek(roundedProgress - currentTrackProgress);

            setCurrentTrackProgress(roundedProgress);
        }}></SliderField>
      </PanelSectionRow>
      <PanelSectionRow>
      <div style={{display: 'flex'}}>
      <DialogButton
        style={{height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 12px',
        minWidth: '0'}}
        onClick={python.sp_previous}>
        <FaFastBackward style={{ marginTop: '-4px', display: 'block' }} />
      </DialogButton>
      <DialogButton
        style={{height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 12px',
        minWidth: '0'}}
        onClick={python.sp_play}>
        <FaPlay style={{ marginTop: '-4px', display: 'block' }} />
      </DialogButton>
      <DialogButton
        style={{height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 12px',
        minWidth: '0'}}
        onClick={python.sp_next}>
        <FaFastForward style={{ marginTop: '-4px', display: 'block' }} />
      </DialogButton>
      </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

const Title: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  return (
    <Focusable style={titleStyles} className={staticClasses.Title}>
        <div style={{ marginRight: 'auto', flex: 0.9 }}>Music Control</div>
        <DialogButton
          style={{ height: '28px', width: '40px', minWidth: 0, padding: '10px 12px' }}>
          <FaCog style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
      </Focusable>
  );
}

const Settings: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  return (
    <PanelSection>
      <div className={staticClasses.PanelSectionTitle}>Settings</div>
    <PanelSectionRow>
    </PanelSectionRow>
    </PanelSection>
        );
}

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <Title serverAPI={serverApi} />,
    content: <Content serverAPI={serverApi} />,
    icon: <FaMusic />,
    onDismount() {
      clearInterval(periodicHook!);
      periodicHook = null;
    },
  };
});
