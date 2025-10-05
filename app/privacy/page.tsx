import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-gold hover:text-gold-light">
            ← Back to Home
          </Link>
        </div>

        <div className="card">
          <h1 className="text-4xl font-bold mb-6 text-gold">Privacy Policy</h1>
          <p className="text-sm text-muted mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                When you use HoldMyTime, we collect the following information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Email address when you sign up via Google OAuth or magic link</li>
                <li><strong>Business Information:</strong> Business name, contact email, phone number, and service details</li>
                <li><strong>Booking Information:</strong> Customer name, email, phone, service details, and appointment information</li>
                <li><strong>Payment Information:</strong> Payment data is processed by Stripe. We do not store credit card information</li>
                <li><strong>Usage Data:</strong> Information about how you use our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our booking service</li>
                <li>Process payments and subscriptions via Stripe</li>
                <li>Send booking confirmations and service notifications</li>
                <li>Improve and optimize our service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">3. Information Sharing</h2>
              <p className="mb-3">We share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Stripe:</strong> For payment processing and Connect account management</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Google:</strong> For OAuth authentication</li>
                <li><strong>Service Providers:</strong> Your booking information is shared with the business you're booking with</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. Payment data is
                encrypted and processed securely through Stripe. However, no method of transmission over the internet
                is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, go to your account settings or contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">6. Cookies and Tracking</h2>
              <p>
                We use essential cookies for authentication and session management. We do not use third-party
                advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">7. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services.
                When you delete your account, we delete your personal information within 30 days, except where
                required by law to retain it longer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">8. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect information from
                children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gold mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this privacy policy, please contact us at:{' '}
                <a href="mailto:privacy@holdmytime.io" className="text-gold hover:underline">
                  privacy@holdmytime.io
                </a>
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gold hover:text-gold-light">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
