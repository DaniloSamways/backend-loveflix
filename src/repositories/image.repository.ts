import fs from "fs";

export class ImageRepository {
  async uploadImage(file: Buffer): Promise<{ path: string; id: string }> {
    // Salvar localmente em /uploads por enquanto
    const id = Date.now().toString();
    const uploadPath = `./uploads/${id}`;
    await fs.promises.writeFile(uploadPath, file);
    // Retornar o caminho do arquivo salvo
    return {
      path: uploadPath,
      id
    };
  }

  async deleteImage(imageId: string): Promise<void> {
    // Deletar o arquivo localmente
    const filePath = `./uploads/${imageId}`;
    try {
      await fs.promises.unlink(filePath);
    } catch (error: any) {
      console.error(`Erro ao deletar imagem: ${error.message}`);
      throw new Error("Erro ao deletar imagem");
    }
  }
}
