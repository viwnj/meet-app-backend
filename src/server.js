import server from './app';

server.listen(process.env.APP_PORT, () =>
  console.log(`Server running on port ${process.env.APP_PORT}`)
);
