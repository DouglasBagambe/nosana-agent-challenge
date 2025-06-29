import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { weatherAgent } from "./agents/weather-agent/weather-agent"; // This can be deleted later
import { weatherWorkflow } from "./agents/weather-agent/weather-workflow"; // This can be deleted later
import { yourAgent } from "./agents/your-agent/your-agent"; // Build your agent here
import { qssAgent } from "./agents/qss-agent/qss-agent";
import { qssWorkflow } from "./agents/qss-agent/qss-workflow";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, qssWorkflow }, // can be deleted later
  agents: { weatherAgent, yourAgent, qssAgent },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    port: 8080,
    timeout: 10000,
  },
});
