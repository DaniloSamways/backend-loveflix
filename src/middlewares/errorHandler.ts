// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { MessageError } from "../errors/message.error";
import { ImageLimitError } from "../errors/imagelimit.error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  if (err instanceof ImageLimitError) {
    res.status(400).json({
      type: "ImageLimitError",
      message: err.message,
    });
    return;
  }

  if (err instanceof MessageError) {
    res.status(400).json({
      message: err.message,
    });
    return;
  }

  // Erros de validação Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Verifique os campos",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma error:", err);
    res.status(500).json({
      message: "Erro interno",
    });
    return;
  }

  // Erros HTTP customizados
  // if ("statusCode" in err && typeof err.statusCode === "number") {
  //   return res.status(err.statusCode).json({
  //     message: err.message || "Error occurred",
  //   });
  // }

  // Erro genérico (padrão)
  res.status(500).json({
    message: "Erro interno",
  });
};
