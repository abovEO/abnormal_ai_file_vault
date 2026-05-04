import React, { useState, useRef, useCallback } from "react";
import { uploadFile } from "../services/api";
import "./FileUpload.css";

const FileUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef(null);

  const runUpload = useCallback(
    async (file) => {
      if (!file) return;

      setUploading(true);
      setMessage("");

      try {
        const result = await uploadFile(file);
        setMessageType(result.is_duplicate ? "warning" : "success");
        setMessage(
          result.message ||
            (result.is_duplicate
              ? "Duplicate file detected! File reference created instead."
              : "File uploaded successfully!")
        );

        if (onUpload) {
          onUpload();
        }
      } catch (error) {
        setMessageType("error");
        setMessage(
          error.response?.data?.error ||
            "Error uploading file. Please try again."
        );
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [onUpload]
  );

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    await runUpload(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer?.files?.[0];
    await runUpload(file);
  };

  const zoneClass = [
    "upload-zone",
    isDragging && !uploading ? "upload-zone--drag" : "",
    uploading ? "upload-zone--busy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="file-upload">
      <div
        className={zoneClass}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
          aria-label="Choose file to upload"
        />

        <label htmlFor="file-input" className="upload-zone__inner">
          <div className="upload-zone__aside" aria-hidden="true">
            {uploading ? (
              <span className="upload-zone__spinner" />
            ) : (
              <div className="upload-zone__glyph">
                <svg
                  className="upload-zone__svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="17 8 12 3 7 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="3"
                    x2="12"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="upload-zone__main">
            {uploading ? (
              <>
                <span className="upload-zone__title">Uploading…</span>
                <span className="upload-zone__hint">
                  Please keep this tab open
                </span>
              </>
            ) : (
              <>
                <span className="upload-zone__title">
                  {isDragging ? "Release to upload" : "Add a file to the vault"}
                </span>
                <span className="upload-zone__hint">
                  Drag and drop anywhere in this box, or use the button — any
                  file type
                </span>
                <span className="upload-zone__cta">
                  <span className="upload-zone__cta-pill">Browse files</span>
                </span>
              </>
            )}
          </div>
        </label>
      </div>

      {message && (
        <div className={`upload-message ${messageType}`} role="status">
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
