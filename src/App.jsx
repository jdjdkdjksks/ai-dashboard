import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Mail, Wrench, 
  CheckCircle, Lock, User, Clock,
  MessageSquare, Send, PieChart as PieChartIcon
} from 'lucide-react';
import { CUSTOMERS } from './customers';
import './index.css';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = CUSTOMERS[username];
    
    if (customer && customer.password === password) {
      onLogin(customer);
    } else {
      setError('Ungültiger Benutzername oder Passwort');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel animate-fade-in">
        <a href="https://autoflow-ai.de" className="brand" style={{ justifyContent: 'center', marginBottom: '24px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="AutoFlow AI" className="logo-img" />
          AutoFlow AI
        </a>
        <h2 style={{ marginBottom: '8px' }}>Willkommen zurück</h2>
        <p className="text-muted mb-8">Bitte loggen Sie sich ein, um auf Ihr Dashboard zuzugreifen.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="login-input" 
              placeholder="Benutzername" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="login-input" 
              placeholder="Passwort" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Einloggen
          </button>
        </form>
      </div>
    </div>
  );
}

function FeedbackForm({ currentUser }) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Wir stellen sicher, dass wir nur die Webhook-URL des Kunden nutzen.
    const webhookUrl = currentUser.feedbackWebhook;
    
    if (!webhookUrl) {
      setError('Keine Feedback-URL konfiguriert.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sende Feedback an:', webhookUrl);
      // Wir nutzen eine sehr einfache Fetch-Methode, um CORS-Preflights zu vermeiden.
      // mode: 'no-cors' macht die Anfrage zu einer "Simple Request" und umgeht die CORS-Prüfung.
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          kunde: currentUser.name,
          nachricht: feedback,
          zeitpunkt_formatiert: new Date().toLocaleString('de-DE', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          }) + ' Uhr',
          iso_timestamp: new Date().toISOString(),
          system: 'AutoFlow AI Dashboard'
        }),
      });

      console.log('Feedback wurde erfolgreich abgeschickt');
      setLoading(false);
      setSubmitted(true);
      setFeedback('');
    } catch (err) {
      console.error('Detaillierter Feedback-Fehler:', err);
      setError(`Senden fehlgeschlagen: ${err.message}`);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ 
          width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 24px', color: 'var(--success)'
        }}>
          <CheckCircle size={32} />
        </div>
        <h2 style={{ marginBottom: '12px' }}>Vielen Dank!</h2>
        <p className="text-muted mb-8">Dein Feedback wurde erfolgreich übermittelt. Wir schätzen deine Meinung sehr.</p>
        <button 
          className="login-button" 
          style={{ maxWidth: '200px', margin: '0 auto' }}
          onClick={() => setSubmitted(false)}
        >
          Weiteres Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in">
      <h3 style={{ marginBottom: '8px' }}>KI-System & Antworten optimieren</h3>
      <p className="text-muted mb-8">Haben Sie Anmerkungen zur Qualität der KI-Antworten oder Wünsche zur Anpassung des Systems? Teilen Sie uns Ihr Feedback mit.</p>
      
      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Deine Nachricht</label>
          <textarea 
            className="login-input" 
            style={{ minHeight: '150px', resize: 'vertical', paddingTop: '12px' }}
            placeholder="Schreib hier dein Feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="login-button" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {loading ? 'Wird gesendet...' : (
            <>
              <Send size={18} />
              Feedback senden
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    
    // Wir erzwingen die Aktualisierung der Daten aus customers.js, 
    // damit alte URLs im localStorage (wie webhook-test) überschrieben werden.
    const savedUser = JSON.parse(saved);
    const freshData = CUSTOMERS[savedUser.name];
    if (freshData) {
      return { ...freshData, id: savedUser.id };
    }
    return savedUser;
  });
  
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  const [expandedRows, setExpandedRows] = useState({});
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [savingsTimeframe, setSavingsTimeframe] = useState('all');
  
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setLogs([]);
  };

  const fetchLogs = async () => {
    if (!currentUser || !currentUser.webhook) return;

    setLoading(true);
    try {
      const response = await fetch(currentUser.webhook);
      if (!response.ok) {
         throw new Error(`HTTP Status ${response.status}`);
      }
      const data = await response.json();
      
      let rows = [];
      if (Array.isArray(data)) {
        rows = data;
      } else if (typeof data === 'object' && data !== null) {
        if (data.data && Array.isArray(data.data)) {
            rows = data.data; 
        } else {
            rows = [data]; 
        }
      }
      
      if (rows.length > 0) {
        const parsedData = rows.map((row, i) => {
          let fullTimestamp = 'Unbekannt';
          
          if (row.Zeit) {
            const zeitStr = String(row.Zeit);
            try {
              // Wenn es ein ISO-String ist oder ein parbares Datum
              const dateObj = new Date(zeitStr);
              if (!isNaN(dateObj.getTime())) {
                const d = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const t = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                fullTimestamp = `${d} ${t} Uhr`;
              } else {
                // Falls Date() scheitert, versuchen wir manuelles Splitting (falls Format HH:mm:ss oder ähnlich)
                fullTimestamp = `${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${zeitStr.substring(0, 5)} Uhr`;
              }
            } catch (e) {
              fullTimestamp = zeitStr;
            }
          }

          let category = row.Kategorie || row.Pfad || 'Allgemein';
          if (typeof category === 'string' && category.trim() === '') category = 'Allgemein';

          return {
            id: row.row_number || i,
            fullTimestamp: fullTimestamp,
            timestamp: row.Zeit ? new Date(row.Zeit).getTime() : Date.now(),
            category: (category || '').toString().toLowerCase(),
            summary: row.Kundenanliegen || row.Zusammenfassung || 'Keine Details',
            linkStatus: row['Link - versendet'] || ''
          };
        });
        
        setLogs(parsedData.reverse());
        setError(null);
        setErrorDetails('');
      } else {
        setError('Keine Reihen gefunden.');
        setErrorDetails('Die empfangenen Daten waren leer oder in einem unerwarteten Format.');
      }
      setLoading(false);
      setLastUpdate(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError('Konnte Daten nicht laden.');
      setErrorDetails(err.message || String(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Filter logic for savings and dashboard stats
  const getFilteredByTimeframe = (data, timeframe) => {
    if (timeframe === 'all') return data;
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return data.filter(log => {
      const logDate = log.timestamp || 0;
      const diff = now - logDate;
      if (timeframe === 'day') return diff <= oneDay;
      if (timeframe === 'week') return diff <= oneDay * 7;
      if (timeframe === 'month') return diff <= oneDay * 30;
      return true;
    });
  };

  const statsLogs = getFilteredByTimeframe(logs, savingsTimeframe);

  // Gesparte Arbeitszeit logic (based on filtered statsLogs):
  // - 3 minutes per filtered email (category !== 'werkstatt' && category !== 'verkauf')
  // - 8 minutes per answered email (category === 'werkstatt' || category === 'verkauf')
  const filteredCount = statsLogs.filter(l => l.category !== 'werkstatt' && l.category !== 'verkauf').length;
  const processedCount = statsLogs.filter(l => l.category === 'werkstatt' || l.category === 'verkauf').length;
  const savedMinutes = (filteredCount * 3) + (processedCount * 8);
  const savedHours = Math.round(savedMinutes / 60);

  // Filter logs for the table based on category
  const filteredLogs = logs.filter(log => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'werkstatt') return log.category === 'werkstatt';
    if (filterCategory === 'verkauf') return log.category === 'verkauf';
    if (filterCategory === 'gefiltert') return log.category !== 'werkstatt' && log.category !== 'verkauf';
    return true;
  });

  const pathDistribution = statsLogs.reduce((acc, log) => {
    let categoryName = 'Automatisch gefiltert';
    if (log.category === 'werkstatt') categoryName = 'Werkstatt';
    else if (log.category === 'verkauf') categoryName = 'Verkauf';
    
    const existing = acc.find(item => item.name === categoryName);
    if (existing) existing.value += 1;
    else acc.push({ name: categoryName, value: 1 });
    return acc;
  }, []);
  pathDistribution.sort((a, b) => b.value - a.value);

  // Split total incoming emails into Filtered, Werkstatt, and Verkauf
  const totalMailsDistribution = [
    { 
      name: 'Automatisch gefiltert', 
      value: filteredCount 
    },
    { 
      name: 'Werkstatt-Anfragen', 
      value: statsLogs.filter(l => l.category === 'werkstatt').length 
    },
    { 
      name: 'Verkauf-Anfragen', 
      value: statsLogs.filter(l => l.category === 'verkauf').length 
    }
  ];
  
  const hasMails = statsLogs.length > 0;
  const mailChartData = hasMails 
    ? totalMailsDistribution.filter(item => item.value > 0)
    : [{ name: 'Keine E-Mails', value: 1 }];

  const MAIL_COLORS = {
    'Automatisch gefiltert': '#4b5563', // Neutral gray-blue for filters
    'Werkstatt-Anfragen': 'var(--primary)', // Indigo for Werkstatt
    'Verkauf-Anfragen': 'var(--success)', // Green for Verkauf
    'Keine E-Mails': '#374151'
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="brand" style={{ marginBottom: 0, padding: '6px 16px' }}>
          <img src="/logo.png" alt="AutoFlow AI" className="logo-img" style={{ height: '24px' }} />
          <span style={{ fontSize: '1rem' }}>AutoFlow AI</span>
        </div>
        <div className="user-badge">
          <User size={16} />
          <span>{currentUser.name}</span>
        </div>
      </header>

      {/* Sidebar (Desktop only via CSS) */}
      <aside className="sidebar">
        <a href="https://autoflow-ai.de" className="brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="AutoFlow AI" className="logo-img" />
          AutoFlow AI
        </a>
        
        <nav style={{ flex: 1 }}>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <PieChartIcon size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Activity size={20} />
            <span>Live Logs</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <MessageSquare size={20} />
            <span>Feedback</span>
          </div>
        </nav>

        <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
          <Lock size={20} />
          <span>Abmelden</span>
        </div>
      </aside>

      {/* Bottom Navigation (Mobile only via CSS) */}
      <nav className="bottom-nav">
        <div 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <PieChartIcon size={24} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={24} />
          <span>Logs</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={24} />
          <span>Feedback</span>
        </div>
        <div className="bottom-nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <Lock size={24} />
          <span>Logout</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="desktop-header flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-gradient">Dashboard: {currentUser.name}</h1>
            <p className="text-muted">Live-Auswertung Ihrer automatisierten E-Mails</p>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="text-danger text-sm" style={{fontWeight: 'bold'}}>{error}</span>
                <span className="text-danger" style={{fontSize: '0.7rem', maxWidth: '300px', textAlign: 'right'}}>{errorDetails}</span>
              </div>
            )}
            
            {/* Speed-Metrik Badge */}
            <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)', fontWeight: '600' }}>
                <Activity size={14} style={{ color: 'var(--success)' }} />
                Ø Antwortzeit: < 60 Sek.
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '99px' }}>
              <span className="flex items-center gap-2 text-sm">
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: loading ? 'var(--warning)' : (error ? 'var(--danger)' : 'var(--success)'), 
                  display: 'inline-block', 
                  boxShadow: `0 0 8px ${loading ? 'var(--warning)' : (error ? 'var(--danger)' : 'var(--success)')}`
                }}></span>
                {loading ? 'Aktualisiere...' : `Live ${lastUpdate} Uhr`}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="mobile-only-header animate-fade-in" style={{ marginBottom: '20px' }}>
           <h1 className="text-xl font-bold" style={{ color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em' }}>
             Dashboard
           </h1>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
             <p className="text-muted text-xs uppercase tracking-widest" style={{ fontWeight: '500' }}>{currentUser.name}</p>
           </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Timeframe Selector for Dashboard */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold desktop-only">Statistik-Zeitraum</h2>
              <div className="segmented-control glass-panel mobile-time-selector" style={{ padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', width: '100%', maxWidth: '400px' }}>
                {['all', 'day', 'week', 'month'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setSavingsTimeframe(t)}
                    className={`filter-btn ${savingsTimeframe === t ? 'active' : ''}`}
                    style={{ 
                      flex: 1,
                      padding: '8px 4px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem',
                      border: 'none',
                      background: savingsTimeframe === t ? 'var(--primary)' : 'transparent',
                      color: savingsTimeframe === t ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: savingsTimeframe === t ? '600' : '400'
                    }}
                  >
                    {t === 'all' ? 'Alle' : t === 'day' ? 'Heute' : t === 'week' ? 'Woche' : 'Monat'}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Stats Grid */}
            <div className="dashboard-grid-full desktop-only">
              <div className="glass-panel stat-box-desktop">
                <div className="stat-box-header">
                  <span className="stat-box-label">E-Mails gesamt</span>
                  <div className="stat-box-icon primary"><Mail size={18} /></div>
                </div>
                <div className="stat-box-value">{statsLogs.length}</div>
              </div>
              
              <div className="glass-panel stat-box-desktop">
                <div className="stat-box-header">
                  <span className="stat-box-label">Automatisch gefiltert</span>
                  <div className="stat-box-icon muted"><CheckCircle size={18} /></div>
                </div>
                <div className="stat-box-value">{filteredCount}</div>
              </div>

              <div className="glass-panel stat-box-desktop">
                <div className="stat-box-header">
                  <span className="stat-box-label">Kunden-Aktionen</span>
                  <div className="stat-box-icon secondary"><Activity size={18} /></div>
                </div>
                <div className="stat-box-value">{statsLogs.filter(l => l.category === 'werkstatt' || l.category === 'verkauf').length}</div>
              </div>

              <div className="glass-panel stat-box-desktop highlight-desktop">
                <div className="stat-box-header">
                  <span className="stat-box-label">Arbeitsersparnis</span>
                  <div className="stat-box-icon warning"><Clock size={18} /></div>
                </div>
                <div className="stat-box-value">~ {savedHours} Std.</div>
              </div>
            </div>

            {/* Desktop Charts Row */}
            <div className="dashboard-charts-desktop desktop-only">
              <div className="glass-panel chart-box-wide">
                <h3 className="mb-4">E-Mail Kategorien</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pathDistribution} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        itemStyle={{color: '#fff'}}
                      />
                      <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="var(--secondary)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel chart-box-narrow">
                <h3 className="mb-4">E-Mail-Verteilung</h3>
                <div style={{ display: 'flex', flexDirection: 'column', height: '300px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mailChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mailChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={MAIL_COLORS[entry.name] || 'var(--secondary)'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{color: '#fff'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                    {mailChartData.map((entry, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ 
                          width: '10px', height: '10px', borderRadius: '50%', 
                          backgroundColor: MAIL_COLORS[entry.name] || 'var(--secondary)',
                          display: 'inline-block'
                        }}></span>
                        <span style={{ color: 'var(--text-muted)' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{hasMails ? entry.value : 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Stats Grid */}
            <div className="dashboard-grid mobile-only mobile-compact-grid">
              <div className="glass-panel stat-card-compact">
                <div className="stat-icon-container">
                  <Mail size={16} />
                </div>
                <div className="stat-content-small">
                  <div className="stat-label">Gesamt</div>
                  <div className="stat-value-small">{statsLogs.length}</div>
                </div>
              </div>
              
              <div className="glass-panel stat-card-compact">
                <div className="stat-icon-container filter">
                  <CheckCircle size={16} />
                </div>
                <div className="stat-content-small">
                  <div className="stat-label">Gefiltert</div>
                  <div className="stat-value-small">{filteredCount}</div>
                </div>
              </div>

              <div className="glass-panel stat-card-compact">
                <div className="stat-icon-container action">
                  <Activity size={16} />
                </div>
                <div className="stat-content-small">
                  <div className="stat-label">Aktionen</div>
                  <div className="stat-value-small">{statsLogs.filter(l => l.category === 'werkstatt' || l.category === 'verkauf').length}</div>
                </div>
              </div>

              <div className="glass-panel stat-card-compact highlight">
                <div className="stat-icon-container save">
                  <Clock size={16} />
                </div>
                <div className="stat-content-small">
                  <div className="stat-label">Ersparnis</div>
                  <div className="stat-value-small">{savedHours}h</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <FeedbackForm currentUser={currentUser} />
        )}

        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', marginTop: activeTab === 'logs' ? '0' : '32px', display: activeTab === 'dashboard' || activeTab === 'logs' ? 'block' : 'none' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 style={{ fontSize: '1.25rem' }}>{activeTab === 'logs' ? 'Alle Logs' : 'Letzte E-Mail Eingänge'}</h3>
            <button style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
              color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.2s', fontSize: '0.9rem'
            }} onClick={fetchLogs}>
              Manuell Aktualisieren
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            {[
              { id: 'all', label: 'Alle', icon: <Activity size={14} /> },
              { id: 'werkstatt', label: 'Werkstatt', icon: <Wrench size={14} /> },
              { id: 'verkauf', label: 'Verkauf', icon: <User size={14} /> },
              { id: 'gefiltert', label: 'Gefiltert', icon: <CheckCircle size={14} /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  border: '1px solid',
                  borderColor: filterCategory === cat.id ? 'var(--primary)' : 'var(--border)',
                  background: filterCategory === cat.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  color: filterCategory === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  fontWeight: filterCategory === cat.id ? '600' : '400'
                }}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="table-container">
            {/* Desktop Table View */}
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Kategorie</th>
                  <th>Kundenanliegen</th>
                  <th>Eingeleitete Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 && !loading ? (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '32px'}}>Keine Daten gefunden.</td></tr>
                ) : (
                  (showAllLogs ? filteredLogs : filteredLogs.slice(0, 50)).map((log, idx) => {
                    return (
                      <tr key={log.id || idx}>
                        <td style={{ minWidth: '150px' }}>
                          <div style={{fontWeight: 500, fontSize: '0.9rem'}}>{log.fullTimestamp}</div>
                        </td>
                        <td>
                          {log.category === 'werkstatt' ? (
                            <span className="badge badge-primary">
                              <Wrench size={12} style={{marginRight: '4px'}}/>
                              Werkstatt
                            </span>
                          ) : log.category === 'verkauf' ? (
                            <span className="badge badge-success" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                              <User size={12} style={{marginRight: '4px'}}/>
                              Verkauf
                            </span>
                          ) : (
                            <span className="badge" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                              <CheckCircle size={12} style={{marginRight: '4px', color: 'var(--text-muted)'}}/>
                              Automatisch gefiltert
                            </span>
                          )}
                        </td>
                        <td 
                          style={{ 
                            maxWidth: '400px', 
                            cursor: 'pointer', 
                            transition: 'color 0.2s',
                            padding: '16px'
                          }}
                          onClick={() => toggleRow(log.id || idx)}
                          title="Klicken, um den ganzen Text anzuzeigen"
                        >
                          {expandedRows[log.id || idx] ? (
                            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#fff', fontSize: '0.95rem', lineHeight: '1.4' }}>
                              {log.summary}
                            </div>
                          ) : (
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }} className="hover-highlight">
                              {log.summary}
                            </div>
                          )}
                        </td>
                        <td>
                          {log.category === 'verkauf' ? (
                            <span className="badge badge-success" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                              Rückruf initiiert
                            </span>
                          ) : log.category === 'werkstatt' ? (
                            log.linkStatus && log.linkStatus.toLowerCase() !== 'nein' ? (
                              <span className="badge badge-primary">
                                Termin-Link versendet
                              </span>
                            ) : (
                              <span className="badge" style={{ border: '1px solid rgba(37, 99, 235, 0.2)', background: 'rgba(37, 99, 235, 0.08)', color: '#60a5fa' }}>
                                Telefonat
                              </span>
                            )
                          ) : (
                            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              Kein Handlungsbedarf
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="mobile-cards">
              {filteredLogs.length === 0 && !loading ? (
                <div style={{textAlign: 'center', padding: '32px'}}>Keine Daten gefunden.</div>
              ) : (
                (showAllLogs ? filteredLogs : filteredLogs.slice(0, 50)).map((log, idx) => (
                  <div key={log.id || idx} className="mobile-card glass-panel" onClick={() => toggleRow(log.id || idx)} style={{ marginBottom: '12px', padding: '16px' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.fullTimestamp}</div>
                      <div>
                        {log.category === 'werkstatt' ? (
                          <span className="badge badge-primary">Werkstatt</span>
                        ) : log.category === 'verkauf' ? (
                          <span className="badge badge-success">Verkauf</span>
                        ) : (
                          <span className="badge">Gefiltert</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>
                      {expandedRows[log.id || idx] ? log.summary : (log.summary.length > 80 ? log.summary.substring(0, 80) + '...' : log.summary)}
                    </div>
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Aktion:</div>
                      {log.category === 'verkauf' ? (
                        <span className="text-success text-sm">Rückruf initiiert</span>
                      ) : log.category === 'werkstatt' ? (
                        <span className="text-primary text-sm">{log.linkStatus && log.linkStatus.toLowerCase() !== 'nein' ? 'Termin-Link versendet' : 'Telefonat'}</span>
                      ) : (
                        <span className="text-muted text-sm">Kein Handlungsbedarf</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!showAllLogs && filteredLogs.length > 50 && (
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--border)', 
              textAlign: 'center' 
            }}>
              <button 
                className="login-button" 
                style={{ maxWidth: '300px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', boxShadow: 'none' }}
                onClick={() => setShowAllLogs(true)}
              >
                Alle Mails anzeigen
              </button>
            </div>
          )}
          
          {showAllLogs && filteredLogs.length > 50 && (
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--border)', 
              textAlign: 'center' 
            }}>
              <button 
                className="login-button" 
                style={{ maxWidth: '300px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', boxShadow: 'none' }}
                onClick={() => setShowAllLogs(false)}
              >
                Weniger anzeigen
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
