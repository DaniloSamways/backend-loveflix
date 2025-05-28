import { Resend } from "resend";

export class EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendPaymentConfirmation(
    email: string,
    customizationId: string
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Pagamento confirmado!",
        html: `
          <h1>Seu pagamento foi confirmado!</h1>
          <p>Obrigado por sua compra. Sua customização está sendo processada.</p>
          <p>ID da Customização: ${customizationId}</p>
          <p>Acompanhe o status pelo nosso site.</p>
        `,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  // async sendStatusUpdate(
  //   email: string,
  //   status: DraftStatus,
  //   customizationId: string
  // ): Promise<void> {
  //   const statusMessages: Record<DraftStatus, string> = {
  //     [DraftStatus.PAID]: "foi confirmado",
  //     [DraftStatus.PUBLISHED]: "foi publicado",
  //     [DraftStatus.EXPIRED]: "expirou",
  //     [DraftStatus.DRAFT]: "está em rascunho",
  //     [DraftStatus.PENDING]: "está pendente",
  //     // Add a default for any other DraftStatus if necessary
  //   };

  //   try {
  //     await this.resend.emails.send({
  //       from: "no-reply@seudominio.com",
  //       to: email,
  //       subject: `Status da sua customização: ${status}`,
  //       html: `
  //         <h1>Status atualizado!</h1>
  //         <p>O status da sua customização (ID: ${customizationId}) ${
  //           statusMessages[status] || "foi atualizado"
  //         }.</p>
  //       `,
  //     });
  //   } catch (error) {
  //     console.error("Error sending status email:", error);
  //     throw error;
  //   }
  // }
}
