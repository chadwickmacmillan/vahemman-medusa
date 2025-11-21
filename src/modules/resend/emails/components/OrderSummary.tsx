import { Column, Heading, Row, Section, Text } from "@react-email/components";

import {
  OrderLineItemDTO,
  BigNumberValue,
  ProductDTO,
} from "@medusajs/framework/types";
import formatPrice from "../utils/formatPrice";
import OrderItems from "./OrderItems";

const OrderSummary = ({
  products,
  items,
  currencyCode,
  subtotal,
  taxTotal,
  total,
  shippingTotal,
}: {
  products: ProductDTO[];
  items?: OrderLineItemDTO[] | null;
  currencyCode: string;
  subtotal?: BigNumberValue;
  shippingTotal?: BigNumberValue;
  taxTotal?: BigNumberValue;
  total?: BigNumberValue;
}) => {
  return (
    <Section className="mt-8">
      <Heading className="text-xl font-semibold text-gray-800 mb-4">
        Order Summary
      </Heading>
      {items && (
        <OrderItems
          items={items}
          currencyCode={currencyCode}
          products={products}
        />
      )}
      {subtotal && (
        <Row className="text-gray-600">
          <Column className="w-1/2">
            <Text className="m-0">Subtotal</Text>
          </Column>
          <Column className="w-1/2 text-right">
            <Text className="m-0">{formatPrice(subtotal, currencyCode)}</Text>
          </Column>
        </Row>
      )}
      {shippingTotal && (
        <Row className="text-gray-600">
          <Column className="w-1/2">
            <Text className="m-0">Shipping</Text>
          </Column>
          <Column className="w-1/2 text-right">
            <Text className="m-0">
              {shippingTotal === 0
                ? "Free"
                : formatPrice(shippingTotal, currencyCode)}
            </Text>
          </Column>
        </Row>
      )}
      <Row className="text-gray-600">
        <Column className="w-1/2">
          <Text className="m-0">Tax</Text>
        </Column>
        <Column className="w-1/2 text-right">
          <Text className="m-0">
            {formatPrice(taxTotal || 0, currencyCode)}
          </Text>
        </Column>
      </Row>
      {total && (
        <Row className="border-t border-gray-200 mt-4 text-gray-800 font-bold">
          <Column className="w-1/2">
            <Text>Total</Text>
          </Column>
          <Column className="w-1/2 text-right">
            <Text>{formatPrice(total, currencyCode)}</Text>
          </Column>
        </Row>
      )}
    </Section>
  );
};

export default OrderSummary;
