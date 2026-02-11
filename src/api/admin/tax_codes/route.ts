import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import TaxCodeService from "../../../modules/tax_code/service";
import { TAX_CODE_SERVICE } from "../../../modules/tax_code";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(TAX_CODE_SERVICE) as TaxCodeService;

  const data = await service.listTaxCodes();
  res.json({ tax_codes: data });
}
