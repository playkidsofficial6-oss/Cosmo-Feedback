import { useState, useRef, useEffect } from 'react';

interface Props {
  reviewUrl: string;
  onUrlChange: (url: string) => void;
  patientName: string;
}


export function QRCodeGenerator({ reviewUrl, onUrlChange, patientName }: Props) {
  const [fullscreen,   setFullscreen]   = useState(false);
  const [editingUrl,   setEditingUrl]   = useState(false);
  const [qrType,       setQrType]       = useState<'google'|'instagram'>('google');
  const [instaUrl,     setInstaUrl]     = useState('https://www.instagram.com/cosmohomeskincare');
  
  const activeUrl = qrType === 'google' ? reviewUrl : instaUrl;
  const [tempUrl,      setTempUrl]      = useState(activeUrl);
  const [copied,       setCopied]       = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeUrl)}&bgcolor=ffffff&color=111111&margin=0`;

  // Update tempUrl when switching types
  useEffect(() => {
    setTempUrl(activeUrl);
  }, [activeUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleSaveUrl = () => {
    if (qrType === 'google') {
      onUrlChange(tempUrl);
    } else {
      setInstaUrl(tempUrl);
    }
    setEditingUrl(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `cosmo-review-qr.png`;
    link.click();
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const title = qrType === 'google' ? 'Google Review QR – Cosmo Homes' : 'Instagram QR – Cosmo Homes';
    const desc = qrType === 'google' ? 'Scan to leave a Google Review' : 'Scan to follow us on Instagram';
    w.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Georgia, serif; text-align: center; padding: 3rem; }
        img  { width: 260px; height: 260px; margin: 2rem auto; display: block; border: 1px solid #eee; padding: 12px; }
        h2   { font-size: 1.8rem; }
        p    { color: #888; font-size: 0.9rem; }
      </style></head>
      <body>
        <h2>Cosmo Homes</h2>
        <p>${desc}</p>
        <img src="${qrSrc}" />
        <p style="margin-top:1rem; font-size:0.75rem; color:#bbb;">${activeUrl}</p>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  };

  return (
    <>
      <div className="qr-panel">
        <div className="qr-head">
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'var(--surface)', padding: '4px', borderRadius: '10px' }}>
            <button
              style={{ flex: 1, padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, border: 'none', background: qrType === 'google' ? 'var(--surface-2)' : 'transparent', color: qrType === 'google' ? 'var(--ink)' : 'var(--ink-3)', boxShadow: qrType === 'google' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setQrType('google')}
            >
              Google Review
            </button>
            <button
              style={{ flex: 1, padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, border: 'none', background: qrType === 'instagram' ? 'var(--surface-2)' : 'transparent', color: qrType === 'instagram' ? 'var(--ink)' : 'var(--ink-3)', boxShadow: qrType === 'instagram' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setQrType('instagram')}
            >
              Instagram
            </button>
          </div>
          <div className="qr-title">{qrType === 'google' ? 'Google Review QR' : 'Instagram QR'}</div>
          <div className="qr-sub">Show patient on iPad — they scan with their phone</div>
        </div>

        <div className="qr-stage">
          <div className="qr-frame" id="qr-display" style={{ cursor: 'pointer' }} onClick={() => setFullscreen(true)}>
            <img
              ref={imgRef}
              src={qrSrc}
              alt="Google Review QR Code"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          <p className="qr-prompt">
            {qrType === 'google'
              ? `"${patientName}, could you please scan this and leave us a quick review?"`
              : `"${patientName}, could you please scan this and follow us on Instagram?"`}
          </p>
        </div>

        <div className="qr-actions">
          <button id="qr-fullscreen" className="qr-btn" onClick={() => setFullscreen(true)}>
            ⛶ Fullscreen
          </button>
          <button id="qr-print" className="qr-btn" onClick={handlePrint}>
            ⎙ Print
          </button>
          <button id="qr-download" className="qr-btn" onClick={handleDownload}>
            ↓ Download
          </button>
          <button id="qr-edit-url" className="qr-btn" onClick={() => setEditingUrl(!editingUrl)}>
            ✎ Edit URL
          </button>
        </div>

        {editingUrl && (
          <div style={{ margin: '10px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              id="review-url-input"
              className="field-input"
              value={tempUrl}
              onChange={e => setTempUrl(e.target.value)}
              placeholder={qrType === 'google' ? "Google Review URL" : "Instagram URL"}
              style={{ fontSize: 12 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-save" style={{ flex: 1, padding: '8px' }} onClick={handleSaveUrl}>Save</button>
              <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setEditingUrl(false)}>✕</button>
            </div>
          </div>
        )}

        <div className="qr-link-row" style={{ marginTop: editingUrl ? 10 : 0 }}>
          <span className="qr-link-text">{activeUrl}</span>
          <button className="qr-copy" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <button className="fullscreen-close" onClick={() => setFullscreen(false)}>✕</button>
          <div className="fullscreen-box" onClick={e => e.stopPropagation()}>
            <h2>Cosmo Homes</h2>
            <p>{qrType === 'google' ? 'Scan to leave a Google Review' : 'Scan to follow us on Instagram'}</p>
            <div className="fullscreen-qr">
              <img src={qrSrc} alt="QR" style={{ width: '100%', height: '100%' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', wordBreak: 'break-all' }}>{activeUrl}</p>
          </div>
        </div>
      )}
    </>
  );
}
