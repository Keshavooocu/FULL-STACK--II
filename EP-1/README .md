# Multi-Platform Post Composer & Draft Management System

This project is the implementation of **Experiment 1.1.1** and **Experiment 1.1.2**, combined into a single, cohesive React application.

## 📚 Experiment Details

### Aim
To design and develop a dynamic post composer interface supporting multiple platforms with real-time constraint validation, while implementing a frontend draft management system using memoized selectors for performance optimization.

### Objectives
1. Understand multi-platform content handling and real-time validation (CO1, CO3).
2. Manage draft data using frontend state and simulate backend persistence with `localStorage` (CO2, CO3).
3. Design responsive UI components with instant visual feedback.
4. Optimize application performance using memoized selectors (`reselect`).

---

## 🚀 Step-by-Step Implementation Guide

### Part 1: Terminal Commands (Environment Setup)
Run these commands in your macOS Terminal to set up the Vite + React environment.

**1. Navigate to the target directory:**
```bash
cd "/Users/keshavsingal/Desktop/Study/Full stack-2"
```

**2. Create the React project using Vite:**
```bash
npm create vite@latest post-manager -- --template react
```
*(Note: If prompted, select ESLint using the arrow keys and press Enter).*

**3. Navigate into the project folder:**
```bash
cd post-manager
```

**4. Install the base dependencies:**
```bash
npm install
```

**5. Install the specific packages for the experiment:**
```bash
npm install uuid reselect
```

**6. Open the project in Visual Studio Code:**
```bash
code .
```

**7. Start the local development server:**
```bash
npm run dev
```

---

### Part 2: VS Code Steps (Writing the Code)

#### 1. Define Platform Constraints
**Action:** Inside the `src` folder, create a new file named `platformRules.js`.
**Code:** Paste the following configuration.

```javascript
// src/platformRules.js

export const PLATFORMS = {
  twitter: { name: 'Twitter', maxLength: 280 },
  linkedin: { name: 'LinkedIn', maxLength: 3000 },
  instagram: { name: 'Instagram', maxLength: 2200 }
};
```

#### 2. Build the Main Application
**Action:** Open the existing `src/App.jsx` file. Delete everything inside it and paste the complete application code below. 
**Code:**

```jsx
// src/App.jsx
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createSelector } from 'reselect';
import { PLATFORMS } from './platformRules';

export default function App() {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [searchQuery, setSearchQuery] = useState('');
  const [media, setMedia] = useState(null); 

  // Lazy initialize state directly from localStorage
  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = localStorage.getItem('postDrafts');
    return savedDrafts ? JSON.parse(savedDrafts) : [];
  });

  useEffect(() => {
    localStorage.setItem('postDrafts', JSON.stringify(drafts));
  }, [drafts]);

  // --- MEDIA HANDLING ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
  };

  // --- DRAFT CRUD OPERATIONS ---
  const handleSaveDraft = () => {
    if (!content.trim() && !media) return;
    const newDraft = { 
      id: uuidv4(), 
      content, 
      platform: selectedPlatform, 
      media: media, 
      date: new Date().toLocaleString() 
    };
    setDrafts([newDraft, ...drafts]); 
    setContent(''); 
    setMedia(null); 
  };

  const handleDeleteDraft = (id) => {
    setDrafts(drafts.filter(draft => draft.id !== id));
  };

  // --- MEMOIZED SELECTORS ---
  const getDrafts = (state) => state.drafts;
  const getSearchQuery = (state) => state.searchQuery;

  const getFilteredDrafts = createSelector(
    [getDrafts, getSearchQuery],
    (drafts, query) => {
      if (!query) return drafts;
      return drafts.filter(draft => 
        draft.content.toLowerCase().includes(query.toLowerCase())
      );
    }
  );

  const filteredDrafts = getFilteredDrafts({ drafts, searchQuery });

  // --- PLATFORM VALIDATION ---
  const currentRule = PLATFORMS[selectedPlatform];
  const charCount = content.length;
  const isOverLimit = charCount > currentRule.maxLength;
  const isCloseToLimit = charCount > currentRule.maxLength - 20;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* COMPOSER SECTION */}
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          marginBottom: '40px'
        }}>
          <h1 style={{ marginTop: 0, marginBottom: '20px', fontSize: '28px', color: '#38bdf8' }}>
            Multi-Platform Post Composer
          </h1>
          
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#94a3b8' }}>Target Platform:</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                fontSize: '16px', 
                borderRadius: '6px',
                backgroundColor: '#334155',
                color: '#fff',
                border: '1px solid #475569',
                cursor: 'pointer'
              }}
            >
              {Object.entries(PLATFORMS).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <textarea
            style={{
              width: '100%',
              height: '150px',
              backgroundColor: '#0f172a',
              color: '#fff',
              borderColor: isOverLimit ? '#ef4444' : '#475569',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderRadius: '8px',
              padding: '15px',
              fontSize: '16px',
              boxSizing: 'border-box',
              resize: 'vertical',
              outline: 'none'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share?"
          />

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px' 
          }}>
            <div style={{ 
              color: isOverLimit ? '#ef4444' : isCloseToLimit ? '#f59e0b' : '#94a3b8',
              fontWeight: 'bold'
            }}>
              {charCount} / {currentRule.maxLength}
            </div>

            {/* Media Upload Button */}
            <div>
              <input 
                type="file" 
                accept="image/*" 
                id="media-upload"
                onChange={handleImageUpload}
                style={{ display: 'none' }} 
              />
              <label htmlFor="media-upload" style={{
                cursor: 'pointer',
                color: '#38bdf8',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📷 Attach Media
              </label>
            </div>
          </div>

          {/* Media Preview Section */}
          {media && (
            <div style={{ position: 'relative', marginTop: '15px', display: 'inline-block' }}>
              <img src={media} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '2px solid #475569' }} />
              <button 
                onClick={removeMedia}
                style={{
                  position: 'absolute', top: '-10px', right: '-10px',
                  backgroundColor: '#ef4444', color: 'white', border: 'none',
                  borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <button 
            onClick={handleSaveDraft} 
            disabled={isOverLimit || (content.length === 0 && !media)}
            style={{ 
              marginTop: '25px', 
              width: '100%',
              padding: '12px 20px', 
              backgroundColor: isOverLimit || (content.length === 0 && !media) ? '#475569' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isOverLimit || (content.length === 0 && !media) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Save to Drafts
          </button>
        </div>

        {/* DASHBOARD SECTION */}
        <div>
          <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Drafts Dashboard</h2>
          <input 
            type="text" 
            placeholder="🔍 Search your drafts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 15px', marginBottom: '25px', 
              fontSize: '16px', borderRadius: '8px', border: '1px solid #475569',
              backgroundColor: '#1e293b', color: '#fff', boxSizing: 'border-box'
            }}
          />

          {filteredDrafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              No drafts found. Start creating one above!
            </div>
          ) : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredDrafts.map(draft => (
              <div key={draft.id} style={{ 
                backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', 
                borderLeft: `5px solid ${PLATFORMS[draft.platform].name === 'Twitter' ? '#1da1f2' : PLATFORMS[draft.platform].name === 'LinkedIn' ? '#0077b5' : '#e1306c'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ 
                    backgroundColor: '#334155', padding: '4px 10px', 
                    borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#e2e8f0'
                  }}>
                    {PLATFORMS[draft.platform].name}
                  </span>
                  <small style={{ color: '#64748b' }}>{draft.date}</small>
                </div>
                
                <p style={{ margin: '15px 0', whiteSpace: 'pre-wrap', color: '#f1f5f9', fontSize: '16px', lineHeight: '1.5' }}>
                  {draft.content}
                </p>

                {draft.media && (
                  <img src={draft.media} alt="Draft media" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginTop: '10px' }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                  <button 
                    onClick={() => handleDeleteDraft(draft.id)} 
                    style={{ 
                      backgroundColor: 'transparent', color: '#ef4444', 
                      border: '1px solid #ef4444', padding: '6px 15px', 
                      borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Testing the Implementation

Once the code is saved and the development server is running (`npm run dev`), open your browser to `http://localhost:5173/` and verify the following:

1. **Validation Constraints:** Type more than 280 characters with Twitter selected. The text box will outline in red, display an error, and disable the save button. Switch to LinkedIn, and the error will clear.
2. **Draft Management:** Write a post, save it, and then delete it to verify full CRUD capabilities.
3. **Data Persistence:** Write a draft, save it, and refresh the browser page. The draft should remain visible on the dashboard, confirming `localStorage` integration is working.
4. **Performance Memoization:** Open your browser's Developer Tools (Console). Type in the "Search your drafts" input box. You will see `Memoized Selector Running...` printed to the console, confirming that `reselect` is efficiently handling state derivations.
