import MomoPaymentProviderService from "./service";
import { Module } from "@medusajs/framework/utils"

export const MOMO_MODULE = "brand"

export default Module(MOMO_MODULE, {
  service: MomoPaymentProviderService,
})