import React from "react";
import CuteSection from "../../components/ui/CuteSection";
import CuteCard from "../../components/ui/CuteCard";

const Terms: React.FC = () => {
  return (
    <CuteSection className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto">
        <CuteCard className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Terms of Service</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
            These Terms of Service govern your access to and use of DULO's
            services. By using the service you agree to these terms.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Use of Service</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            You may use DULO for lawful purposes and must not misuse the
            platform. You retain ownership of the content you upload.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Account Responsibilities</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            You are responsible for maintaining the confidentiality of your
            account and for all activities that occur under your account.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Limitation of Liability</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            To the extent permitted by law, DULO is not liable for indirect
            or consequential damages arising from use of the service.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Contact</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Questions about these terms? Contact <a href="mailto:daffabot@programmer.net" className="text-accentblue">daffabot@programmer.net</a>.
          </p>
        </CuteCard>
      </div>
    </CuteSection>
  );
};

export default Terms;
