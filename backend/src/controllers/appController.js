const App = require('../models/appModel');
const { exec } = require('child_process');

exports.launchApp = async (req, res) => {
  try {
    const app = new App({
      name: req.body.name,
      command: req.body.command,
      user: req.user._id,
      state: 'running'
    });
    await app.save();
    
    // Launch the application
    exec(app.command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    
    res.status(201).send(app);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getUserApps = async (req, res) => {
  try {
    const apps = await App.find({ user: req.user._id });
    res.send(apps);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.stopApp = async (req, res) => {
  try {
    const app = await App.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { state: 'stopped' },
      { new: true }
    );
    if (!app) {
      return res.status(404).send();
    }
    // Here you would actually stop the application
    // This is a simplified version and might not work for all apps
    exec(`pkill -f "${app.command}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    res.send(app);
  } catch (error) {
    res.status(400).send(error);
  }
};