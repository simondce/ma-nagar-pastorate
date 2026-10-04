import { createWhatsAppServer } from "./app.js";

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";
const server = createWhatsAppServer();
server.requestTimeout = 20000;
server.headersTimeout = 15000;
server.listen(port, host, () =>
  console.log(`WhatsApp demo backend listening on ${host}:${port}`),
);
