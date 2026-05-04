import React, { useState, useEffect } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import FileFilters from "./components/FileFilters";
import StatsPanel from "./components/StatsPanel";
import { getFiles, getStats } from "./services/api";

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    min_size: "",
    max_size: "",
    mime_type: "",
    date_from: "",
    date_to: "",
    duplicates_only: false,
  });

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await getFiles(filters);
      setFiles(data.results || data);
    } catch (error) {
      console.error("Error loading files:", error);
      alert("Error loading files. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    loadFiles();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFileUploaded = () => {
    loadFiles();
    loadStats();
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="App">

      <div className="App-container">
        <StatsPanel stats={stats} />

        <main className="main-content">
          <section className="content-block" aria-labelledby="upload-heading">
            <h2 id="upload-heading" className="content-block__title">
              Upload
            </h2>
            <FileUpload onUpload={handleFileUploaded} />
          </section>

          <section className="content-block" aria-labelledby="filter-heading">
            <h2 id="filter-heading" className="content-block__title">
              Search &amp; filter
            </h2>
            <FileFilters filters={filters} onChange={handleFilterChange} />
          </section>

          <section
            className="content-block content-block--no-title"
            aria-label="File list"
          >
            <FileList
              files={files}
              loading={loading}
              onRefresh={loadFiles}
            />
          </section>
        </main>

        <footer className="App-footer">
          Abnormal File Vault · Secure uploads with hash deduplication
          - Nainsi Das
        </footer>
      </div>
    </div>
  );
}

export default App;
