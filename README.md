# ClinicCMS - Modern Clinic Management System

**ClinicCMS** is a full-stack SaaS solution designed to streamline healthcare facility operations. It features dedicated portals for Patients, Doctors, Pharmacists, and Lab Technicians, providing a seamless workflow from appointment booking to prescription dispensing.

![ClinicCMS Banner](https://via.placeholder.com/1200x400?text=ClinicCMS+Dashboard+Preview)

## 🚀 Key Features

### 🏥 Patient Portal
*   **Smart Booking Wizard**: Multi-step intuitive booking process.
*   **Family Management**: Book appointments for self or family members.
*   **History**: View past prescriptions and lab reports.
*   **Mobile First**: Responsive design for easy access on any device.

### 👨‍⚕️ Doctor Workspace
*   **Live Queue**: Real-time view of waiting patients with status indicators.
*   **Consultation Suite**: Digital prescription pad with auto-complete for medicines.
*   **Lab Orders**: One-click lab test requests.
*   **Patient History**: Instant access to previous visit records during consultation.
*   **Printable Rx**: Professional, standard-format prescription printing.

### 💊 Pharmacy Dashboard
*   **Dispensing Queue**: Real-time list of patients sent by doctors.
*   **Prescription Viewer**: Clear view of prescribed medicines and dosages.
*   **Status Tracking**: Mark items as dispensed to update the central record.

### 🧪 Laboratory Interface
*   **Test Requests**: View incoming lab test requests from doctors.
*   **Result Management**: Upload or enter test results.
*   **Technician Assignment**: Track which staff processed the request.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), Tailwind CSS
*   **Backend**: Next.js (App Router), Node.js
*   **Database**: MongoDB (via Prisma ORM)
*   **Authentication**: Custom Role-Based Auth (JWT/Session) / OTP (Twilio)
*   **Deployment**: Vercel (Frontend & Serverless Functions)

---

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Connection String (Atlas or Local)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/lezinhere/clinic-cms.git
    cd clinic-cms
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="mongodb+srv://..."
    NEXT_PUBLIC_API_URL="/api"
    # Add other provider keys (Twilio, etc.) if used
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    npm run seed  # Optional: Seeds initial admin/doctor data
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## 📂 Project Structure

*   **/client**: React Frontend Application (Vite).
*   **/src**: Next.js Backend/Server actions and API routes.
*   **/prisma**: Database schema and seed scripts.
*   **/scripts**: Build integration scripts (merging client build into Next.js).

---

## 🚢 Deployment

The project is configured for seamless deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the repository in Vercel.
3.  Add the `DATABASE_URL` and other environment variables in Vercel Project Settings.
4.  **Build Command**: The `package.json` is set up to automatically build the client and server:
    ```bash
    npm run build
    ```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature enhancements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
