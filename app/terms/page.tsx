/**
 * Terms of Service - FocusmateApp.app
 * Comprehensive terms following industry standards (Meta, Google, Notion, Slack)
 * Last Updated: 2025
 */

'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Focusmate. These Terms of Service ("Terms") govern your access to and use of 
                Focusmate's website, services, and applications (collectively, the "Service") operated by 
                Focusmate ("we," "us," or "our"). By accessing or using our Service, you agree to be bound 
                by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account, accessing, or using Focusmate, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated 
                herein by reference. If you are entering into these Terms on behalf of an organization, you 
                represent that you have the authority to bind that organization to these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You must be at least 13 years old (or the minimum age required in your jurisdiction) to use 
                our Service. By using the Service, you represent and warrant that you meet this age requirement.
              </p>
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Focusmate is an accountability platform that connects users for focused work sessions. Our 
                Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Real-time session matching with accountability partners</li>
                <li>Focus timer and session tracking tools</li>
                <li>Progress monitoring and analytics</li>
                <li>Communication features for session coordination</li>
                <li>Gamification elements including streaks, achievements, and rewards</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, 
                with or without notice.
              </p>
            </section>

            {/* 3. User Accounts and Registration */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed">
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Account Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for maintaining the confidentiality of your account credentials. 
                You agree not to share your account credentials with any third party. We are not liable for 
                any loss or damage arising from your failure to protect your account information.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time through your account settings. We reserve the right 
                to suspend or terminate your account at any time, with or without notice, for violations of 
                these Terms or for any other reason we deem necessary to protect the Service or other users.
              </p>
            </section>

            {/* 4. Acceptable Use Policy */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">4. Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Permitted Uses</h3>
              <p className="text-muted-foreground leading-relaxed">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. 
                You may use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Connect with accountability partners for focused work sessions</li>
                <li>Track and monitor your productivity and progress</li>
                <li>Communicate respectfully with other users</li>
                <li>Access features and tools provided by the Service</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Prohibited Conduct</h3>
              <p className="text-muted-foreground leading-relaxed">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Violate any applicable local, state, national, or international law or regulation</li>
                <li>Harass, abuse, intimidate, threaten, or harm other users</li>
                <li>Share or transmit any content that is illegal, harmful, threatening, abusive, defamatory, 
                    obscene, or otherwise objectionable</li>
                <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation 
                    with any person or entity</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service or any other systems 
                    or networks connected to the Service</li>
                <li>Use automated scripts, bots, or other automated means to access the Service</li>
                <li>Collect or harvest information about other users without their consent</li>
                <li>Use the Service for any commercial purpose without our prior written consent</li>
                <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
                <li>Remove any copyright, trademark, or other proprietary notices from the Service</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Session Conduct</h3>
              <p className="text-muted-foreground leading-relaxed">
                During focus sessions, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Respect your accountability partner and maintain a professional environment</li>
                <li>Adhere to scheduled session times</li>
                <li>Use session communication features appropriately and respectfully</li>
                <li>Report any inappropriate behavior or violations to our support team</li>
              </ul>
            </section>

            {/* 5. User Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">5. User Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Your Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you create, upload, or submit to the Service ("User Content"). 
                By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, perpetual, 
                irrevocable, and sublicensable license to use, reproduce, modify, adapt, publish, translate, 
                create derivative works from, distribute, and display such User Content in connection with 
                operating and providing the Service.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Our Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Service, including its original content, features, functionality, design, logos, trademarks, 
                and other intellectual property, is owned by Focusmate and protected by international copyright, 
                trademark, patent, trade secret, and other intellectual property laws. You may not use our 
                intellectual property without our prior written permission.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Content Responsibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for your User Content. We do not endorse or assume responsibility 
                for any User Content. We reserve the right to remove any User Content that violates these 
                Terms or that we otherwise find objectionable.
              </p>
            </section>

            {/* 6. Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">6. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our collection, use, and disclosure of your personal information 
                is governed by our <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">Privacy Policy</Link>, 
                which is incorporated into these Terms by reference. By using the Service, you consent to the 
                collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            {/* 7. Payment and Subscription Terms */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">7. Payment and Subscription Terms</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Free Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Focusmate currently offers a free service tier. We reserve the right to introduce paid 
                subscription plans in the future, which will be subject to additional terms and conditions.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Future Payment Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                If we introduce paid services, the following terms will apply:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>All fees are stated in the currency specified at the time of purchase</li>
                <li>Fees are due in advance for the billing period</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change our pricing with 30 days' notice</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </section>

            {/* 8. Session Matching and Availability */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">8. Session Matching and Availability</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Matching Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Focusmate uses algorithms and user preferences to match you with accountability partners. 
                We do not guarantee that you will be matched for every session request. Matching availability 
                depends on factors including user demand, time of day, and your preferences.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.2 No Guarantee of Matches</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide reliable matching services, we do not guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Availability of matches at any specific time</li>
                <li>Compatibility with matched partners</li>
                <li>Quality or outcome of focus sessions</li>
                <li>Continuous availability of the matching service</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Session Cancellations</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel a scheduled session through the Service. We encourage you to cancel as early 
                as possible to allow your matched partner to find an alternative session. Repeated late 
                cancellations or no-shows may result in restrictions on your account.
              </p>
            </section>

            {/* 9. Third-Party Services and Links */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">9. Third-Party Services and Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites, services, or resources that are not 
                owned or controlled by Focusmate. We are not responsible for the content, privacy policies, 
                or practices of any third-party services. You acknowledge and agree that we shall not be 
                liable for any damage or loss caused by your use of any third-party service.
              </p>
            </section>

            {/* 10. Disclaimers and Warranties */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">10. Disclaimers and Warranties</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">10.1 Service Provided "As Is"</h3>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">10.2 No Guarantees</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>Any defects or errors will be corrected</li>
                <li>The Service is free of viruses or other harmful components</li>
                <li>The results of using the Service will meet your requirements</li>
              </ul>
            </section>

            {/* 11. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">11. Limitation of Liability</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Limitation</h3>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FOCUSMATE, ITS 
                AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY 
                INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING 
                WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE 
                LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Maximum Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL LIABILITY FOR ANY CLAIMS 
                UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS 
                PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER 
                IS GREATER.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.3 Exceptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Some jurisdictions do not allow the exclusion or limitation of incidental or consequential 
                damages, so the above limitation or exclusion may not apply to you. In such jurisdictions, 
                our liability shall be limited to the maximum extent permitted by law.
              </p>
            </section>

            {/* 12. Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">12. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Focusmate and its affiliates, officers, 
                directors, employees, and agents from and against any claims, liabilities, damages, losses, 
                and expenses, including without limitation reasonable attorney's fees, arising out of or in 
                any way connected with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party right, including without limitation any intellectual 
                    property right or privacy right</li>
                <li>Your User Content</li>
              </ul>
            </section>

            {/* 13. Termination */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">13. Termination</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">13.1 Termination by You</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account and stop using the Service at any time by deleting your 
                account through your account settings or by contacting us at{' '}
                <a href="mailto:support@focusmateapp.app" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  support@focusmateapp.app
                </a>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">13.2 Termination by Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without 
                prior notice or liability, for any reason, including without limitation if you breach 
                these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">13.3 Effect of Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, all provisions of these Terms which by their nature should survive 
                termination shall survive, including without limitation ownership provisions, warranty 
                disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            {/* 14. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days' notice prior to any new terms 
                taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By continuing to access or use our Service after those revisions become effective, you agree 
                to be bound by the revised terms. If you do not agree to the new terms, please stop using 
                the Service.
              </p>
            </section>

            {/* 15. Governing Law and Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">15. Governing Law and Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">15.1 Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which Focusmate operates, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">15.2 Dispute Resolution</h3>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising out of or relating to these Terms or the Service shall be resolved 
                through good faith negotiation. If we cannot resolve a dispute through negotiation, you agree 
                that disputes shall be resolved through binding arbitration or in the courts of our 
                jurisdiction, as applicable.
              </p>
            </section>

            {/* 16. General Provisions */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">16. General Provisions</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">16.1 Entire Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and Focusmate regarding the Service and supersede all prior agreements and understandings.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">16.2 Severability</h3>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is held to be invalid or unenforceable, such provision 
                shall be struck and the remaining provisions shall be enforced.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">16.3 Waiver</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver 
                of those rights.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">16.4 Assignment</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may not assign or transfer these Terms, by operation of law or otherwise, without our 
                prior written consent. We may assign or transfer these Terms at any time without consent.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">16.5 Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:{' '}
                <a href="mailto:support@focusmateapp.app" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  support@focusmateapp.app
                </a>
              </p>
            </section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                By using Focusmate, you acknowledge that you have read, understood, and agree to be bound by 
                these Terms of Service.
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
