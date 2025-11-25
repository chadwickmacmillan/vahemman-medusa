import { Column, Heading, Row, Section, Text } from "@react-email/components";

import {
  OrderLineItemDTO,
  BigNumberValue,
  ProductDTO,
} from "@medusajs/framework/types";
import formatPrice from "../utils/formatPrice";
import OrderItems from "./OrderItems";
import PriceCalculations from "./PriceCalculations";

const ItemsInShipment = ({
  items,
  currencyCode,
  subtotal,
  taxTotal,
  total,
  shippingTotal,
  products,
}: {
  items?: OrderLineItemDTO[] | null;
  currencyCode: string;
  subtotal?: BigNumberValue;
  shippingTotal?: BigNumberValue;
  taxTotal?: BigNumberValue;
  total?: BigNumberValue;
  products: ProductDTO[];
}) => {
  return (
    <Section className="mt-8">
      <Heading className="text-xl font-semibold text-gray-800 mb-4">
        Items in shipment
      </Heading>
      {items && (
        <OrderItems
          items={items}
          currencyCode={currencyCode}
          products={products}
        />
      )}
      <PriceCalculations
        subtotal={subtotal}
        total={total}
        taxTotal={taxTotal}
        currencyCode={currencyCode}
        shippingTotal={shippingTotal}
      />
    </Section>
  );
};

export default ItemsInShipment;
