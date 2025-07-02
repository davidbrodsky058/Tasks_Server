Tasks Manager Server

I built this API to manage tasks with features like JWT auth, rate limiting, logging, recurring jobs and task sharing.

Project structure:

```
.
├── .env               # environment variables (MONGO_URI, JWT_SECRET)
├── index.js           # connects to MongoDB and starts the server
├── package.json
└── src/
    ├── config/        # database.js, logger.js
    ├── models/        # Task.model.js
    ├── middlewares/   # auth, authorization, rate limiter, request logger
    ├── controllers/   # auth and task controllers
    ├── routes/        # auth.routes.js, task.routes.js
    └── services/      # scheduler.service.js (cron jobs)
```

Installation & run:

1. Clone the repo and enter its folder
2. `npm install`
3. Create a `.env` with your Mongo URI and a strong JWT\_SECRET
4. `node index.js` to start (default port 3000)



for fronted just open Calendar.html. in frontend project i used the help of AI to give maximum experience quality

Core technologies:

* **JWT** for authentication
* **express-rate-limit** for rate limiting
* **Pino** for logging to `app.log`
* **node-cron** for recurring tasks
* **ownerId/sharedWith** for task authorization
