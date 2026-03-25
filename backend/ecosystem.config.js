{
  "apps": [
    {
      "name": "social-app-backend",
      "script": "dist/main.js",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
