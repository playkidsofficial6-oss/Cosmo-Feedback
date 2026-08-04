import { useState, useEffect } from 'react';

interface Props {
  reviewUrl: string;
}

function SingleQRPanel({
  type,
  defaultUrl
}: {
  type: 'google' | 'instagram',
  defaultUrl: string
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeUrl, setActiveUrl] = useState(defaultUrl);

  // Sync with props if they change (mainly for google review url which might be updated from outside)
  useEffect(() => {
    if (type === 'google') {
      setActiveUrl(defaultUrl);
    }
  }, [defaultUrl, type]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeUrl)}&bgcolor=ffffff&color=111111&margin=0`;

  return (
    <>
      <div className="qr-panel">
        <div className="qr-head">
          <div className="qr-title">{type === 'google' ? 'Google Review QR' : 'Instagram QR'}</div>
          <div className="qr-sub">Show patient on iPad — they scan with their phone</div>
        </div>

        <div className="qr-stage">
          <div className="qr-frame" style={{ cursor: 'pointer' }} onClick={() => setFullscreen(true)}>
            <img
              src={qrSrc}
              alt={`${type} QR Code`}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          {/* <p className="qr-prompt">
            {type === 'google'
              ? `"${patientName}, could you please scan this and leave us a quick review?"`
              : `"${patientName}, could you please scan this and follow us on Instagram?"`}
          </p> */}
        </div>

        {/* <div className="qr-link-row" style={{ marginTop: 0 }}>
          <span className="qr-link-text">{activeUrl}</span>
          <button className="qr-copy" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div> */}
      </div>

      {fullscreen && (
        <div className="fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <button className="fullscreen-close" onClick={() => setFullscreen(false)}>✕</button>
          <div className="fullscreen-box" onClick={e => e.stopPropagation()}>
            <h2>Cosmo Home Skin Care Centre</h2>
            <p>{type === 'google' ? 'Scan to leave a Google Review' : 'Scan to follow us on Instagram'}</p>
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

export function QRCodeGenerator({ reviewUrl }: Props) {
  return (
    <div className="qr-container">
      <SingleQRPanel
        type="google"
        defaultUrl={reviewUrl}
      />
      <SingleQRPanel
        type="instagram"
        defaultUrl="https://www.instagram.com/cosmohomeskincare"
      />
    </div>
  );
}
