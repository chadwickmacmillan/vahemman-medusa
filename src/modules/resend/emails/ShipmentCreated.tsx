import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Row,
  Tailwind,
  Head,
  Preview,
  Link,
} from "@react-email/components";
import {
  BigNumberValue,
  CustomerDTO,
  FulfillmentDTO,
  OrderDTO,
  OrderLineItemDTO,
  ProductDTO,
} from "@medusajs/framework/types";
import { useMemo } from "react";
import EmailHeader from "./components/EmailHeader";
import EmailFooter from "./components/EmailFooter";
import EmailBody from "./components/EmailBody";
import ItemsInShipment from "./components/ItemsInShipment";

type ShipmentCreatedEmailProps = {
  fulfillment: FulfillmentDTO & {
    order: OrderDTO & {
      customer: CustomerDTO;
    };
  };
  products: ProductDTO[];
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
};

function ShipmentCreatedEmailComponent({
  fulfillment,
  products,
  email_banner,
}: ShipmentCreatedEmailProps) {
  // get order line items

  const fulfillmentOrderLineItemIds = useMemo(
    () => fulfillment.items.map((item) => item.line_item_id),
    [fulfillment]
  );

  const orderItems = useMemo(
    () =>
      fulfillment.order.items?.reduce((acc, current) => {
        if (fulfillmentOrderLineItemIds.includes(current.id)) {
          acc.push(current);
        }
        return acc;
      }, [] as OrderLineItemDTO[]),
    [fulfillmentOrderLineItemIds, fulfillment]
  );

  const isEveryItemInFulfillment = useMemo(
    () =>
      fulfillment.order.items?.every((item) =>
        fulfillmentOrderLineItemIds.includes(item.id)
      ),
    [fulfillment, fulfillmentOrderLineItemIds]
  );

  const shipDate = fulfillment.shipped_at
    ? new Date(fulfillment.shipped_at)
    : null;

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>
          {isEveryItemInFulfillment ? "Your" : "Part of your"} order is on its
          way
        </Preview>
        <EmailBody>
          <EmailHeader />

          {/* Thank You Message */}
          <Container className="p-6">
            <Text className="text-center text-gray-600 mt-2">
              Order #{fulfillment.order.display_id + 1000}
            </Text>
            <Text className="text-center text-gray-600 mt-2">
              Dear{" "}
              {fulfillment.order.customer?.first_name ||
                fulfillment.order.shipping_address?.first_name}{" "}
              {fulfillment.order.customer?.last_name ||
                fulfillment.order.shipping_address?.last_name}
              ,
            </Text>
            {shipDate && (
              <Text className="text-center text-gray-600 mt-2">
                {isEveryItemInFulfillment ? "Your" : "Part of your"} order has
                now shipped. Your package is being delivered by FedEx and is
                schedule to be delivered {shipDate.toLocaleDateString()}
              </Text>
            )}
            <Link href={fulfillment.labels[0].tracking_url}>
              Track my package
            </Link>
          </Container>

          {/* Tracking information */}
          <Container className="px-6">
            <Row>
              <Text className="text-sm m-0 text-gray-500">
                Estimated Delivery Date
              </Text>
              {shipDate && (
                <Text className="text-sm m-0 my-2 text-gray-500">
                  {shipDate.toLocaleDateString()}
                </Text>
              )}
            </Row>
            <Row>
              <Text className="text-sm m-0 text-gray-500">
                Shipping Address
              </Text>
              <address>
                <Text className="text-sm m-0 my-2 text-gray-500">
                  {fulfillment.order.shipping_address?.first_name +
                    " " +
                    fulfillment.order.shipping_address?.last_name}
                </Text>
                <br />
                <Text className="text-sm m-0 my-1 text-gray-500">
                  {fulfillment.order.shipping_address?.address_1}
                </Text>
                <br />
                <Text className="text-sm m-0 my-1 text-gray-500">
                  {fulfillment.order.shipping_address?.address_2}
                </Text>
                <br />
                <Text className="text-sm m-0 my-1 text-gray-500">
                  {fulfillment.order.shipping_address?.city},{" "}
                  {fulfillment.order.shipping_address?.province}{" "}
                  {fulfillment.order.shipping_address?.postal_code}
                </Text>
              </address>
            </Row>
            <Row>
              <Text className="text-sm m-0 text-gray-500">Shipped by</Text>
              <Text className="text-sm m-0 my-2 text-gray-500">FedEx</Text>
            </Row>
            <Row>
              <Column>
                <Text className="text-sm m-0 text-gray-500">Tracking #</Text>
                <Text className="text-sm m-0 my-2 text-gray-500">
                  {fulfillment.labels[0].tracking_number}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Order Items */}
          <Container className="px-6">
            <ItemsInShipment
              products={products}
              currencyCode={fulfillment.order.currency_code}
              items={orderItems}
              shippingTotal={fulfillment.order.shipping_methods?.reduce(
                (acc, current) => {
                  if (typeof current.total === "number") {
                    return acc + current.total;
                  } else if (typeof current.total === "string") {
                    return acc + parseFloat(current.total);
                  }
                  return acc;
                },
                0
              )}
              subtotal={fulfillment.order.item_total}
              total={fulfillment.order.total}
              taxTotal={fulfillment.order.tax_total}
            />
          </Container>

          {/* Footer */}
          <EmailFooter />
        </EmailBody>
      </Html>
    </Tailwind>
  );
}

export const shipmentCreatedEmail = (props: ShipmentCreatedEmailProps) => (
  <ShipmentCreatedEmailComponent {...props} />
);
