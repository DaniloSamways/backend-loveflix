import { Resend } from "resend";

export class EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendPaymentConfirmation(
    email: string,
    customizationId: string,
    link: string
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: "contato@marketing.amorflix.com.br",
        to: email,
        subject: "Pagamento confirmado! | AmorFlix",
        html: `
          <h1>Seu pagamento foi confirmado!</h1>
          <p>Obrigado por sua compra.</p>
          <p>ID da Customização: ${customizationId}</p>
          <p>Link para acessar sua customização:</p>
          <p><a href="${link}">Acessar Customização</a></p>
          <p>Se você tiver alguma dúvida, entre em contato em nosso Whatsapp. <a href="https://wa.me/send/?phone=5542999882263&text=Ol%C3%A1%2C+vim+atrav%C3%A9s+do+AmorFlix">(42) 99988-2263</a></p>
        `,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendPublishConfirmation(
    email: string,
    customizationId: string,
    link: string
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: "contato@marketing.amorflix.com.br",
        to: email,
        subject: "Publicação feita com sucesso! | AmorFlix",
        html: `
          <h1>Sua personalização foi publicada com sucesso e você já pode compartilhá-la!</h1>
          <p>ID da Customização: ${customizationId}</p>
          <p>Link para compartilhar sua customização:</p>
          <p><a href="${link}">Acessar Customização</a></p>
          <p>Se você tiver alguma dúvida, entre em contato em nosso Whatsapp. <a href="https://wa.me/send/?phone=5542999882263&text=Ol%C3%A1%2C+vim+atrav%C3%A9s+do+AmorFlix">(42) 99988-2263</a></p>
        `,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
