import api from "../services/api";
import { useEffect, useState } from "react";

export default function AuditLogs({ session }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [session.role]);

  useEffect(() => {
    let filtered = logs;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(log =>
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.evidence_id && log.evidence_id.toString().includes(searchTerm))
      );
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        const diffHours = (now - logDate) / (1000 * 60 * 60);
        
        switch (timeFilter) {
          case "last24h": return diffHours <= 24;
          case "last7d": return diffHours <= 24 * 7;
          case "last30d": return diffHours <= 24 * 30;
          default: return true;
        }
      });
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, timeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit-logs", {
        params: { role: session.role }
      });
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      alert("Failed to load audit logs. You may not have proper permissions.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const actionMap = {
      'upload': 'upload',
      'verify': 'verify',
      'view': 'view',
      'login': 'login',
      'logout': 'logout',
      'create': 'create',
      'update': 'update',
      'delete': 'delete'
    };

    const actionType = action.toLowerCase();
    for (const [key, value] of Object.entries(actionMap)) {
      if (actionType.includes(key)) {
        return value;
      }
    }
    return 'default';
  };

  const renderActionIcon = (action) => {
    const iconType = getActionIcon(action);
    
    const iconMap = {
      upload: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3L11 6H9V10H7V6H5L8 3Z" fill="#29c4ff"/>
          <path d="M13 11V13H3V11H1V13C1 14.1 1.9 15 3 15H13C14.1 15 15 14.1 15 13V11H13Z" fill="#29c4ff"/>
        </svg>
      ),
      verify: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM6.5 12L2.5 8L3.6 6.9L6.5 9.8L12.4 3.9L13.5 5L6.5 12Z" fill="#00d68f"/>
        </svg>
      ),
      view: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3C4.7 3 2 6 2 8C2 10 4.7 13 8 13C11.3 13 14 10 14 8C14 6 11.3 3 8 3ZM8 11C6.3 11 5 9.7 5 8C5 6.3 6.3 5 8 5C9.7 5 11 6.3 11 8C11 9.7 9.7 11 8 11Z" fill="#29c4ff"/>
          <path d="M8 6C7.4 6 7 6.4 7 7C7 7.6 7.4 8 8 8C8.6 8 9 7.6 9 7C9 6.4 8.6 6 8 6Z" fill="#29c4ff"/>
        </svg>
      ),
      login: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 0H3C1.9 0 1 0.9 1 2V14C1 15.1 1.9 16 3 16H6C6.6 16 7 15.6 7 15C7 14.4 6.6 14 6 14H3V2H6C6.6 2 7 1.6 7 1C7 0.4 6.6 0 6 0Z" fill="#29c4ff"/>
          <path d="M12.3 8.7L10.3 10.7C10.1 10.9 10 11.2 10 11.5C10 11.8 10.1 12.1 10.3 12.3C10.7 12.7 11.3 12.7 11.7 12.3L15.3 8.7C15.7 8.3 15.7 7.7 15.3 7.3L11.7 3.7C11.3 3.3 10.7 3.3 10.3 3.7C9.9 4.1 9.9 4.7 10.3 5.1L12.3 7.1H5C4.4 7.1 4 7.5 4 8.1C4 8.7 4.4 9.1 5 9.1H12.3L10.3 11.1L12.3 8.7Z" fill="#29c4ff"/>
        </svg>
      ),
      logout: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 0H3C1.9 0 1 0.9 1 2V14C1 15.1 1.9 16 3 16H6C6.6 16 7 15.6 7 15C7 14.4 6.6 14 6 14H3V2H6C6.6 2 7 1.6 7 1C7 0.4 6.6 0 6 0Z" fill="#29c4ff"/>
          <path d="M12.3 11.3L15.3 8.3C15.7 7.9 15.7 7.3 15.3 6.9L12.3 3.9C11.9 3.5 11.3 3.5 10.9 3.9C10.5 4.3 10.5 4.9 10.9 5.3L12.3 6.7H5C4.4 6.7 4 7.1 4 7.7C4 8.3 4.4 8.7 5 8.7H12.3L10.9 10.1C10.5 10.5 10.5 11.1 10.9 11.5C11.1 11.7 11.4 11.8 11.7 11.8C12 11.8 12.3 11.7 12.5 11.5L12.3 11.3Z" fill="#29c4ff"/>
        </svg>
      ),
      default: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="#a0a0ff"/>
          <path d="M9 12H7V10H9V12ZM9 8H7V4H9V8Z" fill="#a0a0ff"/>
        </svg>
      )
    };

    return iconMap[iconType] || iconMap.default;
  };

  const getResultColor = (result) => {
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('success') || lowerResult.includes('verified') || lowerResult.includes('passed')) {
      return '#00d68f';
    } else if (lowerResult.includes('failed') || lowerResult.includes('error') || lowerResult.includes('denied')) {
      return '#ff4757';
    } else if (lowerResult.includes('pending') || lowerResult.includes('processing')) {
      return '#ffc107';
    }
    return '#a0a0ff';
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'admin': '#ff4757',
      'forensic': '#29c4ff',
      'investigator': '#00d68f',
      'supervisor': '#ffc107',
      'auditor': '#8400ff'
    };
    return roleColors[role.toLowerCase()] || '#a0a0ff';
  };

  return (
    <div className="audit-container">
      <div className="audit-content">
        <div className="audit-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Audit Trail & Chain of Custody</h1>
              <p className="header-subtitle">Complete Activity Log & System Integrity Monitoring</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{logs.length}</span>
                <span className="stat-label">Total Logs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{new Set(logs.map(log => log.username)).size}</span>
                <span className="stat-label">Unique Users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="audit-card">
          <div className="card-header">
            <div className="header-section">
              <h2>System Audit Logs</h2>
              <p className="header-description">Real-time monitoring of all system activities and evidence access</p>
            </div>
            <div className="header-controls">
              <div className="search-container">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#a0a0ff" strokeWidth="1.5"/>
                  <path d="M15 15L11.5 11.5" stroke="#a0a0ff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search logs by user, action, or evidence ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-container">
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="time-filter"
                >
                  <option value="all">All Time</option>
                  <option value="last24h">Last 24 Hours</option>
                  <option value="last7d">Last 7 Days</option>
                  <option value="last30d">Last 30 Days</option>
                </select>
              </div>
              <button className="refresh-button" onClick={fetchLogs} disabled={loading}>
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
              <p className="loading-text">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M48 16H44V12C44 9.8 42.2 8 40 8H24C21.8 8 20 9.8 20 12V16H16C13.8 16 12 17.8 12 20V56C12 58.2 13.8 60 16 60H48C50.2 60 52 58.2 52 56V20C52 17.8 50.2 16 48 16ZM24 12H40V16H24V12ZM48 56H16V20H48V56Z" stroke="#29c4ff" strokeWidth="2"/>
                  <path d="M32 24C30.9 24 30 24.9 30 26V46C30 47.1 30.9 48 32 48C33.1 48 34 47.1 34 46V26C34 24.9 33.1 24 32 24Z" fill="#29c4ff"/>
                  <path d="M26 32C26 30.9 26.9 30 28 30H36C37.1 30 38 30.9 38 32C38 33.1 37.1 34 36 34H28C26.9 34 26 33.1 26 32Z" fill="#29c4ff"/>
                </svg>
              </div>
              <h3>No Audit Logs Found</h3>
              <p className="empty-description">
                {searchTerm || timeFilter !== "all" 
                  ? 'No logs match your search criteria.' 
                  : 'No audit activity has been recorded yet.'}
              </p>
              {(searchTerm || timeFilter !== "all") && (
                <button 
                  className="clear-filters" 
                  onClick={() => {
                    setSearchTerm("");
                    setTimeFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="audit-table">
              <div className="table-header">
                <div className="table-row header-row">
                  <div className="table-cell">Timestamp</div>
                  <div className="table-cell">User & Role</div>
                  <div className="table-cell">Action</div>
                  <div className="table-cell">Evidence ID</div>
                  <div className="table-cell">Result</div>
                </div>
              </div>
              
              <div className="table-body">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="table-row log-row">
                    <div className="table-cell timestamp-cell">
                      <span className="timestamp">{formatDate(log.timestamp)}</span>
                    </div>
                    
                    <div className="table-cell user-cell">
                      <div className="user-info">
                        <div className="user-name">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4" r="3" stroke={getRoleColor(log.role)} strokeWidth="1.5"/>
                            <path d="M1 13C1 10.2 3.2 8 6 8H8C10.8 8 13 10.2 13 13" stroke={getRoleColor(log.role)} strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span>{log.username}</span>
                        </div>
                        <div className="user-role" style={{ color: getRoleColor(log.role) }}>
                          {log.role.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell action-cell">
                      <div className="action-info">
                        <div className="action-icon">
                          {renderActionIcon(log.action)}
                        </div>
                        <span className="action-text">{log.action}</span>
                      </div>
                    </div>
                    
                    <div className="table-cell evidence-cell">
                      <div className="evidence-info">
                        {log.evidence_id ? (
                          <span className="evidence-id">#{log.evidence_id}</span>
                        ) : (
                          <span className="no-evidence">—</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="table-cell result-cell">
                      <div 
                        className="result-badge"
                        style={{ 
                          backgroundColor: `${getResultColor(log.result)}20`,
                          borderColor: getResultColor(log.result),
                          color: getResultColor(log.result)
                        }}
                      >
                        {log.result}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="audit-footer">
            <div className="footer-info">
              <div className="info-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 0C3.1 0 0 3.1 0 7C0 10.9 3.1 14 7 14C10.9 14 14 10.9 14 7C14 3.1 10.9 0 7 0ZM7 12.6C3.8 12.6 1.4 10.2 1.4 7C1.4 3.8 3.8 1.4 7 1.4C10.2 1.4 12.6 3.8 12.6 7C12.6 10.2 10.2 12.6 7 12.6Z" fill="#29c4ff"/>
                  <path d="M9.8 6.3H7.7V3.5C7.7 3.1 7.4 2.8 7 2.8C6.6 2.8 6.3 3.1 6.3 3.5V7C6.3 7.4 6.6 7.7 7 7.7H9.8C10.2 7.7 10.5 7.4 10.5 7C10.5 6.6 10.2 6.3 9.8 6.3Z" fill="#29c4ff"/>
                </svg>
                <span>Last Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="info-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12.6 6.3H11.2V4.9C11.2 2.2 9 0 6.3 0S1.4 2.2 1.4 4.9V6.3H0C-0.4 6.3 -0.7 6.6 -0.7 7V12.6C-0.7 13 -0.4 13.3 0 13.3H12.6C13 13.3 13.3 13 13.3 12.6V7C13.3 6.6 13 6.3 12.6 6.3ZM2.8 4.9C2.8 3.2 4.2 1.8 5.9 1.8S9 3.2 9 4.9V6.3H2.8V4.9Z" fill="#29c4ff"/>
                </svg>
                <span>Immutable Audit Trail</span>
              </div>
              <div className="info-item">
                <span className="log-count">{filteredLogs.length} of {logs.length} logs shown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .audit-container {
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

        .audit-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .audit-header {
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

        .audit-card {
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

        .audit-card::before {
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
          gap: 16px;
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

        .filter-container {
          position: relative;
        }

        .time-filter {
          padding: 12px 16px;
          background: rgba(10, 12, 28, 0.8);
          border: 1px solid rgba(41, 196, 255, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          appearance: none;
          padding-right: 40px;
          min-width: 140px;
        }

        .time-filter:focus {
          outline: none;
          border-color: #29c4ff;
          box-shadow: 0 0 0 2px rgba(41, 196, 255, 0.2);
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
          white-space: nowrap;
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

        .clear-filters {
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

        .clear-filters:hover {
          background: rgba(41, 196, 255, 0.2);
          transform: translateY(-1px);
        }

        .audit-table {
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
          grid-template-columns: 220px 200px 1fr 120px 150px;
          align-items: center;
        }

        .header-row {
          padding: 16px 24px;
        }

        .log-row {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(41, 196, 255, 0.1);
          transition: background-color 0.2s ease;
        }

        .log-row:hover {
          background: rgba(41, 196, 255, 0.05);
        }

        .log-row:last-child {
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

        .timestamp {
          font-size: 13px;
          color: #a0a0ff;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .user-role {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(160, 160, 255, 0.1);
          align-self: flex-start;
        }

        .action-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(41, 196, 255, 0.2);
        }

        .action-text {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
        }

        .evidence-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .evidence-id {
          display: inline-block;
          background: rgba(41, 196, 255, 0.1);
          color: #29c4ff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        .no-evidence {
          font-size: 14px;
          color: #666699;
          font-style: italic;
        }

        .result-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          text-transform: capitalize;
        }

        .audit-footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-info {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #a0a0ff;
        }

        .log-count {
          font-size: 13px;
          font-weight: 500;
          color: #a0a0ff;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 200px 180px 1fr 100px 120px;
          }
        }

        @media (max-width: 1024px) {
          .audit-card {
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
          .audit-content {
            padding: 16px;
          }
          
          .audit-card {
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
            gap: 16px;
            padding: 20px;
          }
          
          .header-row {
            display: none;
          }
          
          .table-cell {
            padding: 0;
          }
          
          .action-info, .user-info, .evidence-info {
            justify-content: flex-start;
          }
          
          .header-stats {
            flex-direction: column;
          }
          
          .stat-item {
            min-width: 100px;
          }
        }

        @media (max-width: 480px) {
          .audit-card {
            padding: 20px;
          }
          
          h1 {
            font-size: 22px;
          }
          
          .footer-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
