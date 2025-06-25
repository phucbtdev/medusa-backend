import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils";
import {
  AuthorizePaymentInput, AuthorizePaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  RefundPaymentOutput, RefundPaymentInput,
  InitiatePaymentInput, InitiatePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
} from "@medusajs/framework/types";

import axios from "axios";
import crypto from "crypto";
import { Logger } from "@medusajs/framework/types";

type Options = {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
};

type Injected = { logger: Logger };

export default class MomoPaymentProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "momo";
  protected client: any;
  protected logger_: Logger;
  protected options_: Options;

  constructor(container: Injected, options: Options) {
    super(container, options);
    this.logger_ = container.logger;
    this.options_ = options;

    this.client = axios.create({
      baseURL: options.endpoint,
      headers: { "Content-Type": "application/json" },
    });
  }

  private _signRaw(raw: string) {
    return crypto.createHmac("sha256", this.options_.secretKey)
      .update(raw)
      .digest("hex");
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const amount = input.data?.amount;
    const orderId = input.data?.cart_id ?? `momo_${Date.now()}`;

    const resp = await this.client.post("/v2/gateway/api/create", {
      partnerCode: this.options_.partnerCode,
      accessKey: this.options_.accessKey,
      requestType: "captureWallet",
      amount,
      orderId,
      orderInfo: `Payment for cart ${orderId}`,
      returnUrl: input.data?.returnUrl,
      notifyUrl: input.data?.notifyUrl,
    });

    const data = resp.data;
    if (data.errorCode !== 0) throw new Error(`MOMO auth failed: ${data.message}`);

    return {
      status: PaymentSessionStatus.REQUIRES_MORE,
      data: {
        momoResponse: data,
        redirect_url: data.payUrl
      }
    };
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const resp = await this.client.post("/v2/gateway/api/query", {
      partnerCode: this.options_.partnerCode,
      accessKey: this.options_.accessKey,
      requestId: input.data?.requestId,
      orderId: input.data?.orderId,
    });

    return { data: resp.data };
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data };
  }

  async getWebhookActionAndData(evt): Promise<any> {
    const { data } = evt;
    const action = data.errorCode === 0 ? "capture" : "cancel";
    return { action, data };
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return {
      id: `momo_${Date.now()}`,
      data: {},
    };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data };
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = await this.client.get(`/status/${input.data?.id}`);
    switch (status) {
      case "requires_capture":
        return { status: "authorized" };
      case "success":
        return { status: "captured" };
      case "canceled":
        return { status: "canceled" };
      default:
        return { status: "pending" };
    }
  }

  async retrievePayment(paymentData: any): Promise<Record<string, unknown>> {
    return paymentData;
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const amount = input.data?.amount;
    const orderId = input.data?.cart_id ?? `momo_${Date.now()}`;

    const resp = await this.client.post("/v2/gateway/api/create", {
      partnerCode: this.options_.partnerCode,
      accessKey: this.options_.accessKey,
      requestType: "captureWallet",
      amount,
      orderId,
      orderInfo: `Update Payment for cart ${orderId}`,
      returnUrl: input.data?.returnUrl,
      notifyUrl: input.data?.notifyUrl,
    });

    const data = resp.data;
    if (data.errorCode !== 0) {
      throw new Error(`MOMO updatePayment failed: ${data.message}`);
    }

    return { data };
  }
}
