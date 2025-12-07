import React from "react";
import CuteSection from "../../components/ui/CuteSection";
import CuteCard from "../../components/ui/CuteCard";

const Privacy: React.FC = () => {
  return (
    <CuteSection className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto">
        <CuteCard className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
            DULO (“we”, “us”, “our”) respects your privacy. This Privacy Policy
            explains how we collect, use, and disclose information when you use
            our services.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Information We Collect</h2>
          <ul className="list-disc ml-6 text-sm text-neutral-600 dark:text-neutral-300">
            <li>Account information (name, email)</li>
            <li>Documents and files you upload for OCR processing</li>
            <li>Usage and analytics data to improve our service</li>
          </ul>

          <h2 className="font-semibold mt-4 mb-2">How We Use Data</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            We use data to provide, maintain, and improve our services, to
            process OCR requests, to communicate with you, and to comply with
            legal obligations.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Security</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            We implement reasonable security measures to protect your data. No
            online service is completely secure — please review this policy for
            more details.
          </p>

          <h2 className="font-semibold mt-4 mb-2">Contact</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            For privacy questions, contact us at{" "}
            <a
              href="mailto:daffabot@programmer.net"
              className="text-accentblue"
            >
              daffabot@programmer.net
            </a>
            .
          </p>
        </CuteCard>
      </div>
    </CuteSection>
  );
};

export default Privacy;
