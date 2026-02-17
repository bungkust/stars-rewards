# Google Play Console Form Answers

## App Content

**Does your app function differently based on a user's geolocation or language?**
*   **No**
    *   *Reasoning:* The app provides the same core functionality (habit tracking, rewards, quizzes) to all users regardless of their location. While the app may contain multilingual content (English, Indonesian, Arabic for quizzes), the *functionality* itself does not change based on the user's device location or system language settings.

**App Login Wall**
*   **Selection:** "I have content locked behind a login wall and have not yet provided Google with valid credentials to bypass this wall."
    *   *Action Required:* You must provide Google with a demo account or, in this case, a **PIN** to access the "Parent/Admin" mode.
    *   *Credentials to Provide:*
        *   **Username:** (N/A - Local Auth)
        *   **Password/PIN:** [Your Test PIN here, e.g., 1234]
        *   **Instructions:** "The app is locally authenticated. Upon launch, complete the family setup if prompted. To access the 'Parent' area (Admin), click the toggle/lock icon and enter the PIN provided above."

## User Data, 3rd Party Code, and SDKs

**What SDKs does your app use and why?**
*   **Capacitor (Core, Android, iOS)**: Used as the cross-platform runtime to bridge the web app with native device features (Camera, File System, Biometrics, Local Notifications).
*   **Capacitor Plugins (@capacitor/camera, @capacitor/filesystem, etc.)**: To access specific hardware features required for the app's core functionality (taking photos for tasks, saving backups).
*   **Google API Client (gapi-script)**: Used for the "Google Drive Backup & Restore" feature, allowing users to safely back up their data to their own Google Drive.
*   **Bio-Auth (capacitor-native-biometric)**: Used to secure the Parent/Admin section of the app.
*   **React / React DOM**: The core UI framework for building the application interface.
*   **Zustand**: Used for local state management within the app.
*   **Recharts**: Used to display activity and progress charts in the user statistics.

**Explain how you ensure that any 3rd party code and SDKs used in your app comply with our policies.**
"We strictly use reputable, well-maintained, and open-source SDKs (primarily the Capacitor ecosystem and standard React libraries) that are essential for the app's core functionality. We have verified that:
1.  **Data Minimization:** These SDKs are configured to access only the data necessary for their specific features (e.g., Camera only when taking a photo, Drive only when the user explicitly initiates a backup, Biometrics strictly for local authentication).
2.  **User Consent:** Sensitive features like Biometrics and Google Drive access are gated behind explicit user permissions and consent flows.
3.  **No Unauthorized Data Collection:** We do not use any SDKs for undisclosed tracking, advertising, or compiling user profiles. All data handling is local to the device or directly between the user and their personal Google Drive."
