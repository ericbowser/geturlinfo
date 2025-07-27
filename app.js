import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate initial app setup
    const initializeApp = async () => {
      try {
        // Your initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleApiCall = async () => {
    try {
      // Example API call to your scraping service
      const response = await fetch('/api/getUrlInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com'
        })
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>My React App</h1>
        <nav className="app-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="app-main">
        <section className="hero-section">
          <h2>Welcome to My App</h2>
          <p>This is your main React application entry point.</p>

          <button
            onClick={handleApiCall}
            className="cta-button"
          >
            Test API Call
          </button>
        </section>

        {data && (
          <section className="data-section">
            <h3>API Response:</h3>
            <pre className="data-display">
              {JSON.stringify(data, null, 2)}
            </pre>
          </section>
        )}

        <section className="features-section">
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Feature One</h3>
              <p>Description of your first feature.</p>
            </div>
            <div className="feature-card">
              <h3>Feature Two</h3>
              <p>Description of your second feature.</p>
            </div>
            <div className="feature-card">
              <h3>Feature Three</h3>
              <p>Description of your third feature.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 My React App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;