import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name and email address</li>
                <li>Profile information and preferences</li>
                <li>Session data and focus goals</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and improve our services</li>
                <li>Match you with accountability partners</li>
                <li>Send you notifications and updates</li>
                <li>Analyze usage patterns and trends</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information. 
                All data is encrypted in transit and at rest. We do not share your personal 
                information with third parties except as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of certain communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:{' '}
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

