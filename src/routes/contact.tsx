import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-[#fef6f1]">
      {/* Header */}
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Get In Touch
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.05] text-black mb-3">
            Contact Investing &amp; Retirement
          </h1>
          <p className="text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
            Have a question about a product review? Want to report an issue? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="p-4 bg-[#ecfdf5] border border-[#16a34a] rounded text-[#15803d] text-sm font-semibold">
                ✓ Message sent! We'll get back to you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded border border-[#e4d9cf] text-sm focus:outline-none focus:border-[#0e4d45]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 rounded border border-[#e4d9cf] text-sm focus:outline-none focus:border-[#0e4d45]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">Subject</label>
                  <select
                    defaultValue="general"
                    className="w-full px-3 py-2 rounded border border-[#e4d9cf] text-sm focus:outline-none focus:border-[#0e4d45]"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="correction">Correction Request</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="support">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-3 py-2 rounded border border-[#e4d9cf] text-sm focus:outline-none focus:border-[#0e4d45]"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-[#0e4d45] text-white text-sm font-semibold rounded hover:bg-[#0a3832] transition-colors uppercase tracking-wider"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-black mb-2">Response Time</h3>
              <p className="text-sm text-gray-700">
                We aim to respond to all inquiries within 24 business hours. Thank you for your patience.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">Common Questions</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• See a product error? <Link to="/disclosure" className="text-[#0e4d45] hover:underline">Check our methodology</Link></li>
                <li>• Want to partner? <span className="text-gray-500">partnerships@clarityrx.com</span></li>
                <li>• Have feedback? We read every message</li>
              </ul>
            </div>

            <div className="bg-white border border-[#e4d9cf] rounded p-4">
              <h3 className="font-bold text-black mb-2">Explore Reviews</h3>
              <div className="flex flex-col gap-1.5">
                <Link to="/bank-accounts" className="text-xs text-[#0e4d45] hover:underline">Bank Accounts</Link>
                <Link to="/investing" className="text-xs text-[#0e4d45] hover:underline">Investing Apps</Link>
                <Link to="/financial-apps" className="text-xs text-[#0e4d45] hover:underline">Financial Apps</Link>
                <Link to="/guides" className="text-xs text-[#0e4d45] hover:underline">Educational Guides</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
