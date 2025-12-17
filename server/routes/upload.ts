import express from "express";
import multer from "multer";
import { storagePut } from "../storage";
import crypto from "crypto";

const router = express.Router();

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas tipos específicos
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

// Rota de upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Gerar nome único para o arquivo
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const extension = req.file.originalname.split(".").pop();
    const fileName = `materiais/${Date.now()}-${randomSuffix}.${extension}`;

    // Upload para S3
    const result = await storagePut(
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});

export default router;
