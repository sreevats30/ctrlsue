import { useEffect, useState } from "react";
import api from "../services/api";

export default function ViewMyEvidence({ session }) {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    fetchEvidences();
  }, [session.user_id]);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/my-evidence/${session.user_id}`);
      setEvidences(res.data);
    } catch (error) {
      console.error("Failed to load evidence:", error);
      alert("Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  const viewEvidence = (id) => {
    const url = `http://127.0.0.1:5050/view-evidence/${id}?role=${session.role}&user_id=${session.user_id}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#29c4ff" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="2" fill="#29c4ff"/>
          <path d="M21 15L16 10L5 21" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      document: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M16 13H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 9H9H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      video: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M9 12L12 10V14L9 12Z" fill="#29c4ff"/>
        </svg>
      ),
      text: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M16 13H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 9H9H8" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      archive: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M8 10H16" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 14H16" stroke="#29c4ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      file: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#29c4ff" strokeWidth="1.5"/>
          <path d="M14 2V8H20" stroke="#29c4ff" strokeWidth="1.5"/>
        </svg>
      )
    };

    return iconMap[fileType] || iconMap.file;
  };

  const toggleNote = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  return (
    <div className="evidence-container">
      <div className = "evidence-content">
      <div className="evidence-card">
        <div className="card-header">
          <div className="header-title">
            <h2>My Evidence Repository</h2>
            <p className="header-description">View and manage your submitted digital evidence</p>
          </div>
          <div className="header-actions">
            <div className="evidence-count">
              <span className="count-value">{evidences.length}</span>
              <span className="count-label">Evidence Items</span>
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
        ) : evidences.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="16" width="40" height="32" rx="2" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 24H44" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M28 32H44" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M28 40H36" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 24H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 32H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 40H21H22" stroke="#29c4ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No Evidence Submitted</h3>
            <p className="empty-description">
              You haven't submitted any evidence yet. Use the upload portal above to add new evidence to your case files.
            </p>
          </div>
        ) : (
          <div className="evidence-grid">
            {evidences.map(ev => (
              <div key={ev.id} className="evidence-item">
                <div className="evidence-item-header">
                  <div className="file-icon-wrapper">
                    {renderFileIcon(ev.filename)}
                  </div>
                  <div className="evidence-meta">
                    <span className="evidence-id">Evidence #{ev.id}</span>
                    <span className="evidence-date">{formatDate(ev.created_at)}</span>
                  </div>
                </div>
                
                <div className="evidence-details">
                  <div className="detail-row">
                    <span className="detail-label">Filename</span>
                    <span className="detail-value filename">{ev.filename}</span>
                  </div>
                  
                  {ev.note && (
                    <div className="detail-row">
                      <div className="notes-header">
                        <span className="detail-label">Investigator Notes</span>
                        <button 
                          className="expand-note-btn"
                          onClick={() => toggleNote(ev.id)}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path 
                              d={expandedNote === ev.id ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} 
                              stroke="#29c4ff" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className={`note-content ${expandedNote === ev.id ? 'expanded' : 'collapsed'}`}>
                        <p className="detail-value note">{ev.note}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="evidence-actions">
                    <button 
                      className="view-button"
                      onClick={() => viewEvidence(ev.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Evidence
                    </button>
                    
                    <div className="upload-status">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" fill="#29c4ff"/>
                      </svg>
                      Upload Complete
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="evidence-footer">
          <div className="footer-info">
            <div className="info-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 0C3.1 0 0 3.1 0 7C0 10.9 3.1 14 7 14C10.9 14 14 10.9 14 7C14 3.1 10.9 0 7 0ZM7 12.6C3.8 12.6 1.4 10.2 1.4 7C1.4 3.8 3.8 1.4 7 1.4C10.2 1.4 12.6 3.8 12.6 7C12.6 10.2 10.2 12.6 7 12.6Z" fill="#a0a0ff"/>
                <path d="M9.8 6.3H7.7V3.5C7.7 3.1 7.4 2.8 7 2.8C6.6 2.8 6.3 3.1 6.3 3.5V7C6.3 7.4 6.6 7.7 7 7.7H9.8C10.2 7.7 10.5 7.4 10.5 7C10.5 6.6 10.2 6.3 9.8 6.3Z" fill="#a0a0ff"/>
              </svg>
              <span>Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="info-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12.6 6.3H11.2V4.9C11.2 2.2 9 0 6.3 0S1.4 2.2 1.4 4.9V6.3H0C-0.4 6.3 -0.7 6.6 -0.7 7V12.6C-0.7 13 -0.4 13.3 0 13.3H12.6C13 13.3 13.3 13 13.3 12.6V7C13.3 6.6 13 6.3 12.6 6.3ZM2.8 4.9C2.8 3.2 4.2 1.8 5.9 1.8S9 3.2 9 4.9V6.3H2.8V4.9Z" fill="#a0a0ff"/>
              </svg>
              <span>Access Level: {session.role}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        .evidence-container {
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
        
        .evidence-content {
        width: 100%;
        max-width: 1000px;
        }


        .evidence-card {
          background: rgba(16, 18, 37, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(41, 196, 255, 0.15);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(41, 196, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .evidence-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-title {
          flex: 1;
        }

        h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .header-description {
          font-size: 14px;
          color: #a0a0ff;
          margin: 0;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .evidence-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 16px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.2);
        }

        .count-value {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .count-label {
          font-size: 11px;
          color: #a0a0ff;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          border: 1px solid rgba(41, 196, 255, 0.3);
          padding: 10px 16px;
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
          padding: 60px 0;
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
          padding: 60px 0;
        }

        .empty-icon {
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #ffffff;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .empty-description {
          font-size: 14px;
          color: #a0a0ff;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .evidence-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .evidence-item {
          background: rgba(10, 12, 28, 0.6);
          border: 1px solid rgba(41, 196, 255, 0.2);
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .evidence-item:hover {
          transform: translateY(-2px);
          border-color: rgba(41, 196, 255, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .evidence-item-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(41, 196, 255, 0.05);
          border-bottom: 1px solid rgba(41, 196, 255, 0.1);
        }

        .file-icon-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.2);
        }

        .evidence-meta {
          flex: 1;
        }

        .evidence-id {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .evidence-date {
          display: block;
          font-size: 13px;
          color: #a0a0ff;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .evidence-details {
          padding: 20px;
        }

        .detail-row {
          margin-bottom: 16px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          display: block;
          font-size: 12px;
          color: #a0a0ff;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .detail-value {
          display: block;
          font-size: 14px;
          color: #ffffff;
          line-height: 1.5;
        }

        .detail-value.filename {
          font-family: 'Monaco', 'Consolas', monospace;
          font-weight: 500;
          word-break: break-all;
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .expand-note-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .expand-note-btn:hover {
          background: rgba(41, 196, 255, 0.1);
        }

        .note-content {
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .note-content.collapsed {
          max-height: 60px;
        }

        .note-content.expanded {
          max-height: 500px;
        }

        .detail-value.note {
          font-size: 13px;
          color: #a0a0ff;
          line-height: 1.6;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #29c4ff;
          margin-top: 4px;
          white-space: pre-wrap;
        }

        .evidence-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .view-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #29c4ff 0%, #8400ff 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(41, 196, 255, 0.3);
        }

        .upload-status {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(41, 196, 255, 0.3);
        }

        .evidence-footer {
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

        @media (max-width: 1024px) {
          .evidence-container {
            padding: 0 16px 32px;
          }
          
          .evidence-card {
            padding: 24px;
          }
          
          .evidence-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .evidence-container {
            padding: 0 12px 24px;
          }
          
          .evidence-card {
            padding: 20px;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .evidence-card {
            padding: 16px;
          }
          
          h2 {
            font-size: 20px;
          }
          
          .header-description {
            font-size: 13px;
          }
          
          .evidence-grid {
            gap: 16px;
          }
          
          .evidence-item-header,
          .evidence-details {
            padding: 16px;
          }
          
          .footer-info {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}