import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";
import { TransferTicketQueue } from "./wbotTransferTicketQueue";
import cron from "node-cron";
import fs from "fs";
import http from 'http';
import https from 'https';


var privateKey  = fs.readFileSync(process.env.SSL_KEY, 'utf8');
var certificate = fs.readFileSync(process.env.SSL_CRT, 'utf8');

var credentials = {key: privateKey, cert: certificate};

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

/*
const server = app.listen(process.env.PORT, async () => {
  const companies = await Company.findAll();
  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(() => {
    startQueueProcess();
  });
  logger.info(`Server started on port: ${process.env.PORT}`);
});
*/

//httpServer.listen(process.env.PORT);
httpsServer.listen(process.env.PORT, async () => {
  const companies = await Company.findAll();
  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(() => {
    startQueueProcess();
  });
  logger.info(`Server started on port: ${process.env.PORT}`);
});

cron.schedule("* * * * *", async () => {

  try {
    // console.log("Running a job at 01:00 at America/Sao_Paulo timezone")
    logger.info(`Serviço de transferencia de tickets iniciado`);

    await TransferTicketQueue();
  }
  catch (error) {
    logger.error(error);
  }

});

initIO(httpsServer);
gracefulShutdown(httpsServer);
