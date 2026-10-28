import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { verificarLogin } from '../services/authService.js';

export const authRoutes = Router();

authRoutes.post('/login', async (req, res, next) => {
  try {
    const resultado = await verificarLogin(prisma, req.body ?? {});
    if (!resultado.autenticado) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }
    return res.json({ usuario: resultado.usuario });
  } catch (error) {
    return next(error);
  }
});
