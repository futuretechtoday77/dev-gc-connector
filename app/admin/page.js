'use client';

import { useState, useEffect } from 'react';

// Simple password protection
const ADMIN_PASSWORD = 'K9mP2vL8nQ5xW4rT7jH3b'; // Secure 21-char password

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [popups, setPopups] = useState({});
  const [selectedPopup, setSelectedPopup] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [newPopup, setNewPopup] = useState({
    popupId: '',
    name: '',
    tagId: '',
    headline: '',
    subheadline: '',
    bodyCopy: '',
    buttonText: 'Get Instant Access',
    variant: 'green',
    layout: 'side-by-side',
    imageUrl: '',
    fields: ['email']
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPopups();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            GC Connector Admin
          </h1>
          <p style={{ color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
            Enter password to continue
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}
            />
            {passwordError && (
              <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const fetchPopups = async () => {
    try {
      const response = await fetch('/api/popups/list');
      const data = await response.json();
      if (data.popups) {
        setPopups(data.popups);
      }
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = (popupId) => {
    const code = `<!-- GC Modal Popup -->
<script src="https://dev-gc-connector.vercel.app/gc-modal.js"></script>
<script>
  GCModal.init({
    apiUrl: 'https://dev-gc-connector.vercel.app',
    popupId: '${popupId}'
  });
</script>`;
    setEmbedCode(code);
    setSelectedPopup(popupId);
  };

  const handleCreatePopup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/popups/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: newPopup.popupId,
          config: {
            name: newPopup.name,
            tagId: newPopup.tagId,
            design: {
              variant: newPopup.variant,
              layout: newPopup.layout,
              headline: newPopup.headline,
              subheadline: newPopup.subheadline,
              bodyCopy: newPopup.bodyCopy,
              buttonText: newPopup.buttonText,
              image: {
                url: newPopup.imageUrl,
                position: 'left-side',
                scale: 100
              }
            },
            fields: newPopup.fields
          }
        })
      });

      if (response.ok) {
        alert('Popup created successfully!');
        fetchPopups();
        setNewPopup({
          popupId: '',
          name: '',
          tagId: '',
          headline: '',
          subheadline: '',
          bodyCopy: '',
          buttonText: 'Get Instant Access',
          variant: 'green',
          layout: 'side-by-side',
          imageUrl: '',
          fields: ['email']
        });
      } else {
        alert('Failed to create popup');
      }
    } catch (error) {
      console.error('Error creating popup:', error);
      alert('Error creating popup');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>GC Connector Admin</h1>
      
      {/* Create New Popup */}
      <div style={{ marginBottom: '3rem', padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create New Popup</h2>
        <form onSubmit={handleCreatePopup} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Popup ID (e.g., my-popup)"
              value={newPopup.popupId}
              onChange={(e) => setNewPopup({...newPopup, popupId: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
            <input
              type="text"
              placeholder="Popup Name"
              value={newPopup.name}
              onChange={(e) => setNewPopup({...newPopup, name: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <input
            type="text"
            placeholder="Tag ID (from Global Control)"
            value={newPopup.tagId}
            onChange={(e) => setNewPopup({...newPopup, tagId: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="text"
            placeholder="Headline"
            value={newPopup.headline}
            onChange={(e) => setNewPopup({...newPopup, headline: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="text"
            placeholder="Subheadline"
            value={newPopup.subheadline}
            onChange={(e) => setNewPopup({...newPopup, subheadline: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Body Copy"
            value={newPopup.bodyCopy}
            onChange={(e) => setNewPopup({...newPopup, bodyCopy: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Button Text"
              value={newPopup.buttonText}
              onChange={(e) => setNewPopup({...newPopup, buttonText: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select
              value={newPopup.variant}
              onChange={(e) => setNewPopup({...newPopup, variant: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="teal">Teal</option>
            </select>
            <select
              value={newPopup.layout}
              onChange={(e) => setNewPopup({...newPopup, layout: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="side-by-side">Side by Side</option>
              <option value="centered">Centered</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={newPopup.imageUrl}
            onChange={(e) => setNewPopup({...newPopup, imageUrl: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Create Popup
          </button>
        </form>
      </div>

      {/* Existing Popups */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Existing Popups ({Object.keys(popups).length})</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(popups).map(([id, popup]) => (
            <div
              key={id}
              style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{popup.name || id}</strong>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                  ID: {id} | Tag: {popup.tagId || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => generateEmbedCode(id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Get Embed Code
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Embed Code Modal */}
      {embedCode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000
          }}
          onClick={() => setEmbedCode('')}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>Embed Code for "{selectedPopup}"</h3>
            <textarea
              value={embedCode}
              readOnly
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
                alert('Copied to clipboard!');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => setEmbedCode('')}
              style={{
                padding: '0.5rem 1rem',
                background: '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
