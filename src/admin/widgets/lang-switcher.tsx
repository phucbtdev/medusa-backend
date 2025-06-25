import { useTranslation } from "react-i18next";
import { Container, Select } from "@medusajs/ui";
import { defineWidgetConfig } from "@medusajs/admin-sdk";

const LangSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Container className="divide-y p-0">
      <div className="grid grid-cols-2 items-center px-6 py-4">
        <div className="font-medium font-sans txt-compact-small">
          Change language
        </div>
        <div className="font-normal font-sans txt-compact-small">
          <div className="w-[256px]">
            <Select defaultValue={i18n.language} onValueChange={handleChange}>
              <Select.Trigger>
                <Select.Value placeholder="Select a language" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="en" title="Switch to English 🇺🇸">
                  English
                </Select.Item>
                <Select.Item value="vi" title="Chuyển sang Tiếng Việt 🇻🇳">
                  Tiếng Việt
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "profile.details.after",
});

export default LangSwitcher;
