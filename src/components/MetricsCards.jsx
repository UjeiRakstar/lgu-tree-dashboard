// src/components/MetricsCards.jsx

export default function MetricsCards({ totalTrees, totalCarbon, criticalCount }) {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #16a34a' }}>
        <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Trees Tagged</p>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#1e293b' }}>{totalTrees}</h2>
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #059669' }}>
        <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Est. Carbon</p>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#1e293b' }}>{totalCarbon} <span style={{fontSize: '1rem', color: '#94a3b8'}}>kg</span></h2>
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444' }}>
        <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Critical Hazards</p>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#ef4444' }}>{criticalCount}</h2>
      </div>
    </div>
  );
}