/**
 * Privacy Policy - FocusmateApp.app
 * Comprehensive privacy policy following GDPR/CCPA compliance standards
 * Last Updated: 2025
 */

'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                At Focusmate ("we," "us," or "our"), we are committed to protecting your privacy and ensuring 
                the security of your personal information. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our website, services, and applications 
                (collectively, the "Service"). Please read this Privacy Policy carefully to understand our 
                practices regarding your personal data.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using our Service, you consent to the data practices described in this Privacy Policy. 
                If you do not agree with the data practices described in this Privacy Policy, you should 
                not use the Service.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Information You Provide to Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information that you voluntarily provide when you register for an account, use 
                the Service, or communicate with us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Account Information:</strong> Name, email address, password (hashed), phone number (optional), 
                    profile picture, and other profile information</li>
                <li><strong>Session Data:</strong> Focus topics, study goals, session duration, session notes, 
                    and productivity metrics</li>
                <li><strong>Communication Data:</strong> Messages, chat history, and other communications within 
                    the Service</li>
                <li><strong>Preferences:</strong> Notification settings, privacy preferences, and account 
                    configuration</li>
                <li><strong>Support Information:</strong> Information you provide when contacting our support team</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Information We Collect Automatically</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use our Service, we automatically collect certain information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, 
                    clickstream data, and navigation patterns</li>
                <li><strong>Device Information:</strong> Device type, operating system, browser type and version, 
                    IP address, unique device identifiers, and mobile network information</li>
                <li><strong>Log Data:</strong> Server logs, error logs, access times, and diagnostic information</li>
                <li><strong>Location Data:</strong> General location information based on IP address (country/region level)</li>
                <li><strong>Cookies and Tracking Technologies:</strong> See Section 6 for detailed information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Information from Third Parties</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may receive information about you from third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Authentication services (if you log in using third-party credentials)</li>
                <li>Analytics and monitoring services</li>
                <li>Payment processors (if we introduce paid services)</li>
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Create and manage your account</li>
                <li>Provide session matching and accountability partner connections</li>
                <li>Enable communication features and real-time collaboration</li>
                <li>Track and display your progress, streaks, and achievements</li>
                <li>Process transactions and manage subscriptions (if applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Service Improvement</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Analyze usage patterns to improve our algorithms and matching systems</li>
                <li>Develop new features and enhance existing functionality</li>
                <li>Conduct research and analytics to better understand user needs</li>
                <li>Test and troubleshoot technical issues</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Communication</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Send you service-related notifications (session matches, reminders, updates)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you administrative information, updates, and security alerts</li>
                <li>Provide marketing communications (with your consent, and you can opt out at any time)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Security and Compliance</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Detect, prevent, and address fraud, security breaches, and technical issues</li>
                <li>Enforce our Terms of Service and other policies</li>
                <li>Comply with legal obligations and respond to legal requests</li>
                <li>Protect the rights, property, and safety of Focusmate, our users, and others</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.5 Legal Basis for Processing (GDPR)</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the European Economic Area (EEA) or United Kingdom (UK), we process 
                your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Contract Performance:</strong> To provide the Service and fulfill our contractual 
                    obligations to you</li>
                <li><strong>Legitimate Interests:</strong> To improve our Service, ensure security, and 
                    prevent fraud</li>
                <li><strong>Consent:</strong> For marketing communications and optional features</li>
                <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            {/* 3. How We Share Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">3. How We Share Your Information</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Service-Related Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We share certain information to provide the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Matched Partners:</strong> When you are matched with an accountability partner, 
                    we share your name, profile picture (if provided), and focus topic for that session</li>
                <li><strong>Session Participants:</strong> During active sessions, participants can see 
                    your session status and activity</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information with third-party service providers who perform services on 
                our behalf:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Cloud hosting and infrastructure providers</li>
                <li>Email service providers for transactional and marketing emails</li>
                <li>Analytics and monitoring services</li>
                <li>Payment processors (if applicable)</li>
                <li>Customer support platforms</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These service providers are contractually obligated to use your information only as 
                necessary to provide services to us and in accordance with this Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information if required by law or in response to valid requests:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>To comply with legal obligations, court orders, or government requests</li>
                <li>To enforce our Terms of Service and other agreements</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>To investigate potential violations or fraud</li>
                <li>In connection with a business transfer (merger, acquisition, or sale of assets)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.4 With Your Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information with third parties when you explicitly consent to such sharing.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.5 Aggregated and De-identified Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share aggregated, anonymized, or de-identified information that cannot reasonably 
                be used to identify you for research, analytics, or other purposes.
              </p>
            </section>

            {/* 4. Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">4. Data Security</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Security Measures</h3>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Encryption:</strong> Data encryption in transit (TLS/SSL) and at rest</li>
                <li><strong>Authentication:</strong> Secure password hashing and authentication mechanisms</li>
                <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li><strong>Network Security:</strong> Firewalls, intrusion detection, and regular security audits</li>
                <li><strong>Regular Updates:</strong> Keeping our systems and software up to date with 
                    security patches</li>
                <li><strong>Employee Training:</strong> Security awareness training for employees and 
                    contractors with access to personal data</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Data Breach Notification</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a data breach that poses a risk to your rights and freedoms, we will notify 
                the relevant supervisory authority within 72 hours (as required by GDPR) and affected users 
                without undue delay, where technically feasible.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.3 No Absolute Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to protect your personal information, no method of transmission over the 
                Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but 
                we are committed to maintaining reasonable security measures and promptly addressing any 
                security issues.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required or permitted 
                by law:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable 
                    period after account deletion to comply with legal obligations and resolve disputes</li>
                <li><strong>Session Data:</strong> Retained to provide historical progress tracking and 
                    analytics, deleted upon account deletion</li>
                <li><strong>Communication Data:</strong> Retained for the duration of active sessions and 
                    a limited period thereafter</li>
                <li><strong>Log Data:</strong> Retained for security and troubleshooting purposes, typically 
                    for 90 days to 1 year</li>
                <li><strong>Legal Obligations:</strong> Some data may be retained longer if required by 
                    law, court order, or to resolve disputes</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Upon account deletion, we will delete or anonymize your personal information within 30 days, 
                except where we are required to retain it for legal purposes.
              </p>
            </section>

            {/* 6. Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">6. Cookies and Tracking Technologies</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">6.1 What Are Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. We use cookies 
                and similar tracking technologies to enhance your experience, analyze usage, and provide 
                personalized content.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Types of Cookies We Use</h3>
              
              <h4 className="text-lg font-semibold mt-4 mb-2">Essential Cookies</h4>
              <p className="text-muted-foreground leading-relaxed">
                Required for the Service to function properly. These cannot be disabled.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Authentication cookies (session management)</li>
                <li>Security cookies (CSRF protection, fraud prevention)</li>
                <li>Load balancing cookies</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4 mb-2">Functional Cookies</h4>
              <p className="text-muted-foreground leading-relaxed">
                Enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Preference cookies (theme, language, settings)</li>
                <li>Feature cookies (remembering your choices)</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4 mb-2">Analytics Cookies</h4>
              <p className="text-muted-foreground leading-relaxed">
                Help us understand how visitors interact with the Service.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Usage analytics (page views, session duration)</li>
                <li>Performance monitoring</li>
                <li>Error tracking</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Third-Party Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Error monitoring services (e.g., Sentry)</li>
                <li>Performance monitoring tools</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.4 Cookie Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Block or delete cookies</li>
                <li>Set preferences for specific websites</li>
                <li>Receive notifications when cookies are set</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Note:</strong> Disabling essential cookies may affect the functionality of the Service.
              </p>
            </section>

            {/* 7. Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">7. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Access and Portability</h3>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured, commonly used, 
                    and machine-readable format</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Correction and Deletion</h3>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete personal data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Restriction and Objection</h3>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests or 
                    for direct marketing purposes</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.4 Withdraw Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                Where processing is based on consent, you have the right to withdraw your consent at any time, 
                without affecting the lawfulness of processing based on consent before withdrawal.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.5 California Privacy Rights (CCPA)</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer 
                Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Right to Know:</strong> Request disclosure of personal information collected, 
                    used, and shared</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do 
                    not sell personal information)</li>
                <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising 
                    your privacy rights</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.6 Exercising Your Rights</h3>
              <p className="text-muted-foreground leading-relaxed">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:support@focusmateapp.app" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  support@focusmateapp.app
                </a>. We will respond to your request within 30 days (or as required by applicable law). 
                We may need to verify your identity before processing your request.
              </p>
            </section>

            {/* 8. Email Communication */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">8. Email Communication</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Transactional Emails</h3>
              <p className="text-muted-foreground leading-relaxed">
                We send essential service-related emails that you cannot opt out of, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Account verification and password reset emails</li>
                <li>Session match notifications and reminders</li>
                <li>Important service updates and security alerts</li>
                <li>Responses to your support requests</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Marketing Emails</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may send you marketing emails with your consent. You can opt out at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Clicking the "unsubscribe" link in any marketing email</li>
                <li>Updating your email preferences in your account settings</li>
                <li>Contacting us at{' '}
                  <a href="mailto:support@focusmateapp.app" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    support@focusmateapp.app
                  </a>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Email Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our emails may contain tracking pixels or links that allow us to track open rates and 
                click-through rates. This helps us improve our communications and understand user engagement.
              </p>
            </section>

            {/* 9. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country 
                of residence. These countries may have data protection laws that differ from those in your 
                country. We take appropriate safeguards to ensure that your personal information receives 
                an adequate level of protection:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Using standard contractual clauses approved by the European Commission</li>
                <li>Relying on adequacy decisions by relevant data protection authorities</li>
                <li>Implementing appropriate technical and organizational security measures</li>
              </ul>
            </section>

            {/* 10. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for children under 13 years of age (or the minimum age required 
                in your jurisdiction). We do not knowingly collect personal information from children under 
                13. If we learn that we have collected personal information from a child under 13, we will 
                delete that information promptly. If you believe we have collected information from a child 
                under 13, please contact us immediately.
              </p>
            </section>

            {/* 11. Changes to This Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Posting the updated Privacy Policy on this page with a new "Last Updated" date</li>
                <li>Sending an email notification to registered users (for material changes)</li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your continued use of the Service after changes become effective constitutes acceptance of 
                the updated Privacy Policy. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* 12. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mt-12 mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@focusmateapp.app" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    support@focusmateapp.app
                  </a>
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Subject Line:</strong> Privacy Policy Inquiry
                </p>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Data Protection Officer (GDPR)</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the EEA or UK and have questions about data protection, you may also 
                contact your local data protection authority or our Data Protection Officer at the email 
                address above.
              </p>
            </section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                This Privacy Policy is effective as of the date listed above and applies to all users of 
                the Focusmate Service.
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
