import { Section, Text } from "@react-email/components";

const EmailFooter = () => {
  return (
    <Section className="bg-gray-50 p-6 mt-10">
      <Text className="text-center text-gray-500 text-sm">
        If you have any questions, reply to this email or contact
        hello@vahemman.com.
      </Text>
      <Text className="text-center text-gray-400 text-xs mt-4">
        © {new Date().getFullYear()} Vähemmän, LLC. All rights reserved.
      </Text>
    </Section>
  );
};

export default EmailFooter;
