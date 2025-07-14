import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';

import { AppServerModule } from './dist/your-project-name/server/main';

const app = express();
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/your-project-name/browser');

// Configura el motor de renderizado Angular Universal
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Servir archivos estáticos
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// Manejar todas las demás rutas con Angular Universal
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
