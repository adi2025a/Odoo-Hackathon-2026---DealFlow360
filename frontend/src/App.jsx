import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Database, Cpu, RefreshCw, CheckCircle2, XCircle, Globe, Layers } from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/health');
      setHealthData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="title">MERN Architecture Ready</h1>
            <p className="subtitle">Vite React Frontend + Express Node Backend + Mongoose MongoDB</p>
          </div>
        </div>

        <div className="grid">
          {/* Express Backend Card */}
          <div className="info-box">
            <div className="box-title">
              <Server size={18} /> Backend Server Status
            </div>
            {loading ? (
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                Checking connection...
              </span>
            ) : error ? (
              <span className="status-badge status-offline">
                <XCircle size={14} /> Disconnected (Port 5000)
              </span>
            ) : (
              <span className="status-badge status-online">
                <span className="pulse-dot"></span> Active (Port 5000)
              </span>
            )}
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {error ? 'Backend server unreachable. Run npm run dev:backend' : healthData?.message}
            </p>
          </div>

          {/* Database Status Card */}
          <div className="info-box">
            <div className="box-title">
              <Database size={18} /> MongoDB Status
            </div>
            {loading ? (
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                Connecting...
              </span>
            ) : error ? (
              <span className="status-badge status-offline">
                <XCircle size={14} /> N/A
              </span>
            ) : healthData?.database?.status === 'Connected' ? (
              <span className="status-badge status-online">
                <CheckCircle2 size={14} /> Connected
              </span>
            ) : (
              <span className="status-badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                {healthData?.database?.status || 'Disconnected'}
              </span>
            )}
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {healthData?.database?.status === 'Connected'
                ? 'Connected via Mongoose'
                : 'Ensure local MongoDB daemon is started'}
            </p>
          </div>
        </div>

        {/* Technical Overview */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="box-title" style={{ marginBottom: '0.75rem' }}>
            <Cpu size={18} /> Stack Overview
          </div>
          <div className="tech-stack">
            <span className="tech-tag">Vite 6.x</span>
            <span className="tech-tag">React 19</span>
            <span className="tech-tag">Express.js 4</span>
            <span className="tech-tag">Mongoose 8</span>
            <span className="tech-tag">Axios</span>
            <span className="tech-tag">Lucide Icons</span>
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={fetchHealthStatus} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Testing Connection...' : 'Test Backend Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
