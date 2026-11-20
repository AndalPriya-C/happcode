import { config } from './config.js';
import { startCatalogRefresh, getCatalog } from './execution/catalog.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`HappCode API listening on :${config.PORT}`);
  startCatalogRefresh();
  setTimeout(() => {
    const summary = getCatalog().map((l) => `${l.id}:${l.available ? 'ok' : 'off'}`).join(' ');
    console.log(`[catalog] ${summary}`);
  }, 3000).unref();
});
