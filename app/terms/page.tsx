import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Focusmate, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please 
                do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
              <p className="text-muted-foreground">
                You agree to use Focusmate only for lawful purposes and in a way that does not 
                infringe the rights of, restrict or inhibit anyone else's use and enjoyment of 
                the service. Prohibited behavior includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Harassing or abusing other users</li>
                <li>Sharing inappropriate or offensive content</li>
                <li>Attempting to gain unauthorized access to the service</li>
                <li>Using the service for any illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account. You agree to notify us 
                immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Session Matching</h2>
              <p className="text-muted-foreground">
                Focusmate matches users based on availability and preferences. We do not guarantee 
                a match for every session request. Users are expected to respect their matched 
                partners and maintain a professional, respectful environment during sessions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Focusmate is provided "as is" without warranties of any kind. We are not liable 
                for any indirect, incidental, special, or consequential damages arising from 
                your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of 
                any material changes. Your continued use of the service after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us at:{' '}
                <a 
                  href="mailto:support@focusmateapp.app" 
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  support@focusmateapp.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

