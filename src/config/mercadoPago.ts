import { MercadoPagoConfig, Payment } from "mercadopago";
import { env } from "./env";

// Cria a instância de configuração
const client = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
});

// Cria a instância do recurso Payment
const paymentClient = new Payment(client);

export { paymentClient as mercadopagoPayment };
