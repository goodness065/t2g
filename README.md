# Gemini AI Toolkit

A comprehensive Next.js application that provides multiple AI-powered tools using Google's Gemini AI models.

## Features

- **Fraud Detection**: Custom trained AI models for fraud detection
- **Fast Analyzer**: AI-powered image and text analysis
- **Audio Generation**: Text-to-speech with multiple voice options
- **Image Generation**: Create stunning images with Imagen 4.0
- **Video Generation**: Generate high-quality videos from text descriptions
- **Style Assistant**: Wardrobe management and outfit recommendations

## Deployment Setup

### Google Cloud Authentication

For the fraud detection feature to work in production, you need to set up Google Cloud service account credentials:

1. **Create a Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin > Service Accounts
   - Create a new service account or use an existing one
   - Grant the service account the following roles:
     - `Vertex AI User`
     - `Vertex AI Service Agent`

2. **Generate Service Account Key**:
   - Select your service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the JSON file

3. **Set Environment Variable**:
   - In your deployment platform (Vercel, Netlify, etc.), add the environment variable:
   ```
   GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project-id",...}
   ```
   - Copy the entire contents of the downloaded JSON file as the value
   - **Important**: Make sure the JSON is on a single line with no line breaks
   - **Alternative**: You can also base64 encode the JSON file and set it as:
   ```
   GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_encoded_json_content
   ```

4. **Alternative: Use Google Cloud Default Credentials**:
   - If deploying on Google Cloud Platform (Cloud Run, App Engine, etc.), you can use default credentials
   - Remove the `credentials` option from the GoogleAuth constructor in `src/app/api/fraud-detection/route.ts`

### Environment Variables

Set the following environment variables in your deployment platform:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Technologies Used

- Next.js 15.4.3
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Google Vertex AI
- Lucide React Icons
