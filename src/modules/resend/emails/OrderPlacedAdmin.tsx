import {
  Text,
  Container,
  Heading,
  Html,
  Tailwind,
  Head,
  Preview,
  Link,
} from "@react-email/components";
import { CustomerDTO, OrderDTO, ProductDTO } from "@medusajs/framework/types";
import EmailHeader from "./components/EmailHeader";
import EmailFooter from "./components/EmailFooter";
import EmailBody from "./components/EmailBody";

type OrderPlacedAdminEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO;
  };
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
};

function OrderPlacedAdminEmailComponent({
  order,
  email_banner,
}: OrderPlacedAdminEmailProps) {
  const shouldDisplayBanner = email_banner && "title" in email_banner;

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Order confirmation</Preview>
        <EmailBody>
          <EmailHeader />

          <Container className="p-6">
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Order #{order.display_id} has been placed.
            </Heading>
            <Link
              href={`/orders/${order.display_id}`}
              className="mt-2 text-blue-600 no-underline text-[14px] leading-[24px] break-all"
            >
              View order
            </Link>
          </Container>

          {/* Footer */}
          <EmailFooter />
        </EmailBody>
      </Html>
    </Tailwind>
  );
}

export const orderPlacedAdminEmail = (props: OrderPlacedAdminEmailProps) => (
  <OrderPlacedAdminEmailComponent {...props} />
);
