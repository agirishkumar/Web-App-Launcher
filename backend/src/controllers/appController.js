const App = require('../models/appModel');
const Docker = require('dockerode');
const docker = new Docker();

exports.launchApp = async (req, res) => {
  try {
    const app = new App({
      name: req.body.name,
      command: req.body.command,
      user: req.user._id,
      state: 'starting'
    });

    console.log(`Launching app: ${app.command}`);

    const container = await docker.createContainer({
      Image: `app-launcher-${app.command}`,
      ExposedPorts: { '5900/tcp': {} },
      HostConfig: {
        PortBindings: { '5900/tcp': [{ HostPort: '0' }] }
      },
      Env: ["DISPLAY=:99"],
      Cmd: ["/bin/bash", "-c", "/start-firefox.sh"]
    });

    console.log(`Container created with ID: ${container.id}`);

    await container.start();
    console.log(`Container started`);

    const containerData = await container.inspect();
    console.log(`Container inspected:`, containerData);

    const port = containerData.NetworkSettings.Ports['5900/tcp'][0].HostPort;
    console.log(`VNC port assigned: ${port}`);

    app.containerId = container.id;
    app.port = port;

    // Wait for VNC server to be ready
    await new Promise(resolve => setTimeout(resolve, 15000));

    app.state = 'running';
    await app.save();
    
    console.log(`App saved to database: ${JSON.stringify(app)}`);

    res.status(201).send(app);
  } catch (error) {
    console.error('Error launching app:', error);
    res.status(400).send(error);
  }
};
  
  // exports.getUserApps = async (req, res) => {
  //   try {
  //     const apps = await App.find({ user: req.user._id });
  //     // Include port information for running apps
  //     const appsWithPort = apps.map(app => {
  //       if (app.state === 'running' && app.port) {
  //         return { ...app.toObject(), port: app.port };
  //       }
  //       return app.toObject();
  //     });
  //     res.send(appsWithPort);
  //   } catch (error) {
  //     res.status(500).send(error);
  //   }
  // };
  
  exports.getUserApps = async (req, res) => {
    try {
      const apps = await App.find({ user: req.user._id });
      console.log('Fetched apps:', JSON.stringify(apps, null, 2));
      res.send(apps.map(app => app.toObject()));
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).send({ error: error.message });
    }
  };


  exports.stopApp = async (req, res) => {
    try {
      const app = await App.findOne({ _id: req.params.id, user: req.user._id });
      if (!app) {
        return res.status(404).send({ error: 'App not found' });
      }
  
      console.log(`Attempting to stop app with container ID: ${app.containerId}`);
      
      if (app.containerId) {
        const container = docker.getContainer(app.containerId);
        try {
          await container.stop();
        } catch (error) {
          if (error.statusCode === 304) {
            console.log('Container was already stopped');
          } else {
            throw error;
          }
        }
        await container.remove();
      } else {
        console.log('No container ID found for the app');
      }
  
      app.state = 'stopped';
      app.containerId = null;
      app.port = null;
      await app.save();
  
      res.send(app);
    } catch (error) {
      console.error('Error stopping app:', error);
      res.status(400).send(error);
    }
  };