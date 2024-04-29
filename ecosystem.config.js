export const apps = [
    {
        name: "uRide_Backend",
        script: "./src/index.js",
        exp_backoff_restart_delay: 100,
        max_memory_restart: "1G",
        max_restarts: 10,
        min_uptime: 2000,
    },
];
