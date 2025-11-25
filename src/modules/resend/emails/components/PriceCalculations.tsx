import { Column, Row, Text } from "@react-email/components";
import formatPrice from "../utils/formatPrice";

const PriceCalculations = ({
  subtotal,
  taxTotal,
  shippingTotal,
  total,
  currencyCode,
}) => {
  return (
    <>
      <Row className="text-gray-600">
        <Column className="w-1/2">
          <Text className="m-0">Subtotal</Text>
        </Column>
        <Column className="w-1/2 text-right">
          <Text className="m-0">
            {formatPrice(subtotal || 0, currencyCode)}
          </Text>
        </Column>
      </Row>
      <Row className="text-gray-600">
        <Column className="w-1/2">
          <Text className="m-0">Shipping</Text>
        </Column>
        <Column className="w-1/2 text-right">
          <Text className="m-0">
            {shippingTotal === 0
              ? "Free"
              : formatPrice(shippingTotal || 0, currencyCode)}
          </Text>
        </Column>
      </Row>
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
      <Row className="border-t border-gray-200 mt-4 text-gray-800 font-bold">
        <Column className="w-1/2">
          <Text>Total</Text>
        </Column>
        <Column className="w-1/2 text-right">
          <Text>{formatPrice(total || 0, currencyCode)}</Text>
        </Column>
      </Row>
    </>
  );
};

export default PriceCalculations;
