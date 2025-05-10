import React, { useState } from "react";
import placeholderImg from "../../../assets/img/placeholder-img.png";

const MediaComponent = ({ msg }) => {
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const handleVideoError = () => {
    setVideoError(true); // Set error state for video
  };

  const handleAudioError = () => {
    setAudioError(true); // Set error state for audio
  };

  return (
    <div className="w-full h-auto max-w-xs">
      {msg.attachment?.fileType.startsWith("video/") ? (
        // For video files
        <div>
          {videoError ? (
            <div className="text-red-500 text-sm">
              Error loading video. Please try again later.
            </div>
          ) : (
            <video
              controls
              className="rounded-lg max-h-60 object-cover"
              onError={handleVideoError} // Handle video error
              onCanPlay={(e) => {
                const token = localStorage.getItem("token");
                fetch(
                  `/api/messages/${msg.attachment.attachmentID}/attachment`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                  .then((response) => response.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    e.target.src = url;
                  })
                  .catch((err) => {
                    console.error("Error loading video: ", err);
                    setVideoError(true); // Set error state for video
                  });
              }}
            >
              <source
                src="../../../assets/placeholder-video.mp4" // Initial placeholder
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : msg.attachment?.fileType.startsWith("audio/") ? (
        // For audio files
        <div>
          {audioError ? (
            <div className="text-red-500 text-sm">
              Error loading audio. Please try again later.
            </div>
          ) : (
            <audio
              controls
              className="rounded-lg"
              onError={handleAudioError} // Handle audio error
              onLoadedData={(e) => {
                const token = localStorage.getItem("token");
                fetch(
                  `/api/messages/${msg.attachment.attachmentID}/attachment`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                  .then((response) => response.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    e.target.src = url;
                  })
                  .catch((err) => {
                    console.error("Error loading audio: ", err);
                    setAudioError(true); // Set error state for audio
                  });
              }}
            >
              <source
                src="../../../assets/placeholder-audio.mp3" // Initial placeholder
                type="audio/mp3"
              />
              Your browser does not support the audio tag.
            </audio>
          )}
        </div>
      ) : (
        <span>Unsupported media type</span> // Fallback for unsupported file types
      )}
      {msg.attachment.fileType.startsWith("image/") && (
        <div className="w-full h-auto max-w-xs">
          <img
            src={placeholderImg} // Initial placeholder image
            alt={msg.attachment.fileName}
            className="rounded-lg max-h-60 object-cover"
            onLoad={(e) => {
              const token = localStorage.getItem("token");
              // Fetching the image with the token in headers
              fetch(`/api/messages/${msg.attachment.attachmentID}/attachment`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`, // Authorization header with token
                },
              })
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob); // Create a URL for the blob
                  e.target.src = url; // Set the blob URL as the src for the image
                })
                .catch((err) => {
                  console.error("Error loading image: ", err);
                  e.target.src = placeholderImg; // Fallback to placeholder image
                });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MediaComponent;
