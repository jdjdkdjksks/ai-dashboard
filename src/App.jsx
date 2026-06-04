import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Mail, Wrench, Link as LinkIcon, Sparkles, 
  Settings, PieChart as PieChartIcon, CheckCircle, Info, Lock, User, Clock
} from 'lucide-react';
import { CUSTOMERS } from './customers';
import './index.css';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

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
        <div className="brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <div className="brand-icon">
            <Sparkles size={20} color="#fff" />
          </div>
          AutoFlow AI
        </div>
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

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('de-DE'));
  
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
          let dateStr = 'Heute';
          let timeStr = '00:00';
          
          if (row.Zeit) {
            const zeitStr = String(row.Zeit);
            if (zeitStr.includes('T')) {
              const dateObj = new Date(zeitStr);
              dateStr = dateObj.toLocaleDateString('de-DE');
              timeStr = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            } else {
              timeStr = zeitStr;
            }
          }

          let category = row.Kategorie || row.Pfad || 'Allgemein';
          if (typeof category === 'string' && category.trim() === '') category = 'Allgemein';

          return {
            id: row.row_number || i,
            time: timeStr,
            date: dateStr,
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
      setLastUpdate(new Date().toLocaleTimeString('de-DE'));
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

  const pathDistribution = logs.reduce((acc, log) => {
    let categoryName = 'Automatisch gefiltert';
    if (log.category === 'werkstatt') categoryName = 'Werkstatt';
    else if (log.category === 'verkauf') categoryName = 'Verkauf';
    
    const existing = acc.find(item => item.name === categoryName);
    if (existing) existing.value += 1;
    else acc.push({ name: categoryName, value: 1 });
    return acc;
  }, []);
  pathDistribution.sort((a, b) => b.value - a.value);

  // Split customer actions into Werkstatt (Termin-Link gesendet) and Verkauf (Rückruf initiiert)
  const actionDistribution = [
    { 
      name: 'Termin-Link gesendet (Werkstatt)', 
      value: logs.filter(l => l.category === 'werkstatt' && l.linkStatus && l.linkStatus.toLowerCase() !== 'nein').length 
    },
    { 
      name: 'Telefonischer Rückruf initiiert (Verkauf)', 
      value: logs.filter(l => l.category === 'verkauf').length 
    }
  ];
  
  const hasActions = actionDistribution.some(item => item.value > 0);
  const actionChartData = hasActions 
    ? actionDistribution.filter(item => item.value > 0)
    : [{ name: 'Keine Aktionen', value: 1 }];

  const ACTION_COLORS = {
    'Termin-Link gesendet (Werkstatt)': 'var(--primary)',
    'Telefonischer Rückruf initiiert (Verkauf)': 'var(--success)',
    'Keine Aktionen': '#374151'
  };

  // Gesparte Arbeitszeit logic:
  // - 3 minutes per filtered email (category !== 'werkstatt' && category !== 'verkauf')
  // - 8 minutes per answered email (category === 'werkstatt' || category === 'verkauf')
  const filteredCount = logs.filter(l => l.category !== 'werkstatt' && l.category !== 'verkauf').length;
  const processedCount = logs.filter(l => l.category === 'werkstatt' || l.category === 'verkauf').length;
  const savedMinutes = (filteredCount * 3) + (processedCount * 8);
  const savedHours = Math.round(savedMinutes / 60);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={20} color="#fff" />
          </div>
          AutoFlow AI
        </div>
        
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
        </nav>

        <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
          <Lock size={20} />
          <span>Abmelden</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-8 animate-fade-in">
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
                Ø Antwortzeit: &lt; 60 Sek.
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
                {loading ? 'Aktualisiere...' : `Live (Update: ${lastUpdate})`}
              </span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)'}}><Mail /></div>
                <div className="stat-content">
                  <h3>Alle E-Mails</h3>
                  <div className="stat-value">{logs.length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)'}}>
                  <CheckCircle />
                </div>
                <div className="stat-content">
                  <h3>Automatisch gefiltert (Kein Handlungsbedarf)</h3>
                  <div className="stat-value">{filteredCount}</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--secondary)', background: 'rgba(139, 92, 246, 0.1)'}}>
                  <Activity />
                </div>
                <div className="stat-content">
                  <h3>Eingeleitete Kunden-Aktionen</h3>
                  <div className="stat-value">{actionDistribution.reduce((sum, item) => sum + item.value, 0)}</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)'}}>
                  <Clock />
                </div>
                <div className="stat-content">
                  <h3>Gesparte Arbeitszeit</h3>
                  <div className="stat-value">~ {savedHours} Stunden</div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid-large">
              <div className="glass-panel">
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

              <div className="glass-panel">
                <h3 className="mb-4">Eingeleitete Kunden-Aktionen</h3>
                <div style={{ display: 'flex', flexDirection: 'column', height: '300px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={actionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {actionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ACTION_COLORS[entry.name] || 'var(--secondary)'} />
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
                    {actionChartData.map((entry, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ 
                          width: '10px', height: '10px', borderRadius: '50%', 
                          backgroundColor: ACTION_COLORS[entry.name] || 'var(--secondary)',
                          display: 'inline-block'
                        }}></span>
                        <span style={{ color: 'var(--text-muted)' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{hasActions ? entry.value : 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', marginTop: activeTab === 'logs' ? '0' : '32px', display: activeTab === 'dashboard' || activeTab === 'logs' ? 'block' : 'none' }}>
          <div className="flex justify-between items-center mb-4">
            <h3>Letzte E-Mail Eingänge</h3>
            <button style={{
              background: 'transparent', border: '1px solid var(--border)', 
              color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={fetchLogs}>
              Manuell Aktualisieren
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Kategorie</th>
                  <th>Kundenanliegen</th>
                  <th>Eingeleitete Aktion</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && !loading ? (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '32px'}}>Keine Daten gefunden.</td></tr>
                ) : (
                  logs.slice(0, 50).map((log, idx) => {
                    return (
                      <tr key={log.id || idx}>
                        <td>
                          <div style={{fontWeight: 500}}>{log.time}</div>
                          <div className="text-muted text-sm">{log.date}</div>
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
                            <span className="badge badge-warning" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                              <Info size={12} style={{marginRight: '4px'}}/>
                              Automatisch gefiltert
                            </span>
                          )}
                        </td>
                        <td style={{maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {log.summary}
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
                              <span className="badge badge-warning">
                                Link ausstehend
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
