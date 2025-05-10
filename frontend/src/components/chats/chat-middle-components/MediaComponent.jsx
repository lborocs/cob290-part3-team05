import React, { useState, useEffect } from "react";
import placeholderImg from "../../../assets/img/placeholder-img.png";

const MediaComponent = ({ msg }) => {
  const [mediaSrc, setMediaSrc] = useState(null);
  const [error, setError] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (msg?.attachment?.attachmentID) {
      // Fetch media when attachmentID is available
      fetchMedia();
    }
  }, [msg]);

  const fetchMedia = () => {
    fetch(`/api/messages/${msg.attachment.attachmentID}/attachment`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setMediaSrc(url);
      })
      .catch((err) => {
        console.error("Error loading media: ", err);
        setError(true); // Set error state
      });
  };

  const renderError = (message) => (
    <div className="text-red-500 text-sm">{message}</div>
  );

  const renderMedia = () => {
    const fileType = msg.attachment?.fileType;

    if (fileType?.startsWith("video/")) {
      return error ? (
        renderError("Error loading video. Please try again later.")
      ) : (
        <video
          controls
          className="rounded-lg max-h-60 object-cover"
          src={mediaSrc || placeholderImg}
          onError={() => setError(true)}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileType?.startsWith("audio/")) {
      return error ? (
        renderError("Error loading audio. Please try again later.")
      ) : (
        <audio
          controls
          className="rounded-lg"
          src={mediaSrc || placeholderImg}
          onError={() => setError(true)}
        >
          Your browser does not support the audio tag.
        </audio>
      );
    }

    if (fileType?.startsWith("image/")) {
      return (
        <img
          src={mediaSrc || placeholderImg}
          alt={msg.attachment?.fileName || "Image"}
          className="rounded-lg max-h-60 object-cover"
          onError={() => setError(true)}
        />
      );
    }
  };

  return <div className="w-full h-auto max-w-xs">{renderMedia()}</div>;
};

export default MediaComponent;
