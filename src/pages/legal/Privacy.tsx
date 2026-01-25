import { useEffect } from 'react';
import { H1Header } from '../../components/design-system/H1Header';
import { AppCard } from '../../components/design-system/AppCard';
import { browserService } from '../../services/browserService';

const Privacy = () => {
    const POLICY_URL = 'https://star-habit.kulino.tech/privacy';

    useEffect(() => {
        // Automatically try to open the external URL
        browserService.openUrl(POLICY_URL);
    }, []);

    return (
        <div className="flex flex-col gap-6 pb-24 p-4 max-w-4xl mx-auto">
            <H1Header>Privacy Policy</H1Header>

            <AppCard>
                <div className="prose prose-sm sm:prose-base max-w-none p-4 text-center">
                    <p className="mb-6">
                        You are being redirected to our latest Privacy Policy.
                        If the page doesn't open automatically, please click the button below.
                    </p>

                    <button
                        onClick={() => browserService.openUrl(POLICY_URL)}
                        className="btn btn-primary rounded-xl"
                    >
                        Open Privacy Policy
                    </button>

                    <div className="divider my-8">Previous Version (Archive)</div>

                    <div className="text-left opacity-50 grayscale scale-95 origin-top">
                        <p className="text-sm text-gray-500 mb-4">Last updated: December 6, 2025</p>

                        <h3>1. Introduction</h3>
                        <p>
                            Welcome to Star Habit ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our mobile application (the "App"). This Privacy Policy applies to <strong>Star Habit</strong>, owned and operated by <strong>Kulinotech</strong>.
                        </p>

                        <h3>2. Information We Collect</h3>
                        <p>
                            We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include:
                        </p>
                        <ul>
                            <li>Account information (e.g., name, email address)</li>
                            <li>Family profile information (e.g., children's names, avatars)</li>
                            <li>Task and reward data generated through use of the App</li>
                        </ul>

                        <h3>3. How We Use Your Information</h3>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, maintain, and improve our App</li>
                            <li>Process transactions and send related information</li>
                            <li>Send you technical notices, updates, security alerts, and support messages</li>
                            <li>Respond to your comments, questions, and requests</li>
                        </ul>

                        <h3>4. Data Storage and Security</h3>
                        <p>
                            Star Habit is primarily a local-first application. Most of your data is stored directly on your device. When you choose to backup your data, it is stored in a format that you control. We implement reasonable security measures to protect your information.
                        </p>

                        <h3>5. Children's Privacy</h3>
                        <p>
                            Our App is designed for families and may be used by children under parental supervision. We do not knowingly collect personal information from children without parental consent. If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us.
                        </p>

                        <h3>6. Changes to this Policy</h3>
                        <p>
                            We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
                        </p>

                        <h3>7. Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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

export default Privacy;
