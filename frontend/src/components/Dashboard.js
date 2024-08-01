import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VncScreen from './VncScreen';

function Dashboard() {
  const [apps, setApps] = useState([]);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCommand, setNewAppCommand] = useState('');
  const [activeApp, setActiveApp] = useState(null);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    console.log("Active App updated:", JSON.stringify(activeApp, null, 2));
  }, [activeApp]);

  const fetchApps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/apps/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Fetched apps (frontend):', JSON.stringify(response.data, null, 2));
      setApps(response.data);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const launchApp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/apps/launch',
        { name: newAppName, command: newAppCommand },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('App launched (full response):', JSON.stringify(response.data, null, 2));
      alert('App launched successfully!');
      fetchApps();
    } catch (error) {
      console.error('Error launching app:', error);
      alert('Failed to launch app. Please try again.');
    }
  };

  const openApp = async (app) => {
    console.log("Opening app:", JSON.stringify(app, null, 2));
    if (!app.port) {
      try {
        // Fetch the latest app data from the server
        const response = await axios.get(`http://localhost:5000/api/apps/${app._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setActiveApp(response.data);
      } catch (error) {
        console.error('Error fetching updated app data:', error);
        setActiveApp(app);
      }
    } else {
      setActiveApp(app);
    }
  };

  const stopApp = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/apps/${id}/stop`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('App stopped successfully!');
      fetchApps();
      if (activeApp && activeApp._id === id) {
        setActiveApp(null);
      }
    } catch (error) {
      console.error('Error stopping app:', error);
      alert('Failed to stop app. Please try again.');
    }
  };

  return (
    <div>
      <h2>Your Applications</h2>
      <ul>
        {apps.map(app => (
          <li key={app._id}>
            {app.name} - {app.state} (Port: {app.port})
            {app.state === 'running' && (
              <>
                <button onClick={() => openApp(app)}>Open</button>
                <button onClick={() => stopApp(app._id)}>Stop</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h3>Launch New App</h3>
      <input
        type="text"
        placeholder="App Name"
        value={newAppName}
        onChange={(e) => setNewAppName(e.target.value)}
      />
      <input
        type="text"
        placeholder="App Command"
        value={newAppCommand}
        onChange={(e) => setNewAppCommand(e.target.value)}
      />
      <button onClick={launchApp}>Launch</button>
      {activeApp && (
        <div>
          <h3>VNC Viewer for {activeApp.name}</h3>
          {activeApp.port ? (
            <VncScreen
              host={window.location.hostname}
              port={activeApp.port}
              password="1234"
            />
          ) : (
            <p>Error: No port assigned to the active app. App details: {JSON.stringify(activeApp, null, 2)}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;