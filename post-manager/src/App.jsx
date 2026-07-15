// src/App.jsx
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createSelector } from 'reselect';
import { PLATFORMS } from './platformRules';
import './App.css'; // Optional: keeps default Vite styling centered

export default function App() {
  // --- STATE MANAGEMENT (Exp 1.1.1 & 1.1.2) ---
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [drafts, setDrafts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- LOCAL STORAGE SIMULATION (Exp 1.1.2) ---
  // Load drafts on initial mount
  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('postDrafts')) || [];
    setDrafts(savedDrafts);
  }, []);

  // Save drafts to LocalStorage whenever the drafts array changes
  useEffect(() => {
    localStorage.setItem('postDrafts', JSON.stringify(drafts));
  }, [drafts]);

  // --- DRAFT CRUD OPERATIONS (Exp 1.1.2) ---
  const handleSaveDraft = () => {
    if (!content.trim()) return;
    const newDraft = { 
      id: uuidv4(), 
      content, 
      platform: selectedPlatform, 
      date: new Date().toLocaleString() 
    };
    setDrafts([...drafts, newDraft]);
    setContent(''); // Clear editor after saving
  };

  const handleDeleteDraft = (id) => {
    setDrafts(drafts.filter(draft => draft.id !== id));
  };

  // --- MEMOIZED SELECTORS FOR PERFORMANCE (Exp 1.1.2) ---
  const getDrafts = (state) => state.drafts;
  const getSearchQuery = (state) => state.searchQuery;

  const getFilteredDrafts = createSelector(
    [getDrafts, getSearchQuery],
    (drafts, query) => {
      console.log("Memoized Selector Running: Filtering drafts..."); 
      if (!query) return drafts;
      return drafts.filter(draft => 
        draft.content.toLowerCase().includes(query.toLowerCase())
      );
    }
  );

  const filteredDrafts = getFilteredDrafts({ drafts, searchQuery });

  // --- PLATFORM VALIDATION LOGIC (Exp 1.1.1) ---
  const currentRule = PLATFORMS[selectedPlatform];
  const charCount = content.length;
  const isOverLimit = charCount > currentRule.maxLength;
  const isCloseToLimit = charCount > currentRule.maxLength - 20;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'left' }}>
      <h1>Multi-Platform Post Composer</h1>
      
      {/* 1. Platform Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}><strong>Select Platform:</strong></label>
        <select 
          value={selectedPlatform} 
          onChange={(e) => setSelectedPlatform(e.target.value)}
          style={{ padding: '5px', fontSize: '16px' }}
        >
          {Object.entries(PLATFORMS).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      {/* 2. Text Editor */}
      <textarea
        style={{
          width: '100%',
          height: '150px',
          borderColor: isOverLimit ? 'red' : '#ccc',
          borderWidth: '2px',
          padding: '10px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Draft your post here..."
      />

      {/* 3. Real-time Validation Feedback */}
      <div style={{ 
        color: isOverLimit ? 'red' : isCloseToLimit ? '#d97706' : 'gray',
        marginTop: '8px',
        fontWeight: 'bold'
      }}>
        {charCount} / {currentRule.maxLength} characters
        {isOverLimit && <span> (Error: Exceeds {currentRule.name} limit by {charCount - currentRule.maxLength} characters!)</span>}
      </div>

      {/* 4. Save Action */}
      <button 
        onClick={handleSaveDraft} 
        disabled={isOverLimit || content.length === 0}
        style={{ 
          marginTop: '15px', 
          padding: '10px 20px', 
          backgroundColor: isOverLimit || content.length === 0 ? '#ccc' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isOverLimit || content.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        Save to Drafts
      </button>

      <hr style={{ margin: '40px 0' }} />

      {/* 5. Drafts Dashboard with Search */}
      <h2>Drafts Dashboard</h2>
      <input 
        type="text" 
        placeholder="Search your drafts..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', fontSize: '16px', boxSizing: 'border-box' }}
      />

      {filteredDrafts.length === 0 ? (
        <p style={{ color: 'gray' }}>No drafts found. Start typing above to create one!</p>
      ) : null}
      
      {/* 6. Render Filtered Drafts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredDrafts.map(draft => (
          <div key={draft.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap', color: '#333' }}>{draft.content}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#666' }}>
                <strong>Platform:</strong> {PLATFORMS[draft.platform].name} | <strong>Saved:</strong> {draft.date}
              </small>
              <button 
                onClick={() => handleDeleteDraft(draft.id)} 
                style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}