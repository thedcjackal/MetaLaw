import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, Download, FileText, ChevronRight, Languages, AlertCircle,
  CheckCircle2, RotateCcw, Menu, X, Key, FileEdit, Info, Copy, RefreshCw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

function App() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('GREEK');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('gemini_selected_model') || 'gemini-3.1-pro-preview');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  const FUNNY_MESSAGES = [
    "Teaching Gemini how to read Greek...",
    "Looking for a lawyer that actually knows english...",
    "Translating 'Apostille' for the 100th time...",
    "Polishing the document (not really)...",
    "Ensuring 1:1 Page Fidelity...",
    "Arguing with the judge...",
    "Consulting the archives of MetaLaw...",
    "Hardening the structural layout..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      setLoadingMessage(FUNNY_MESSAGES[0]);
      interval = setInterval(() => {
        i = (i + 1) % FUNNY_MESSAGES.length;
        setLoadingMessage(FUNNY_MESSAGES[i]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fileInputRef = useRef(null);

  // Function to load rules from server
  const loadRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rules`);
      setRules(res.data.rules);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    }
  };

  // Load rules on init
  useEffect(() => {
    loadRules();
  }, []);

  const saveApiKey = (val) => {
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) {
      alert("Please provide a file.");
      return;
    }
    const currentKey = apiKey || localStorage.getItem('gemini_api_key') || 'backend_default';

    setLoading(true);
    setResult(null);
    setPdfLoading(true);
    setPdfReady(false);

    try {
      // Step 1: Sequential Upload (Prevents Race Conditions)
      const uploadData = new FormData();
      uploadData.append('file', file);
      const uploadRes = await axios.post(`${API_BASE}/upload`, uploadData);
      const fileId = uploadRes.data.file_id;

      // Step 2: Parallel Processing
      // Pass 1: DOCX/OCR
      const formData1 = new FormData();
      formData1.append('target_language', targetLang);
      formData1.append('api_key', currentKey);
      formData1.append('translation_rules', rules);
      formData1.append('file_id', fileId);
      formData1.append('model', selectedModel);

      // Pass 2: High-Fidelity PDF
      const formData2 = new FormData();
      formData2.append('target_language', targetLang);
      formData2.append('api_key', currentKey);
      formData2.append('translation_rules', rules);
      formData2.append('file_id', fileId);
      formData2.append('model', selectedModel);

      // Launch in Parallel
      axios.post(`${API_BASE}/process`, formData1)
        .then(res => setResult(res.data))
        .catch(err => {
          console.error("Pass 1 Error:", err);
          const detail = err.response?.data?.detail || "Error in Pass 1. Check backend.";
          alert(`Pass 1 Error: ${detail}`);
        })
        .finally(() => setLoading(false));

      // Pass 2: High-Fidelity PDF (Disabled by user request)
      /*
      axios.post(`${API_BASE}/process-html`, formData2)
        .then(() => setPdfReady(true))
        .catch(err => {
          console.error("Pass 2 Error:", err);
        })
        .finally(() => setPdfLoading(false));
      */

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload file. Check backend connection.");
      setLoading(false);
      setPdfLoading(false);
    }
  };

  const downloadDocx = () => {
    if (!result?.file_id) return;
    window.open(`${API_BASE}/download/${result.file_id}`, '_blank');
  };

  const downloadPdf = () => {
    if (!result?.file_id || !pdfReady) return;
    window.open(`${API_BASE}/download-pdf/${result.file_id}`, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className={`app-container ${result ? 'results-view' : ''}`}>
      {/* Hamburger Menu Trigger */}
      <button className="menu-trigger" onClick={() => setMenuOpen(true)}>
        <Menu size={24} color="var(--text-main)" />
      </button>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="side-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Settings</h1>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="close-menu"
                >
                  <X size={24} />
                </button>
              </div>


              <div className="menu-item">
                <h2><Languages size={20} color="var(--accent-primary)" /> Intelligence Model</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  Choose the Gemini version for processing.
                </p>
                <select
                  className="input-field"
                  value={selectedModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedModel(val);
                    localStorage.setItem('gemini_selected_model', val);
                  }}
                >
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview - Ultra Reasoning)</option>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview - Super Fast)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced Default)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Legacy)</option>
                  <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Legacy Power)</option>
                </select>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="header">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="logo-container"
        >
          <svg className="logo-svg" viewBox="0 0 400 72" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#2563eb" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="-1 0" to="1 0"
                  dur="4s" repeatCount="indefinite"
                />
              </linearGradient>
            </defs>
            <text x="50%" y="62" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="62" letterSpacing="0">
              <tspan fill="url(#logoGradient)">Meta</tspan>
              <tspan fill="none" stroke="url(#logoGradient)" strokeWidth="1.8" strokeDasharray="1000" strokeDashoffset="0">Law</tspan>
            </text>
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Intelligent Document Translation
        </motion.p>
      </header>

      <main>
        <motion.section
          className={`u-card ${result ? 'hero-expanded' : ''}`}
          animate={{ maxWidth: result ? '1200px' : '800px' }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          {!result ? (
            <>
              <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,image/*,application/pdf"
                />
                <Upload size={40} strokeWidth={1} />
                {file ? (
                  <div>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{file.name}</p>
                    <p className="text-muted">Click or drag to replace</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 600 }}>Drop document to begin</p>
                    <p className="text-muted">PDF or Image &bull; AI-Powered Precision</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.5)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <motion.button
                  layout
                  className="btn-primary"
                  onClick={processFile}
                  disabled={loading || !file}
                  style={{
                    flexGrow: loading ? 1 : 0,
                    justifyContent: 'center',
                    minWidth: loading ? '100%' : '240px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden'
                  }}
                  transition={{ duration: 0.6, type: 'spring', damping: 25, stiffness: 100 }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '320px', justifyContent: 'center' }}>
                      <Loader2 size={18} className="spin" style={{ flexShrink: 0 }} />
                      <div style={{ position: 'relative', height: '1.2em', flexGrow: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={loadingMessage}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            style={{ 
                              fontSize: '0.85rem', 
                              whiteSpace: 'normal', 
                              textAlign: 'center',
                              lineHeight: '1.2',
                              display: 'block',
                              width: '100%'
                            }}
                          >
                            {loadingMessage}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <>Generate Document <ChevronRight size={18} /></>
                  )}
                </motion.button>

                <motion.div
                  animate={{
                    width: loading ? 0 : 'auto',
                    opacity: loading ? 0 : 1,
                    marginLeft: loading ? 0 : 16,
                    visibility: loading ? 'hidden' : 'visible'
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ height: '32px', width: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
                  <Languages size={18} color="var(--accent-primary)" />
                  <motion.div
                    onClick={() => setTargetLang(prev => prev === 'GREEK' ? 'ENGLISH' : 'GREEK')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Target</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {targetLang === 'GREEK' ? 'Greek' : 'English'}
                      </span>
                      <RotateCcw size={10} style={{ opacity: 0.6 }} />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="hero-results">
              <div className="hero-sidebar">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', marginBottom: '12px' }}>
                    <CheckCircle2 size={28} color="#059669" />
                  </div>
                  <h3>Analysis Ready</h3>
                  <p>Document processed successfully.</p>
                </div>

                <div className="sidebar-actions">
                  {/* PDF Rendering Disabled Temporarily 
                  <button
                    className="btn-primary"
                    onClick={downloadPdf}
                    disabled={pdfLoading || !pdfReady}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: pdfReady ? '#3b82f6' : 'var(--bg-color)',
                      color: pdfReady ? 'white' : 'var(--text-muted)',
                      border: pdfReady ? 'none' : '1px solid var(--border-color)',
                      opacity: pdfLoading ? 0.7 : 1,
                      cursor: pdfLoading ? 'wait' : (pdfReady ? 'pointer' : 'not-allowed')
                    }}
                  >
                    {pdfLoading ? (
                      <Loader2 size={18} className="spin" style={{ color: 'var(--accent-primary)' }} />
                    ) : (
                      <FileText size={18} />
                    )}
                    {pdfLoading ? ' Rendering PDF...' : (pdfReady ? ' Download .PDF' : ' PDF Processing...')}
                  </button>
                  */}

                  <button className="btn-primary" onClick={downloadDocx} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={18} /> Download .DOCX
                  </button>
                  <button
                    className="btn-primary"
                    style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxShadow: 'none', width: '100%', justifyContent: 'center' }}
                    onClick={() => setResult(null)}
                  >
                    <RotateCcw size={18} /> New Request
                  </button>
                </div>
              </div>

              <div className="hero-content">
                <div className="text-viewer">
                  <h3>
                    ORIGINAL TRANSCRIPTION
                    <button className="copy-btn" onClick={() => copyToClipboard(result.original_text)} title="Copy Original">
                      <Copy size={14} />
                    </button>
                  </h3>
                  <div className="text-content">
                    {result.original_text}
                  </div>
                </div>
                <div className="text-viewer">
                  <h3>
                    {targetLang} TRANSLATION
                    <button className="copy-btn" onClick={() => copyToClipboard(result.translated_text)} title="Copy Translation">
                      <Copy size={14} />
                    </button>
                  </h3>
                  <div className="text-content">
                    {result.translated_text}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </main>

      <footer className="footer">
        MetaLaw &bull; Layout Precision Translation Engine &bull; 2026
      </footer>
    </div>
  );
}

export default App;
