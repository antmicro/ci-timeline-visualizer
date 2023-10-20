import { Loader } from "./modules/Loader.js";

(async function () {
  let loader = new Loader();

  let fetcher;
  let parser;
  let sectionManager;
  let gui;

  [fetcher, parser, sectionManager, gui] = await loader.load();

  fetcher.setListener((data) => {parser.parse(data)});
  parser.listener = (data) => {sectionManager.addSectionsFromTags(data)};
  sectionManager.listeners.push((data) => {gui.update(data)});

  fetcher.startPolling();
  sectionManager.createPendingSection();
  gui.startPolling();
}());
