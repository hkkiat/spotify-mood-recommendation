import React from 'react';

interface SpotifyPlayerProps {
  playlistId: string | null;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ playlistId }) => {
  if (!playlistId) {
    return <div>Please create a playlist to see the player.</div>;
  }

  const srcUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

  return (
    <div>
      {/* <h3>Your Spotify Playlist</h3> */}
      <iframe
        src={srcUrl}
        width="760"
        height="380"
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media"
      ></iframe>
    </div>
  );
};

export default SpotifyPlayer;
