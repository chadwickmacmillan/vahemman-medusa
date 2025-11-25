import { Column, Img, Row, Section, Text } from "@react-email/components";
import { ProductDTO, type OrderLineItemDTO } from "@medusajs/framework/types";
import formatPrice from "../utils/formatPrice";

const OrderItems = ({
  items,
  currencyCode,
  products,
}: {
  items: OrderLineItemDTO[];
  currencyCode: string;
  products: ProductDTO[];
}) => {
  return (
    <>
      {items.map((item) => {
        const product = products.find(
          (product) => product.id === item.product_id
        );
        const variant = product?.variants.find(
          (variant) => variant.id === item.variant_id
        );
        return (
          <>
            <Section key={item.id} className="border-b border-gray-200 py-4">
              <Row>
                <Column className="w-1/3">
                  <Img
                    src={variant?.thumbnail ? encodeURI(variant.thumbnail) : ""}
                    alt={product?.title ?? ""}
                    width="100%"
                  />
                </Column>
                <Column className="w-2/3 pl-4">
                  <Text className="text-lg font-semibold text-gray-800">
                    {product?.title}
                  </Text>
                  {variant?.options.map((option, i) => (
                    <Text
                      className={`text-gray-600 ${i === 0 ? "mt-4" : "mt-2"}`}
                    >
                      {option.option?.title}: {option.value}
                    </Text>
                  ))}
                  <Text className="text-gray-800 mt-2 font-bold">
                    {formatPrice(item.total, currencyCode)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </>
        );
      })}
    </>
  );
};

export default OrderItems;
