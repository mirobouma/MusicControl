import { VFC } from "react";

export const AlbumArt: VFC<{ albumArt: string }> = ({ albumArt }) => {
  return (
    <div style={{ width: "80px", height: "80px" }}>
      <img
        style={{ borderRadius: "5px", width: "80px", height: "80px" }}
        src={albumArt}
      />
    </div>
  );
};
