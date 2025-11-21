import {
  Text,
  Container,
  Heading,
  Html,
  Tailwind,
  Head,
  Preview,
} from "@react-email/components";
import { CustomerDTO, OrderDTO, ProductDTO } from "@medusajs/framework/types";
import OrderSummary from "./components/OrderSummary";
import EmailHeader from "./components/EmailHeader";
import EmailFooter from "./components/EmailFooter";
import EmailBody from "./components/EmailBody";

type OrderPlacedEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO;
  };
  products: ProductDTO[];
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
};

function OrderPlacedEmailComponent({
  order,
  products,
  email_banner,
}: OrderPlacedEmailProps) {
  const shouldDisplayBanner = email_banner && "title" in email_banner;

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Thank you for your order from Vähemmän</Preview>
        <EmailBody>
          <EmailHeader />

          {/* Thank You Message */}
          <Container className="p-6">
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Thank you for your order,{" "}
              {order.customer?.first_name || order.shipping_address?.first_name}
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              We're processing your order and will notify you when it ships.
            </Text>
          </Container>

          {/* Order Items */}
          <Container className="px-6">
            <OrderSummary
              products={products}
              currencyCode={order.currency_code}
              items={order.items}
              shippingTotal={order.shipping_methods?.reduce((acc, current) => {
                if (typeof current.total === "number") {
                  return acc + current.total;
                } else if (typeof current.total === "string") {
                  return acc + parseFloat(current.total);
                }
                return acc;
              }, 0)}
              subtotal={order.item_total}
              total={order.total}
              taxTotal={order.tax_total}
            />
          </Container>

          {/* Footer */}
          <EmailFooter />
        </EmailBody>
      </Html>
    </Tailwind>
  );
}

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
);
