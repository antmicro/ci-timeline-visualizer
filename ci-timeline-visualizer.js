import { Loader } from "./modules/Loader.js";

(async function () {
  let loader = new Loader();

  let fetcher;
  let parser;
  let gui;

  [fetcher, parser, gui] = await loader.load();

  fetcher.setListener((data) => {parser.parse(data)});

  fetcher.startPolling();
  gui.startPolling();
}());