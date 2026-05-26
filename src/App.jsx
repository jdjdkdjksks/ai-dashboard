import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Mail, Wrench, Link as LinkIcon, Sparkles, 
  Settings, PieChart as PieChartIcon, CheckCircle, Info
} from 'lucide-react';
import './index.css';

const N8N_WEBHOOK_URL = 'https://n8n.autoflow-ai.de/webhook/19fdc866-0908-4687-8bc4-01a6067ccec0';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

function App() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('de-DE'));
  
  const fetchLogs = async () => {
    if (!N8N_WEBHOOK_URL) return;

    setLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL);
      if (!response.ok) {
         throw new Error(`HTTP Status ${response.status}`);
      }
      const data = await response.json();
      
      let rows = [];
      if (Array.isArray(data)) {
        rows = data;
      } else if (typeof data === 'object' && data !== null) {
        if (data.data && Array.isArray(data.data)) {
            rows = data.data; // Falls es in { data: [...] } gewrapped ist
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
              // Falls es z.B. nur "14:54:06" ist
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
        setErrorDetails('Die empfangenen Daten waren leer oder in einem unerwarteten Format: ' + JSON.stringify(data).substring(0, 100));
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
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const pathDistribution = logs.reduce((acc, log) => {
    const existing = acc.find(item => item.name === log.category);
    if (existing) existing.value += 1;
    else acc.push({ name: log.category, value: 1 });
    return acc;
  }, []);
  pathDistribution.sort((a, b) => b.value - a.value);

  // Link-Status Verteilung für Pie Chart
  const linkDistribution = logs.reduce((acc, log) => {
    let stat = 'Info (Kein Link)';
    if (log.linkStatus.toLowerCase() === 'nein') stat = 'Ausstehend';
    else if (log.linkStatus && log.linkStatus.toLowerCase() !== 'nein') stat = 'Link Versendet';
    
    const existing = acc.find(item => item.name === stat);
    if (existing) existing.value += 1;
    else acc.push({ name: stat, value: 1 });
    return acc;
  }, []);

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
        
        <nav>
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
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-gradient">Posteingang KI System</h1>
            <p className="text-muted">Live-Auswertung der automatisierten E-Mails</p>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="text-danger text-sm" style={{fontWeight: 'bold'}}>{error}</span>
                <span className="text-danger" style={{fontSize: '0.7rem', maxWidth: '300px', textAlign: 'right'}}>{errorDetails}</span>
              </div>
            )}
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
            <div className="dashboard-grid">
              <div className="glass-panel stat-card">
                <div className="stat-icon"><Mail /></div>
                <div className="stat-content">
                  <h3>Alle E-Mails</h3>
                  <div className="stat-value">{logs.length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)'}}>
                  <Wrench />
                </div>
                <div className="stat-content">
                  <h3>Werkstatt Anfragen</h3>
                  <div className="stat-value">{logs.filter(l => l.category === 'werkstatt').length}</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)'}}>
                  <LinkIcon />
                </div>
                <div className="stat-content">
                  <h3>Links Versendet</h3>
                  <div className="stat-value">{logs.filter(l => l.linkStatus && l.linkStatus.toLowerCase() !== 'nein').length}</div>
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
                <h3 className="mb-4">Aktionen (Link Versendet)</h3>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={linkDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {linkDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{color: '#fff'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
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
                  <th>Link versendet</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && !loading ? (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '32px'}}>Keine Daten gefunden.</td></tr>
                ) : (
                  logs.slice(0, 50).map((log, idx) => {
                    let badgeClass = "badge-warning";
                    let badgeLabel = "Ausstehend";
                    
                    if (log.linkStatus === "") {
                      badgeClass = "";
                      badgeLabel = "Info";
                    } else if (log.linkStatus.toLowerCase() !== "nein") {
                      badgeClass = "badge-success";
                      badgeLabel = "Versendet";
                    }

                    return (
                      <tr key={log.id || idx}>
                        <td>
                          <div style={{fontWeight: 500}}>{log.time}</div>
                          <div className="text-muted text-sm">{log.date}</div>
                        </td>
                        <td>
                          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                            {log.category === 'werkstatt' ? <Wrench size={12} className="mr-1" style={{marginRight: '4px'}}/> : <Mail size={12} className="mr-1" style={{marginRight: '4px'}}/>}
                            {log.category}
                          </span>
                        </td>
                        <td style={{maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {log.summary}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`} style={badgeClass === '' ? {background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)'} : {}}>
                            {badgeLabel}
                          </span>
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
