import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [apps, setApps] = useState([]);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCommand, setNewAppCommand] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/apps/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApps(response.data);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const launchApp = async () => {
    try {
      await axios.post('http://localhost:5000/api/apps/launch', 
        { name: newAppName, command: newAppCommand },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('App launched successfully!');
      fetchApps();
    } catch (error) {
      alert('Failed to launch app. Please try again.');
    }
  };

  const stopApp = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/apps/${id}/stop`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('App stopped successfully!');
      fetchApps();
    } catch (error) {
      alert('Failed to stop app. Please try again.');
    }
  };

  return (
    <div>
      <h2>Your Applications</h2>
      <ul>
        {apps.map(app => (
          <li key={app._id}>
            {app.name} - {app.state}
            {app.state === 'running' && (
              <button onClick={() => stopApp(app._id)}>Stop</button>
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
    </div>
  );
}

export default Dashboard;