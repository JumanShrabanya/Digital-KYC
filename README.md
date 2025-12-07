# Digital KYC Onboarding Portal

A modern, user-friendly KYC (Know Your Customer) onboarding flow built with Next.js, designed to streamline customer verification while improving completion rates and reducing abandonment.

## 🔗 Live Link

[https://digital-kyc-eight.vercel.app]

## ✨ Key Features

- **5-Step Guided Process**: Clear, linear flow from document selection to final verification
- **Document Scanning & Validation**: Real-time quality checks with instant feedback
- **Face Match Technology**: Compares live selfie with uploaded ID photo
- **Real-time Status Updates**: Immediate feedback on verification steps
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Simulated Backend**: Mock API endpoints for demonstration purposes

## 🚀 Getting Started

### Prerequisites
- Node.js 16.14.0 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd digital_kyc
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔍 Demo Notes

> ⚠️ **IMPORTANT DEMO NOTICE**  
> All quality checks, validations, and verifications in this demo are **simulated** for demonstration purposes only. This is not a production-ready KYC solution.  
> 
> **No actual verification** of documents or identity is performed. The system uses randomized data to simulate a real KYC process.  
> Please do not upload any sensitive or real personal documents.

### 🎭 Simulated Functionality (For Demo Only)

The following features are **simulated** and do not perform actual verification:

- **Document Quality Scoring**: Random scores between 0-100
- **Face Matching Algorithm**: Simulated match scores (not real facial recognition)
- **Duplicate KYC Checks**: Random results with sample customer IDs
- **Final KYC Decision**: Based on simulated risk factors
- **File Uploads**: Converted to base64 but **not stored** or verified

### ⚠️ Important Limitations

- **No Real Verification**: This is a frontend demo only
- **No Data Persistence**: All data is stored in the browser's localStorage and can be cleared
- **Not for Production**: This is a prototype, not a secure KYC solution
- **Test Data Only**: Use sample or dummy data for testing

### Test Data
- Use any image files for document uploads
- The system simulates processing times and random success/failure scenarios
- Face matching uses a random score generator (not actual facial recognition)

## 🎯 How This Solves Key Challenges

### 1. Fewer Abandonments
- **Progressive Disclosure**: Only shows relevant fields at each step
- **Clear Progress**: Visual stepper shows completion status
- **Auto-save**: Progress is maintained if the user leaves and returns
- **Mobile Optimization**: Touch-friendly interface works on all devices

### 2. Faster TAT (Turn-Around Time)
- **Parallel Processing**: Multiple verification steps happen simultaneously
- **Instant Feedback**: Real-time validation prevents submission errors
- **Smart Defaults**: Reduces unnecessary data entry
- **Auto-advance**: System automatically moves to next step when ready

### 3. Clearer Next-Step Visibility
- **Step Indicators**: Always shows current position in the flow
- **Action Buttons**: Clear primary actions with disabled states when not ready
- **Status Badges**: Visual indicators for completed/in-progress/failed steps
- **Help Text**: Contextual guidance at each step

### 4. Fewer Re-submissions
- **Pre-submission Validation**: Catches errors before submission
- **Quality Checks**: Verifies document quality before upload
- **Comprehensive Review**: Final summary before submission
- **Error Recovery**: Clear instructions for fixing issues

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **State Management**: React Hooks (useState, useContext)
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **API Routes**: Next.js API Routes
- **Build Tool**: Vite (via next-vite)

## 📂 Project Structure

```
.
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   │   ├── check/          # Verification endpoints
│   │   └── upload/         # File upload endpoints
│   └── page.jsx            # Main page component
├── components/             # Reusable components
│   ├── StepDocumentSelection.jsx
│   ├── StepPhotoFaceMatch.jsx
│   ├── StepReviewStatus.jsx
│   ├── StepScanDocument.jsx
│   ├── StepUploadDocument.jsx
│   └── Stepper.jsx
├── lib/
│   └── kyc/
│       └── simulation.js   # Mock business logic
└── public/                 # Static assets
```


## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
