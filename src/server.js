import { createApp } from './app.js';
import { Proxy } from './proxy.js';

const port = process.env.PORT || 3000;
const proxy = new Proxy();

const app = createApp({ proxy });

app.listen(port, () => {
  console.log(`Proxy service listening on port ${port}`);
});
