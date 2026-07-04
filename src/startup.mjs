import app from './dist/gpm-app/server/server.mjs';
import http from 'http';

const port = process.env.PORT || 4000;
http.createServer(app).listen(port);
