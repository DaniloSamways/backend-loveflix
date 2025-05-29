import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { env } from "../config/env";
import { MessageError } from "../errors/message.error";

// 1. Configuração do Multer
const memoryStorage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new MessageError(
        `Tipo de arquivo inválido. Formatos permitidos: ${allowedMimeTypes.join(", ")}`
      )
    );
  }
  cb(null, true);
};

// 2. Instância base do Multer
const multerInstance = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: parseInt("5242880"), // 5MB padrão
    files: 1,
  },
});

// 3. Middleware de upload primário
export const uploadMiddleware = multerInstance.single("file");

// 4. Wrapper seguro (safeUpload)
export const safeUpload: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      // Padroniza erros do Multer
      if (err instanceof multer.MulterError) {
        return next(
          new MessageError(
            err.code === "LIMIT_FILE_SIZE"
              ? `Arquivo excede o limite de 5MB`
              : err.message
          )
        );
      }
      return next(err); // Repassa outros erros
    }

    // Validação pós-upload
    if (!req.file) {
      return next(new MessageError("Nenhum arquivo foi enviado"));
    }

    // Verificação do buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return next(new MessageError("Arquivo corrompido ou vazio"));
    }

    next();
  });
};
