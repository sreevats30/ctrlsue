import { useEffect, useState } from "react";
import api from "../services/api";

export default function VerifyEvidence({ session }) {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvidences, setFilteredEvidences] = useState([]);

  useEffect(() => {
    fetchEvidences();
  }, [session]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvidences(evidences);
    } else {
      const filtered = evidences.filter(ev => 
        ev.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.id.toString().includes(searchTerm)
      );
      setFilteredEvidences(filtered);
    }
  }, [searchTerm, evidences]);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      const res = await api.get("/all-evidence", {
        params: {
          role: session.role,
          user_id: session.user_id
        }
      });
      setEvidences(res.data);
      setFilteredEvidences(res.data);
    } catch (error) {
      console.error("Failed to load evidence list:", error);
      alert("Failed to load evidence list. You may not have proper permissions.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (id) => {
    setVerifyingId(id);
    try {
      const response = await api.get(`/verify/${id}`, {
        params: {
          role: session.role,
          user_id: session.user_id
        }
      });

      if (response.data.valid) {
        alert(`Evidence ${id} verified successfully.\nNo tampering detected.`);
      } else {
        alert(`Evidence ${id} verification failed.\nTampering detected!`);
      }
      
      fetchEvidences();
      
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Verification failed due to server error."
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const viewEvidence = (id) => {
    const url = `http://127.0.0.1:5050/view-evidence/${id}?role=${session.role}&user_id=${session.user_id}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
      pdf: 'document', doc: 'document', docx: 'document',
      mp4: 'video', mov: 'video', avi: 'video',
      zip: 'archive', rar: 'archive',
      log: 'text', txt: 'text',
      pcap: 'network', dmp: 'system'
    };
    return iconMap[ext] || 'file';
  };

  const renderFileIcon = (filename) => {
    const fileType = getFileIcon(filename);
    
    const iconMap = {
      image: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#29c4ff" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="2" fill="#29c4ff"/>
          <path d="M21 15L16 10L5 21" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      document: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M16 13H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 9H9H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      video: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M9 12L12 10V14L9 12Z" fill="#29c4ff"/>
        </svg>
      ),
      text: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M16 13H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 9H9H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      archive: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M8 10H16" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 14H16" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      file: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
        </svg>
      )
    };

    return iconMap[fileType] || iconMap.file;
  };

  return (
    <div className="forensic-container">
      <div className="forensic-content">
        <div className="forensic-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Forensic Verification Dashboard</h1>
              <p className="header-subtitle">Integrity Verification & Chain of Custody Audit</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{evidences.length}</span>
                <span className="stat-label">Total Evidence</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{session.role}</span>
                <span className="stat-label">Your Role</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forensic-card">
          <div className="card-header">
            <div className="header-section">
              <h2>Evidence Verification Portal</h2>
              <p className="header-description">Verify integrity and view all evidence records in the system</p>
            </div>
            <div className="header-controls">
              <div className="search-container">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#a0a0ff" strokeWidth="1.5"/>
                  <path d="M15 15L11.5 11.5" stroke="#a0a0ff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search evidence by filename, officer, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="refresh-button" onClick={fetchEvidences} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 2.5V5.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.5 8.5C12.5 10.4891 11.1188 12.1324 9.25 12.6132" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M2.5 13.5V10.5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.5 7.5C3.5 5.51088 4.8812 3.86764 6.75 3.38684" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading evidence records...</p>
            </div>
          ) : filteredEvidences.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="12" y="16" width="40" height="32" rx="2" stroke="#29c4ff" strokeWidth="2"/>
                  <path d="M28 24H44" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M28 32H44" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M28 40H36" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 24H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 32H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 40H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>No Evidence Records Found</h3>
              <p className="empty-description">
                {searchTerm ? 'No evidence matches your search criteria.' : 'No evidence has been uploaded to the system yet.'}
              </p>
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="evidence-table">
              <div className="table-header">
                <div className="table-row header-row">
                  <div className="table-cell">Evidence ID</div>
                  <div className="table-cell">File Details</div>
                  <div className="table-cell">Upload Information</div>
                  <div className="table-cell">Actions</div>
                </div>
              </div>
              
              <div className="table-body">
                {filteredEvidences.map(ev => (
                  <div key={ev.id} className="table-row evidence-row">
                    <div className="table-cell id-cell">
                      <span className="evidence-id">#{ev.id}</span>
                    </div>
                    
                    <div className="table-cell file-cell">
                      <div className="file-info">
                        <div className="file-icon">
                          {renderFileIcon(ev.filename)}
                        </div>
                        <div className="file-details">
                          <span className="filename">{ev.filename}</span>
                          <span className="upload-date">{formatDate(ev.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell uploader-cell">
                      <div className="uploader-info">
                        <div className="uploader-name">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4" r="3" stroke="#29c4ff" strokeWidth="1.5"/>
                            <path d="M1 13C1 10.2 3.2 8 6 8H8C10.8 8 13 10.2 13 13" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span>{ev.uploaded_by_name}</span>
                        </div>
                        <div className="uploader-meta">
                          <span className="uploader-role">{ev.uploaded_by_role}</span>
                          <span className="uploader-id">ID: {ev.uploaded_by_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="view-button"
                          onClick={() => viewEvidence(ev.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 7C1 7 3.5 2 7 2C10.5 2 13 7 13 7C13 7 10.5 12 7 12C3.5 12 1 7 1 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          View
                        </button>
                        
                        <button 
                          className="verify-button"
                          onClick={() => verify(ev.id)}
                          disabled={verifyingId === ev.id}
                        >
                          {verifyingId === ev.id ? (
                            <>
                              <span className="button-spinner"></span>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M13 7C13 10.3 10.3 13 7 13C3.7 13 1 10.3 1 7C1 3.7 3.7 1 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Verify
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="forensic-footer">
            <div className="footer-info">
              <div className="info-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 0C3.1 0 0 3.1 0 7C0 10.9 3.1 14 7 14C10.9 14 14 10.9 14 7C14 3.1 10.9 0 7 0ZM7 12.6C3.8 12.6 1.4 10.2 1.4 7C1.4 3.8 3.8 1.4 7 1.4C10.2 1.4 12.6 3.8 12.6 7C12.6 10.2 10.2 12.6 7 12.6Z" fill="#29c4ff"/>
                  <path d="M9.8 6.3H7.7V3.5C7.7 3.1 7.4 2.8 7 2.8C6.6 2.8 6.3 3.1 6.3 3.5V7C6.3 7.4 6.6 7.7 7 7.7H9.8C10.2 7.7 10.5 7.4 10.5 7C10.5 6.6 10.2 6.3 9.8 6.3Z" fill="#29c4ff"/>
                </svg>
                <span>System Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="info-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12.6 6.3H11.2V4.9C11.2 2.2 9 0 6.3 0S1.4 2.2 1.4 4.9V6.3H0C-0.4 6.3 -0.7 6.6 -0.7 7V12.6C-0.7 13 -0.4 13.3 0 13.3H12.6C13 13.3 13.3 13 13.3 12.6V7C13.3 6.6 13 6.3 12.6 6.3ZM2.8 4.9C2.8 3.2 4.2 1.8 5.9 1.8S9 3.2 9 4.9V6.3H2.8V4.9Z" fill="#29c4ff"/>
                </svg>
                <span>Forensic Officer Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .forensic-container {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #0c0c2e 0%, #1a1a3e 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: #e0e0ff;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
        }
        
        .forensic-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .forensic-header {
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(41, 196, 255, 0.2);
        }

        .header-title {
          flex: 1;
        }

        h1 {
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 8px 0;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.3px;
        }

        .header-subtitle {
          font-size: 16px;
          color: #a0a0ff;
          margin: 0;
          font-weight: 400;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 20px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.2);
          min-width: 120px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #a0a0ff;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .forensic-card {
          background: rgba(16, 18, 37, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(41, 196, 255, 0.15);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(41, 196, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .forensic-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
        }

        .card-header {
          margin-bottom: 32px;
        }

        .header-section {
          margin-bottom: 24px;
        }

        h2 {
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .header-description {
          font-size: 15px;
          color: #a0a0ff;
          margin: 0;
          line-height: 1.5;
        }

        .header-controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .search-container {
          flex: 1;
          position: relative;
          max-width: 500px;
        }

        .search-container svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: rgba(10, 12, 28, 0.8);
          border: 1px solid rgba(41, 196, 255, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #29c4ff;
          box-shadow: 0 0 0 2px rgba(41, 196, 255, 0.2);
        }

        .search-input::placeholder {
          color: #666699;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          border: 1px solid rgba(41, 196, 255, 0.3);
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background: rgba(41, 196, 255, 0.2);
          transform: translateY(-1px);
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(41, 196, 255, 0.1);
          border-top-color: #29c4ff;
          border-radius: 50%;
          animation: spin 1s infinite linear;
          margin-bottom: 20px;
        }

        .loading-text {
          font-size: 16px;
          color: #a0a0ff;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 80px 0;
        }

        .empty-icon {
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 22px;
          color: #ffffff;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .empty-description {
          font-size: 15px;
          color: #a0a0ff;
          max-width: 500px;
          margin: 0 auto 20px;
          line-height: 1.6;
        }

        .clear-search {
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          border: 1px solid rgba(41, 196, 255, 0.3);
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-search:hover {
          background: rgba(41, 196, 255, 0.2);
          transform: translateY(-1px);
        }

        .evidence-table {
          background: rgba(10, 12, 28, 0.6);
          border: 1px solid rgba(41, 196, 255, 0.2);
          border-radius: 10px;
          overflow: hidden;
        }

        .table-header {
          background: rgba(41, 196, 255, 0.1);
          border-bottom: 1px solid rgba(41, 196, 255, 0.2);
        }

        .table-row {
          display: grid;
          grid-template-columns: 100px 1fr 250px 180px;
          align-items: center;
        }

        .header-row {
          padding: 16px 24px;
        }

        .evidence-row {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(41, 196, 255, 0.1);
          transition: background-color 0.2s ease;
        }

        .evidence-row:hover {
          background: rgba(41, 196, 255, 0.05);
        }

        .evidence-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 0 12px;
        }

        .header-row .table-cell {
          font-size: 13px;
          font-weight: 600;
          color: #a0a0ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .id-cell {
          text-align: center;
        }

        .evidence-id {
          display: inline-block;
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .file-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.2);
        }

        .file-details {
          flex: 1;
          min-width: 0;
        }

        .filename {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .upload-date {
          display: block;
          font-size: 13px;
          color: #a0a0ff;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .uploader-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uploader-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
        }

        .uploader-meta {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #a0a0ff;
        }

        .uploader-role {
          background: rgba(41, 196, 255, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .uploader-id {
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .view-button, .verify-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .view-button {
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          border: 1px solid rgba(41, 196, 255, 0.3);
        }

        .view-button:hover {
          background: rgba(41, 196, 255, 0.2);
          transform: translateY(-1px);
        }

        .verify-button {
          background: linear-gradient(135deg, #29c4ff, #8400ff);
          color: white;
          font-weight: 600;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(41, 196, 255, 0.3);
        }

        .verify-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s infinite linear;
        }

        .forensic-footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-info {
          display: flex;
          gap: 24px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #a0a0ff;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 100px 1fr 200px 160px;
          }
        }

        @media (max-width: 1024px) {
          .forensic-content {
            padding: 20px;
          }
          
          .forensic-card {
            padding: 32px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          
          .header-stats {
            width: 100%;
            justify-content: space-between;
          }
          
          .header-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            max-width: none;
          }
        }

        @media (max-width: 768px) {
          .forensic-content {
            padding: 16px;
          }
          
          .forensic-card {
            padding: 24px;
          }
          
          h1 {
            font-size: 26px;
          }
          
          h2 {
            font-size: 22px;
          }
          
          .table-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
            padding: 24px;
          }
          
          .header-row {
            display: none;
          }
          
          .table-cell {
            padding: 0;
          }
          
          .action-buttons {
            justify-content: flex-start;
          }
          
          .stat-item {
            min-width: 100px;
          }
        }

        @media (max-width: 480px) {
          .forensic-card {
            padding: 20px;
          }
          
          h1 {
            font-size: 22px;
          }
          
          .header-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}