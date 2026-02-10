import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import TaxCodeService from "../../../modules/tax_code/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve("Taxcode") as TaxCodeService;

  const data = await service.listTaxCodes();
  res.json(data);
}
