// src/api/router.js
import { Router } from 'express';
import authRoutes         from './auth.routes.js';
import nodosRoutes        from './nodos.routes.js';
import lecturasRoutes     from './lecturas.routes.js';
import alarmasRoutes      from './alarmas.routes.js';
import comandosRoutes     from './comandos.routes.js';
import sedesRoutes        from './sedes.routes.js';
import invernaderoRoutes  from './invernaderos.routes.js';
import lotesRoutes        from './lotes.routes.js';
import personalRoutes     from './personal.routes.js';

const router = Router();

router.use('/auth',         authRoutes);
router.use('/nodos',        nodosRoutes);
router.use('/lecturas',     lecturasRoutes);
router.use('/alarmas',      alarmasRoutes);
router.use('/comandos',     comandosRoutes);
router.use('/sedes',        sedesRoutes);
router.use('/invernaderos', invernaderoRoutes);
router.use('/lotes',        lotesRoutes);
router.use('/personal',     personalRoutes);

export default router;
