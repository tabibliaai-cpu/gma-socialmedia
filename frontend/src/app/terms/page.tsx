export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-[#71767b] mb-8">Last updated: March 2026</p>
        
        <div className="space-y-6 text-[#e7e9ea]">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using GPM ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">2. Use of Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#71767b]">
              <li>In any way that violates applicable laws or regulations</li>
              <li>To transmit any advertising or promotional material without our prior consent</li>
              <li>To impersonate or attempt to impersonate any person or entity</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the Service</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">3. User Content</h2>
            <p>You retain ownership of any content you submit, post, or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, and distribute your content in connection with the Service.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">4. Account Security</h2>
            <p>You are responsible for safeguarding the password that you use to access the Service. You agree not to disclose your password to any third party.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">5. Termination</h2>
            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">6. Limitation of Liability</h2>
            <p>In no event shall GPM, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">7. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@gpm.social</p>
          </section>
        </div>
      </div>
    </div>
  );
}
