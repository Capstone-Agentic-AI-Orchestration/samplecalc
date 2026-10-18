import { app, SERVICE_NAME } from './app.js';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`${SERVICE_NAME} listening on port ${port}`);
});
