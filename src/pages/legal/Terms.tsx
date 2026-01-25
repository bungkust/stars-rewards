import { useEffect } from 'react';
import { H1Header } from '../../components/design-system/H1Header';
import { AppCard } from '../../components/design-system/AppCard';
import { browserService } from '../../services/browserService';

const Terms = () => {
    const TERMS_URL = 'https://star-habit.kulino.tech/terms';

    useEffect(() => {
        // Automatically try to open the external URL
        browserService.openUrl(TERMS_URL);
    }, []);

    return (
        <div className="flex flex-col gap-6 pb-24 p-4 max-w-4xl mx-auto">
            <H1Header>Terms of Service</H1Header>

            <AppCard>
                <div className="prose prose-sm sm:prose-base max-w-none p-4 text-center">
                    <p className="mb-6">
                        You are being redirected to our latest Terms of Service.
                        If the page doesn't open automatically, please click the button below.
                    </p>

                    <button
                        onClick={() => browserService.openUrl(TERMS_URL)}
                        className="btn btn-primary rounded-xl"
                    >
                        Open Terms of Service
                    </button>

                    <div className="divider my-8">Previous Version (Archive)</div>

                    <div className="text-left opacity-50 grayscale scale-95 origin-top">
                        <p className="text-sm text-gray-500 mb-4">Last updated: December 6, 2025</p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using the Star Habit application (the "App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App. The App is owned and operated by <strong>Kulinotech</strong>.
                        </p>

                        <h3>2. Use of the App</h3>
                        <p>
                            You are responsible for your use of the App and for any content you provide, including compliance with applicable laws, rules, and regulations. You may not use the App for any illegal or unauthorized purpose.
                        </p>

                        <h3>3. User Accounts</h3>
                        <p>
                            To use certain features of the App, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                        </p>

                        <h3>4. Intellectual Property</h3>
                        <p>
                            The App and its original content, features, and functionality are and will remain the exclusive property of Kulinotech and its licensors. The App is protected by copyright, trademark, and other laws.
                        </p>

                        <h3>5. Termination</h3>
                        <p>
                            We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>

                        <h3>6. Limitation of Liability</h3>
                        <p>
                            In no event shall Kulinotech, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the App.
                        </p>

                        <h3>7. Governing Law</h3>
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.
                        </p>

                        <h3>8. Changes</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised terms.
                        </p>

                        <h3>9. Contact Us</h3>
                        <p>
                            If you have any questions about these Terms, please contact us:
                        </p>
                        <p>
                            Email: support@kulino.tech<br />
                            Address: Dusun ngemplak, donoharjo, bantul, seleman yogyakarta
                        </p>
                    </div>
                </div>
            </AppCard>
        </div>
    );
};

export default Terms;
