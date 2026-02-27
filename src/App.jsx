import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import './App.css';
import Login from './components/Login';

// Importing our modular Blueprints
import Header from './components/Header';
import MetricsCards from './components/MetricsCards';
import MapDashboard from './components/MapDashboard';
import ActionBoard from './components/ActionBoard';
import ManageArborists from './components/ManageArborists';

function App() {
  const lspuCenter = [14.262185, 121.397521];
  const [trees, setTrees] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // The session state to track if the Admin is logged in
  const [session, setSession] = useState(null);
  
  // State for Arborists
  const [arborists, setArborists] = useState([]);
  
  // Updated Map Filters (Removed Mango, Added Legacy/Untagged)
  const [layerFilters, setLayerFilters] = useState({
    showHealthy: true,
    showHazards: true,
    showUntagged: true 
  });

  // Authentication Listener (Checks for login when the app loads)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch trees AND arborists when the app loads
  useEffect(() => {
    fetchTrees();
    fetchArborists();
  }, []);

  async function fetchTrees() {
    const { data, error } = await supabase.from('trees').select('*');
    if (!error) setTrees(data);
  }

  async function fetchArborists() {
    const { data, error } = await supabase.from('arborists').select('*');
    if (!error) setArborists(data);
  }

  async function resolveTicket(id) {
    const confirmResolve = window.confirm("Mark this tree hazard as resolved and safe?");
    if (!confirmResolve) return;

    const { error } = await supabase.from('trees').update({ isDecayed: false, isLeaning: false, hasPowerlineConflict: false, isRootProblem: false }).eq('id', id);
    if (!error) { fetchTrees(); alert("Ticket Resolved! Map updated."); } 
    else { alert("Error updating database."); }
  }

  async function deleteTree(id) {
    const confirmDelete = window.confirm("WARNING: Are you sure you want to permanently delete this garbage data from the cloud?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('trees').delete().eq('id', id);
    if (!error) { fetchTrees(); alert("Tree permanently deleted."); } 
    else { console.error("Delete Error:", error); alert("Error deleting tree."); }
  }

  // The Dispatch Function!
  async function assignTicket(treeId, arboristName) {
    const { error } = await supabase.from('trees').update({ assigned_to: arboristName }).eq('id', treeId);
    if (!error) { 
      fetchTrees(); 
      alert(`✅ Ticket officially dispatched to ${arboristName}!`); 
    } else { 
      alert("Error assigning ticket."); 
    }
  }

  const toggleFilter = (filterName) => {
    setLayerFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  // Data Calculations
  const totalTrees = trees.length;
  const totalCarbon = trees.reduce((sum, tree) => sum + ((parseFloat(tree.dbh) || 0) * 1.5), 0).toFixed(2);
  const hazardTrees = trees.filter(tree => tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem);
  const criticalCount = hazardTrees.length;

  // Filter Logic
  const filteredMapTrees = trees.filter(tree => {
    const isHazard = tree.isDecayed || tree.isLeaning || tree.hasPowerlineConflict || tree.isRootProblem;
    // Legacy/Untagged trees are those with is_tagged explicitly set to false
    const isUntagged = tree.is_tagged === false;

    if (layerFilters.showHazards && isHazard) return true;
    if (layerFilters.showUntagged && isUntagged && !isHazard) return true;
    if (layerFilters.showHealthy && !isHazard && !isUntagged) return true;
    return false;
  });

  // THE BOUNCER. If there is no session, render the Login screen and STOP.
  if (!session) {
    return <Login />;
  }

  // If the bouncer lets them through, render the Command Center!
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', paddingBottom: '50px' }}>
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} criticalCount={criticalCount} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {activeTab === 'dashboard' && (
          <>
            <MetricsCards 
              totalTrees={totalTrees} 
              totalCarbon={totalCarbon} 
              criticalCount={criticalCount} 
            />
            
            <MapDashboard 
              lspuCenter={lspuCenter}
              filteredMapTrees={filteredMapTrees}
              layerFilters={layerFilters}
              toggleFilter={toggleFilter}
              deleteTree={deleteTree}
              arborists={arborists}
              assignTicket={assignTicket}
              allTrees={trees}
            />
          </>
        )}

        {activeTab === 'actionBoard' && (
          <ActionBoard 
            hazardTrees={hazardTrees} 
            resolveTicket={resolveTicket} 
            deleteTree={deleteTree} 
            arborists={arborists}
            assignTicket={assignTicket}
          />
        )}

        {activeTab === 'arborists' && (
          <ManageArborists />
        )}

      </div>
    </div>
  );
}

export default App;