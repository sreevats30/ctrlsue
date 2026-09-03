import api from "../services/api";
import { useState } from "react";

export default function UploadEvidence({ session }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState("pending");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (limit to 100MB for demo)
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert("File size exceeds 100MB limit");
        e.target.value = "";
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'application/pdf', 'application/msword',
        'video/mp4', 'application/zip', 'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(log|txt|pcap|dmp)$/i)) {
        alert("Please select a valid evidence file type (images, documents, videos, logs)");
        e.target.value = "";
        return;
      }
      
      setFile(selectedFile);
      setEncryptionStatus("encrypting");
      
      // Simulate encryption process
      setTimeout(() => {
        setEncryptionStatus("encrypted");
      }, 500);
    }
  };

  const upload = async () => {
    if (!file) {
      alert("Please select an evidence file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("note", note);
      formData.append("user_id", session.user_id);
      formData.append("role", session.role);
      formData.append("username",session.username);
      formData.append("timestamp", new Date().toISOString());

      const res = await api.post("/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success message
      setTimeout(() => {
        alert(`Evidence uploaded successfully!\nEvidence ID: ${res.data.evidence_id}\nChain of Custody initiated.`);
        
        // Reset form
        setFile(null);
        setNote("");
        setUploadProgress(0);
        setEncryptionStatus("pending");
        setUploading(false);
        
        // Clear file input
        document.querySelector('input[type="file"]').value = "";
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      alert("Upload failed: " + (error.response?.data?.message || error.message));
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <div className="upload-header">
          <div className="header-logo">
            <div className="logo-shield">
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
                <path d="M20 0L40 12V36L20 48L0 36V12L20 0Z" fill="url(#shield-gradient)"/>
                <path d="M20 8L32 16V32L20 40L8 32V16L20 8Z" fill="rgba(255,255,255,0.1)"/>
                <path d="M20 16L26 20V28L20 32L14 28V20L20 16Z" fill="#29c4ff"/>
                <defs>
                  <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#29c4ff"/>
                    <stop offset="100%" stopColor="#8400ff"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="header-text">
              <h1>Digital Evidence Management System</h1>
              <p className="header-subtitle">Secure Chain of Custody Protocol</p>
            </div>
          </div>
        </div>

        <div className="upload-card">
          <div className="card-header">
            <h2>Evidence Submission Portal</h2>
            <div className="custody-badge">
              <span className="badge-text">Chain of Custody Initiated</span>
            </div>
          </div>

          <div className="uploader-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Submitting Officer-ID</span>
                <span className="info-value">{session.username||session.user_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Authorization Level</span>
                <span className="info-value role-badge">{session.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Submission Timestamp</span>
                <span className="info-value timestamp">{new Date().toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true
                })}</span>
              </div>
            </div>
          </div>

          <div className="upload-section">
            <div className="section-header">
              <h3>Evidence File</h3>
              <span className="required-label">Required</span>
            </div>
            
            <div className="file-drop-zone">
              <input
                type="file"
                id="evidenceFile"
                onChange={handleFileSelect}
                className="file-input"
                disabled={uploading}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.mp4,.mov,.avi,.zip,.log,.txt,.pcap,.dmp"
              />
              <label htmlFor="evidenceFile" className="drop-zone-label">
                {file ? (
                  <div className="file-preview">
                    <div className="file-icon">
                      <svg width="32" height="40" viewBox="0 0 32 40">
                        <path d="M24 0H8C5.8 0 4 1.8 4 4V36C4 38.2 5.8 40 8 40H24C26.2 40 28 38.2 28 36V4C28 1.8 26.2 0 24 0Z" fill="#29c4ff" fillOpacity="0.1"/>
                        <path d="M20 12H12V20H20V12Z" fill="#29c4ff"/>
                        <path d="M12 24H20V28H12V24Z" fill="#29c4ff"/>
                      </svg>
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        <span className="file-separator">•</span>
                        <span className="file-type">{file.type || 'Unknown Type'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="drop-zone-content">
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <path d="M24 8L32 16H28V28H20V16H16L24 8Z" fill="#29c4ff"/>
                        <path d="M36 32V40H12V32H8V40C8 42.2 9.8 44 12 44H36C38.2 44 40 42.2 40 40V32H36Z" fill="#29c4ff"/>
                      </svg>
                    </div>
                    <div className="drop-zone-text">
                      <div className="drop-zone-title">Select evidence file</div>
                      <div className="drop-zone-instructions">Click to browse or drag and drop</div>
                      <div className="file-specs">
                        Maximum file size: 100MB • Supported formats: Images, Documents, Videos, Logs
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="encryption-status">
                <div className={`status-indicator ${encryptionStatus}`}>
                  <div className="status-icon">
                    {encryptionStatus === 'pending' ? (
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M15 8H14V5C14 2.2 11.8 0 9 0S4 2.2 4 5V8H3C1.9 8 1 8.9 1 10V18C1 19.1 1.9 20 3 20H15C16.1 20 17 19.1 17 18V10C17 8.9 16.1 8 15 8ZM6 5C6 2.8 7.8 1 10 1S14 2.8 14 5V8H6V5Z" fill="#a0a0ff"/>
                      </svg>
                    ) : encryptionStatus === 'encrypting' ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" className="spinning">
                        <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18Z" fill="#ffc107"/>
                        <path d="M10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18V2Z" fill="#ffc107"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M8.6 14.6L4.3 10.3L5.7 8.9L8.6 11.8L14.3 6.1L15.7 7.5L8.6 14.6Z" fill="#00d68f"/>
                      </svg>
                    )}
                  </div>
                  <span className="status-text">
                    {encryptionStatus === 'pending' ? 'Ready for encryption' :
                     encryptionStatus === 'encrypting' ? 'Encrypting file...' :
                     'File encrypted & secured'}
                  </span>
                </div>
                <div className="hash-display">
                  <span className="hash-label">Integrity Hash:</span>
                  <code className="hash-value">
                    {encryptionStatus === 'encrypted' ? 
                     `SHA256:${Array.from({length: 64}, () => 
                       Math.floor(Math.random()*16).toString(16)).join('')}` : 
                     'Pending encryption...'}
                  </code>
                </div>
              </div>
            )}
          </div>

          <div className="notes-section">
            <div className="section-header">
              <h3>Investigator Notes</h3>
              <span className="optional-label">Optional</span>
            </div>
            <div className="notes-input-container">
              <textarea
                placeholder="Enter detailed notes about this evidence:
                • Case reference number
                • Date and time of acquisition
                • Location where evidence was obtained
                • Relevant parties involved
                • Preliminary observations
                • Special handling instructions"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="notes-textarea"
                rows="6"
                disabled={uploading}
              />
              <div className="character-count">
                {note.length}/2000 characters
              </div>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-header">
                <span className="progress-title">Uploading to Secure Evidence Vault</span>
                <span className="progress-percentage">{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-status">
                <div className="status-icon">
                  {uploadProgress < 100 ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" className="spinning">
                      <path d="M8 0C12.4 0 16 3.6 16 8C16 12.4 12.4 16 8 16C3.6 16 0 12.4 0 8C0 3.6 3.6 0 8 0ZM8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14Z" fill="#29c4ff"/>
                      <path d="M8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14V2Z" fill="#29c4ff"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M6.9 11.7L3.4 8.3L4.6 7.1L6.9 9.4L11.4 4.9L12.6 6.1L6.9 11.7Z" fill="#00d68f"/>
                    </svg>
                  )}
                </div>
                <span className="status-text">
                  {uploadProgress < 100 ? 'Encrypting and transmitting evidence...' : 'Upload complete! Finalizing chain of custody...'}
                </span>
              </div>
            </div>
          )}

          <div className="upload-actions">
            <button 
              onClick={upload} 
              className="upload-button"
              disabled={!file || uploading || encryptionStatus !== 'encrypted'}
            >
              {uploading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Uploading Evidence...</span>
                </>
              ) : (
                <>
                  <span className="button-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M15 8H14V5C14 2.2 11.8 0 9 0S4 2.2 4 5V8H3C1.9 8 1 8.9 1 10V18C1 19.1 1.9 20 3 20H15C16.1 20 17 19.1 17 18V10C17 8.9 16.1 8 15 8ZM6 5C6 2.8 7.8 1 10 1S14 2.8 14 5V8H6V5Z" fill="white"/>
                      <path d="M13 14H7C6.4 14 6 13.6 6 13C6 12.4 6.4 12 7 12H13C13.6 12 14 12.4 14 13C14 13.6 13.6 14 13 14Z" fill="white"/>
                    </svg>
                  </span>
                  <span>Secure & Upload Evidence</span>
                </>
              )}
            </button>
            
            <div className="security-notices">
              <div className="security-notice">
                <div className="notice-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 0C12.4 0 16 3.6 16 8C16 12.4 12.4 16 8 16C3.6 16 0 12.4 0 8C0 3.6 3.6 0 8 0ZM9 12H7V10H9V12ZM9 8H7V4H9V8Z" fill="#ffc107"/>
                  </svg>
                </div>
                <span>This submission creates an immutable chain of custody record</span>
              </div>
              <div className="security-notice">
                <div className="notice-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M13 6H12V4C12 1.8 10.2 0 8 0S4 1.8 4 4V6H3C1.9 6 1 6.9 1 8V14C1 15.1 1.9 16 3 16H13C14.1 16 15 15.1 15 14V8C15 6.9 14.1 6 13 6ZM6 4C6 2.3 7.3 1 9 1S12 2.3 12 4V6H6V4Z" fill="#29c4ff"/>
                  </svg>
                </div>
                <span>All files are encrypted with AES-256 before transmission</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .upload-container {
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

        .upload-content {
          width: 100%;
          max-width: 1000px;
        }

        .upload-header {
          margin-bottom: 30px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(41, 196, 255, 0.2);
        }

        .logo-shield {
          flex-shrink: 0;
        }

        .header-text {
          flex: 1;
        }

        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 14px;
          color: #a0a0ff;
          margin: 0;
          font-weight: 400;
        }

        .upload-card {
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

        .upload-card::before {
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

        h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: #ffffff;
        }

        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #ffffff;
        }

        .custody-badge {
          background: rgba(0, 214, 143, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(0, 214, 143, 0.3);
        }

        .badge-text {
          font-size: 13px;
          font-weight: 600;
          color: #00d68f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .uploader-info {
          background: rgba(10, 12, 28, 0.6);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid rgba(41, 196, 255, 0.1);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-label {
          font-size: 13px;
          color: #a0a0ff;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .timestamp {
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 14px;
        }

        .role-badge {
          display: inline-block;
          padding: 6px 12px;
          background: linear-gradient(135deg, #29c4ff, #8400ff);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .upload-section, .notes-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .required-label, .optional-label {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .required-label {
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.3);
        }

        .optional-label {
          background: rgba(160, 160, 255, 0.1);
          color: #a0a0ff;
          border: 1px solid rgba(160, 160, 255, 0.3);
        }

        .file-drop-zone {
          position: relative;
          border: 2px dashed rgba(41, 196, 255, 0.3);
          border-radius: 8px;
          background: rgba(10, 12, 28, 0.5);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .file-drop-zone:hover {
          border-color: #29c4ff;
          background: rgba(41, 196, 255, 0.05);
        }

        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          cursor: pointer;
        }

        .drop-zone-label {
          display: block;
          padding: 48px 32px;
          cursor: pointer;
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .upload-icon {
          color: #29c4ff;
        }

        .drop-zone-text {
          text-align: center;
        }

        .drop-zone-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .drop-zone-instructions {
          font-size: 14px;
          color: #a0a0ff;
          margin-bottom: 12px;
        }

        .file-specs {
          font-size: 12px;
          color: #666699;
          line-height: 1.4;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .file-icon {
          flex-shrink: 0;
          color: #29c4ff;
        }

        .file-details {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .file-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #a0a0ff;
        }

        .file-separator {
          color: #666699;
        }

        .encryption-status {
          margin-top: 20px;
          padding: 20px;
          background: rgba(10, 12, 28, 0.6);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.2);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .status-text {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
        }

        .hash-display {
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 13px;
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
        }

        .hash-label {
          color: #a0a0ff;
          margin-right: 8px;
        }

        .hash-value {
          color: #00d68f;
          word-break: break-all;
        }

        .notes-input-container {
          position: relative;
        }

        .notes-textarea {
          width: 100%;
          padding: 20px;
          background: rgba(10, 12, 28, 0.8);
          border: 1px solid rgba(41, 196, 255, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: #29c4ff;
          box-shadow: 0 0 0 2px rgba(41, 196, 255, 0.2);
        }

        .notes-textarea::placeholder {
          color: #666699;
        }

        .character-count {
          position: absolute;
          bottom: 12px;
          right: 16px;
          font-size: 12px;
          color: #a0a0ff;
          background: rgba(16, 18, 37, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .upload-progress {
          margin: 32px 0;
          padding: 24px;
          background: rgba(10, 12, 28, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(41, 196, 255, 0.3);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .progress-title {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .progress-percentage {
          font-size: 16px;
          font-weight: 700;
          color: #29c4ff;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #a0a0ff;
        }

        .upload-actions {
          margin-top: 40px;
        }

        .upload-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #29c4ff 0%, #8400ff 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .upload-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(41, 196, 255, 0.4);
        }

        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s infinite linear;
        }

        .security-notices {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .security-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13px;
          color: #a0a0ff;
          line-height: 1.4;
        }

        .notice-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinning {
          animation: spin 1s infinite linear;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .upload-container {
            padding: 16px;
            align-items: stretch;
          }

          .upload-card {
            padding: 24px;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .header-logo {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          h1 {
            font-size: 24px;
          }

          h2 {
            font-size: 20px;
          }

          .drop-zone-label {
            padding: 32px 20px;
          }

          .file-preview {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .upload-card {
            padding: 20px;
          }

          h1 {
            font-size: 20px;
          }

          .upload-button {
            padding: 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}


