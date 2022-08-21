import { useState, VFC } from "react";
import { defaultState } from "../context/defaultState";
import * as python from "./../python";

export const AlbumArt: VFC<{ albumArt: string }> = ({ albumArt }) => {
  const [isCachingArt, setIsCachingArt] = useState<boolean>(false);
  const [lastCachedUrl, setLastCachedUrl] = useState<string>("");
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState<string>(
    defaultState.currentArtUrl
  );

  if (lastCachedUrl != albumArt && !isCachingArt) {
    if (albumArt.startsWith("file:///")) {
      setIsCachingArt(true);
      python.resolve(python.cacheAlbumArt(albumArt), (cachedArt: string) => {
        if (cachedArt == "") {
          setCurrentDisplayUrl(defaultState.currentArtUrl);
        } else {
          setCurrentDisplayUrl(cachedArt);
        }

        setIsCachingArt(false);
      });
    } else {
      setCurrentDisplayUrl(albumArt);
    }

    setLastCachedUrl(albumArt);
  }

  return (
    <div style={{ width: "80px", height: "80px" }}>
      <img
        style={{ borderRadius: "5px", width: "80px", height: "80px" }}
        src={currentDisplayUrl}
      />
    </div>
  );
};
