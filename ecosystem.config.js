module.exports = {
  apps: [
    {
      name: "metalaw-unified",
      script: "venv/Scripts/pythonw.exe",
      args: "main.py",
      cwd: "backend",
      watch: false,
      env: {
        PYTHONPATH: ".",
        PORT: 3001,
        HOST: "0.0.0.0"
      }
    }
  ]
};
