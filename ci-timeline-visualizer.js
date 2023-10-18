import { Orchestrator } from "./modules/Orchestrator.js";

(async function () {
  let orchestrator = new Orchestrator();

  await orchestrator.start();
}());
