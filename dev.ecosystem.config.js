module.exports = {
  apps: [
    {
      name: "metalaw-api-dev",
      script: "venv/Scripts/python.exe",
      args: "main.py",
      cwd: "backend",
      watch: ["main.py", "gemini_service.py", "gemini_prompt.txt", "gemini_html_prompt.txt"],
      env: {
        PYTHONPATH: ".",
        PORT: 8002,
        HOST: "127.0.0.1",
        ENV: "development"
      }
    },
    {
      name: "metalaw-ui-dev",
      script: "cmd.exe",
      args: "/c npm run dev -- --port 5175",
      cwd: "frontend",
      watch: false,
      shell: true,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
