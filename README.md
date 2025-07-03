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

here is a link to all postman requests to check the server https://davidbrodsky.postman.co/workspace/David-Brodsky's-Workspace~211d06e1-f776-4928-8f89-58e160b8220e/collection/44579502-8f999695-08b9-4a2c-9f14-15cd4b00509a?action=share&source=copy-link&creator=44579502
