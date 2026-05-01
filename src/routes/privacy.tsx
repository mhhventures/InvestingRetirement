import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="bg-[#fef6f1]">
      {/* Masthead */}
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
            Your Data, Your Rights
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-black leading-[1.05] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[13px] sm:text-[15px] text-gray-700 leading-relaxed max-w-2xl">
            What information Investing and Retirement Media LLC collects, how we use it, who we share it with, and the choices you have.
          </p>
          <div className="mt-5 text-[11px] uppercase tracking-widest text-gray-500">
            Last Updated: January 2026
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Summary callout */}
        <div className="bg-white border-l-4 border-[#0e4d45] p-5 sm:p-6 mb-10 shadow-sm">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e4d45] mb-2">
            The Short Version
          </div>
          <p className="text-[13px] sm:text-[15px] text-black leading-relaxed">
            We collect the minimum information needed to run our site, understand what readers find useful, and send newsletters to people who subscribe. We <span className="font-semibold">do not sell your personal data</span>. You can unsubscribe, request deletion, or ask what we hold on you at any time.
          </p>
        </div>

        <div className="space-y-10 text-[13px] sm:text-[14px] text-gray-800 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy describes how <span className="font-semibold">Investing and Retirement Media LLC</span> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares information when you visit our website, read our content, subscribe to our newsletter, or interact with our affiliate links.
            </p>
            <p className="mt-3">
              By using this site, you agree to the practices described below. If you do not agree, please do not use the site.
            </p>
          </section>

          {/* Information we collect */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">2. Information We Collect</h2>
            <p className="font-semibold text-black mb-2">Information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Email address when you subscribe to our newsletter</li>
              <li>Name, email, and message content when you contact us</li>
              <li>Any voluntary feedback or survey responses you submit</li>
            </ul>

            <p className="font-semibold text-black mt-5 mb-2">Information collected automatically:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>IP address and general location (country/region level)</li>
              <li>Browser type, device type, and operating system</li>
              <li>Pages viewed, time on page, referring URL, and exit pages</li>
              <li>Clicks on affiliate links and outbound links</li>
              <li>Cookies and similar tracking technologies (see Section 5)</li>
            </ul>

            <p className="font-semibold text-black mt-5 mb-2">Information from third parties:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Affiliate networks</span> may share aggregated conversion data with us (e.g., whether a referral resulted in a signup) so we can verify commissions
              </li>
              <li>
                <span className="font-semibold">Analytics providers</span> may supplement our data with behavioral insights
              </li>
            </ul>
          </section>

          {/* How we use information */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">3. How We Use Your Information</h2>
            <p>We use the information described above to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>Operate, maintain, and improve the website</li>
              <li>Deliver newsletters and respond to your inquiries</li>
              <li>Understand which content resonates with readers</li>
              <li>Verify affiliate commission attribution</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
            <p className="mt-4">
              We do <span className="font-semibold">not</span> use your information to build advertising profiles, run retargeting campaigns across the web, or sell your data to third parties.
            </p>
          </section>

          {/* How we share */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">4. How We Share Information</h2>
            <p>We share information only in these limited circumstances:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <span className="font-semibold">Service providers</span> that help us operate the site, such as our email platform, analytics provider, and web hosting company. These vendors are contractually limited to using data only to provide services to us.
              </li>
              <li>
                <span className="font-semibold">Affiliate partners</span> receive click and conversion data (typically a referral ID) when you click an affiliate link and complete a signup. We do not share your email, name, or browsing history with them.
              </li>
              <li>
                <span className="font-semibold">Legal and safety</span> situations — we may disclose information if required by law, subpoena, or to protect the rights, property, or safety of our readers, the public, or our company.
              </li>
              <li>
                <span className="font-semibold">Business transfers</span> — if our company is acquired or merged, user information may transfer as part of that transaction, subject to the protections of this Privacy Policy.
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">5. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><span className="font-semibold">Essential cookies</span> — required for the site to function (e.g., remembering your cookie preferences)</li>
              <li><span className="font-semibold">Analytics cookies</span> — help us understand aggregate site usage</li>
              <li><span className="font-semibold">Affiliate tracking cookies</span> — allow partner companies to attribute signups to our site</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Blocking cookies may prevent some features of the site from working correctly. You can also opt out of many analytics cookies through tools such as the Google Analytics opt-out browser add-on.
            </p>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">6. Your Rights &amp; Choices</h2>
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><span className="font-semibold">Access</span> the personal information we hold about you</li>
              <li><span className="font-semibold">Correct</span> inaccurate information</li>
              <li><span className="font-semibold">Delete</span> your information (subject to legal exceptions)</li>
              <li><span className="font-semibold">Unsubscribe</span> from our newsletter at any time via the link in any email</li>
              <li><span className="font-semibold">Opt out</span> of the sale of personal information (note: we do not sell your data)</li>
              <li><span className="font-semibold">Restrict or object</span> to certain processing activities</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at <span className="font-mono text-[12px]">Partners@mhhventures.com</span> with the subject line &ldquo;Privacy Request.&rdquo; We will respond within 30 days.
            </p>
          </section>

          {/* CCPA / GDPR */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">7. California &amp; EU/UK Residents</h2>
            <p>
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete, and the right to opt out of the sale of personal information. We do not sell personal information as defined under the CCPA.
            </p>
            <p className="mt-3">
              If you are located in the European Union, the United Kingdom, or the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local data protection authority. Our legal basis for processing is typically your consent (newsletter) or our legitimate interest (site analytics).
            </p>
          </section>

          {/* Data retention */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">8. Data Retention</h2>
            <p>
              We keep personal information only as long as needed for the purposes described in this policy. Newsletter emails are retained until you unsubscribe. Analytics data is typically retained for up to 26 months. Contact form submissions are kept for up to 2 years unless we need them longer to address an ongoing matter.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">9. Security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to protect the information we hold. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">10. Children&apos;s Privacy</h2>
            <p>
              This site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will promptly delete it.
            </p>
          </section>

          {/* Third-party links */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">11. Third-Party Links</h2>
            <p>
              Our site contains links to third-party websites, including affiliate partners. Their privacy practices are governed by their own policies, not this one. We encourage you to review the privacy policies of any third-party site you visit.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last Updated&rdquo; date at the top of this page. Material changes will be communicated via a notice on the site or by email to newsletter subscribers.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">13. Contact Us</h2>
            <p>
              Questions, requests, or complaints regarding this Privacy Policy should be sent to:
            </p>
            <div className="mt-4 bg-white border border-[#e4d9cf] p-5">
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">Publisher</div>
              <div className="font-semibold text-black mb-1">Investing and Retirement Media LLC</div>
              <div className="text-[13px] text-gray-700">
                Email: <span className="font-mono text-[12px]">Partners@mhhventures.com</span>
              </div>
            </div>
          </section>

          {/* Footer nav */}
          <section className="pt-6 border-t border-[#e4d9cf]">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
              <Link to="/disclosure" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                Affiliate Disclosure
              </Link>
              <Link to="/about" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                About Us
              </Link>
              <Link to="/contact" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                Contact
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
