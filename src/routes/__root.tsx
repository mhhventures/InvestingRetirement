import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { label: "Banking", to: "/bank-accounts" },
  { label: "Investing", to: "/investing" },
  { label: "Apps", to: "/financial-apps" },
  { label: "Reviews", to: "/reviews" },
  { label: "Guides", to: "/guides" },
  { label: "Calculators", to: "/calculators" },
  { label: "Local Banks", to: "/banks" },
];

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#fef6f1] border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776908612379-yjlz3q6frc-IandR_Horizontal_RGB_Transparent_Black_PNG.png"
              alt="Investing and Retirement"
              className="h-6 sm:h-7 md:h-8 w-auto"
              width="200"
              height="32"
              fetchPriority="high"
              decoding="async"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {CATEGORIES.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="text-[12px] font-semibold text-black hover:text-[#0e4d45] transition-colors tracking-wide uppercase"
                activeProps={{ className: "text-[12px] font-semibold text-[#0e4d45] tracking-wide uppercase" }}
              >
                {c.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/newsletter"
              className="hidden md:inline-flex items-center text-[10px] sm:text-[11px] font-semibold bg-[#0e4d45] text-[#fef6f1] px-2 sm:px-3 py-1.5 rounded-sm hover:bg-[#0a3832] transition-colors tracking-wide uppercase whitespace-nowrap"
            >
              Subscribe
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1 sm:p-1.5 text-black"
              aria-label="Menu"
            >
              <span className="text-base sm:text-lg">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-[#e4d9cf] bg-[#fef6f1] max-h-[70vh] overflow-y-auto">
            <nav className="px-3 sm:px-4 py-2 flex flex-col">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold text-black hover:bg-[#f7ebe2] uppercase tracking-wide"
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-[#fef6f1]/80 mt-8 sm:mt-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6 text-sm">
        <div className="col-span-2 md:col-span-2">
          <img
            src="https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776908612379-yjlz3q6frc-IandR_Horizontal_RGB_Transparent_Black_PNG.png"
            alt="Investing and Retirement"
            className="h-6 sm:h-7 w-auto mb-2 sm:mb-3 invert"
            width="200"
            height="28"
            loading="lazy"
            decoding="async"
          />
          <p className="text-[11px] sm:text-[12px] leading-relaxed max-w-sm mb-3">© 2026 Investing and Retirement Media LLC. All rights reserved.
                            </p>
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/investingandretirement/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.302 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.302-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.302-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.302C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.155 0-3.508.011-4.744.068-1.044.048-1.612.22-1.99.366-.5.195-.858.428-1.233.803-.375.375-.608.732-.803 1.233-.147.378-.319.946-.366 1.99C3.011 8.492 3 8.845 3 12s.011 3.508.068 4.744c.048 1.044.22 1.612.366 1.99.195.5.428.858.803 1.233.375.375.732.608 1.233.803.378.147.946.319 1.99.366C8.492 20.989 8.845 21 12 21s3.508-.011 4.744-.068c1.044-.048 1.612-.22 1.99-.366.5-.195.858-.428 1.233-.803.375-.375.608-.732.803-1.233.147-.378.319-.946.366-1.99.057-1.236.068-1.589.068-4.744s-.011-3.508-.068-4.744c-.048-1.044-.22-1.612-.366-1.99-.195-.5-.428-.858-.803-1.233-.375-.375-.732-.608-1.233-.803-.378-.147-.946-.319-1.99-.366C15.508 4.011 15.155 4 12 4zm0 3.838a4.162 4.162 0 110 8.324 4.162 4.162 0 010-8.324zm0 6.87a2.708 2.708 0 100-5.416 2.708 2.708 0 000 5.416zm5.29-7.043a.973.973 0 11-1.946 0 .973.973 0 011.946 0z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61584877300969&mibextid=wwXIfr&mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
            <a
              href="https://discord.com/invite/bZTSGfxSgz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="https://www.reddit.com/r/investingforbeginners/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit - r/investingforbeginners"
              title="r/investingforbeginners"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/>
              </svg>
            </a>
            <a
              href="https://www.reddit.com/r/Trading/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit - r/Trading"
              title="r/Trading"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/>
              </svg>
            </a>
            <a
              href="https://www.reddit.com/r/SavingMoney/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit - r/SavingMoney"
              title="r/SavingMoney"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@investingretirement"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube - Investing & Retirement"
              title="Investing & Retirement YouTube"
              className="w-8 h-8 rounded-full bg-[#fef6f1]/10 hover:bg-[#fef6f1] hover:text-black text-[#fef6f1] flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="font-semibold text-[#fef6f1] mb-2 sm:mb-3 text-[10px] sm:text-[11px] uppercase tracking-widest">Compare</div>
          <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-[12px]">
            <li><Link to="/bank-accounts" className="hover:text-[#fef6f1] block">Bank Accounts</Link></li>
            <li><Link to="/investing" className="hover:text-[#fef6f1] block">Investing Apps</Link></li>
            <li><Link to="/financial-apps" className="hover:text-[#fef6f1] block">Financial Apps</Link></li>
            <li><Link to="/reviews" className="hover:text-[#fef6f1] block">All Reviews</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-[#fef6f1] mb-2 sm:mb-3 text-[10px] sm:text-[11px] uppercase tracking-widest">Learn</div>
          <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-[12px]">
            <li><Link to="/guides" className="hover:text-[#fef6f1] block">Guides</Link></li>
            <li><Link to="/newsletter" className="hover:text-[#fef6f1] block">Newsletter</Link></li>
            <li><Link to="/faq" className="hover:text-[#fef6f1] block">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-[#fef6f1] mb-2 sm:mb-3 text-[10px] sm:text-[11px] uppercase tracking-widest">Company</div>
          <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-[12px]">
            <li><Link to="/about" className="hover:text-[#fef6f1] block">About</Link></li>
            <li><Link to="/contact" className="hover:text-[#fef6f1] block">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-[#fef6f1] block">FAQ</Link></li>
            <li><Link to="/disclosure" className="hover:text-[#fef6f1] block">Disclosure</Link></li>
            <li><Link to="/privacy" className="hover:text-[#fef6f1] block">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#fef6f1]/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-[11px] text-[#fef6f1]/50 flex flex-col sm:flex-row justify-between gap-1">
          <div>&copy; 2026 Investing and Retirement Media LLC. All rights reserved.</div>
          <div className="text-right">Advertiser Disclosure: We may be compensated when you click on partner links.</div>
        </div>
      </div>
    </footer>
  );
}

const RootLayout = () => (
  <div className="min-h-screen flex flex-col bg-[#fef6f1] text-[14px] text-black">
    <ScrollToTop />
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center">
      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
        404: Page Not Found
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
        We could not find that page
      </h1>
      <p className="text-sm sm:text-base text-black/70 leading-relaxed mb-6 max-w-xl mx-auto">
        The link you followed may be broken, or the page has moved. Try one of the
        sections below, or head back to the homepage.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link to="/" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] uppercase tracking-wide transition-colors">
          Home
        </Link>
        <Link to="/bank-accounts" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45] uppercase tracking-wide transition-colors">
          Bank Accounts
        </Link>
        <Link to="/investing" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45] uppercase tracking-wide transition-colors">
          Investing
        </Link>
        <Link to="/guides" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45] uppercase tracking-wide transition-colors">
          Guides
        </Link>
        <Link to="/reviews" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45] uppercase tracking-wide transition-colors">
          All Reviews
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
