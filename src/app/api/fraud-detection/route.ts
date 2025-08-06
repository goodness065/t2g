import { GoogleAuth } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";


const ENDPOINT_ID = "5176046645267136512";
const PROJECT_ID = "716466869000";
const LOCATION = "us-central1";

/**
 * Vertex AI Endpoint expects data in this format:
 * {
 *   "instances": [
 *     {
 *       "Time": 109297.0,
 *       "V1": 0.745153216872909,
 *       "V2": 2.8092988741438103,
 *       ...
 *       "V28": 0.38386893861524296,
 *       "Amount": 0.0
 *     }
 *   ]
 * }
 * 
 * Note: All values should be numbers, not strings
 */

interface FraudInstance {
  [key: string]: number;
}

interface FormData {
  amount: number;
  international: number;
  online: number;
  timeofday: number;
  device: number;
}

export async function POST(request: NextRequest) {
  try {
    const { instances, formData } = await request.json();

    if (
      !Array.isArray(instances) ||
      instances.length === 0 ||
      !Array.isArray(instances[0])
    ) {
      return NextResponse.json(
        { error: "'instances' must be an array of feature arrays." },
        { status: 400 }
      );
    }

    const vector: number[] = instances[0];
    if (vector.length < 28) {
      return NextResponse.json(
        { error: `Each instance must have at least 28 features. Received ${vector.length} features.` },
        { status: 400 }
      );
    }

    // Validate form data
    if (!formData || typeof formData.amount !== 'number') {
      return NextResponse.json(
        { error: "Form data with amount is required." },
        { status: 400 }
      );
    }

    // Convert vector to expected dictionary format with individual V1-V28 fields
    const structuredInstance: FraudInstance = {};

    // Use actual form data for Time and Amount
    const amount = formData?.amount || 0;
    const timeofday = formData?.timeofday || 0;
    
    // Calculate time in minutes since start (0-48 hrs) based on timeofday
    // timeofday: 0=morning, 1=afternoon, 2=night
    let timeInMinutes: number;
    switch (timeofday) {
      case 0: // morning (6 AM - 12 PM)
        timeInMinutes = Math.floor(Math.random() * 360) + 360; // 6-12 hours
        break;
      case 1: // afternoon (12 PM - 6 PM)
        timeInMinutes = Math.floor(Math.random() * 360) + 720; // 12-18 hours
        break;
      case 2: // night (6 PM - 6 AM)
        timeInMinutes = Math.floor(Math.random() * 720); // 0-12 hours (night)
        break;
      default:
        timeInMinutes = Math.floor(Math.random() * 172800); // fallback to random
    }

    // Format Time and Amount as numbers
    structuredInstance["Time"] = timeInMinutes;
    structuredInstance["Amount"] = amount;

    // Add V1-V28 as individual named fields
    for (let i = 0; i < 28; i++) {
      structuredInstance[`V${i + 1}`] = vector[i];
    }

    // Log the structured instance for debugging (remove in production)
    console.log("Sending to Vertex AI:", JSON.stringify({
      instances: [structuredInstance]
    }, null, 2));

    // Use service account credentials for deployment
    let credentials;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Handle the JSON string that might have formatting issues
        const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        credentials = JSON.parse(credentialsString);
      } catch (parseError) {
        console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", parseError);
        // Fall back to default credentials
        credentials = undefined;
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
      try {
        // Handle base64 encoded credentials
        const decodedString = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8');
        credentials = JSON.parse(decodedString);
      } catch (parseError) {
        console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_BASE64:", parseError);
        // Fall back to default credentials
        credentials = undefined;
      }
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      credentials: credentials,
    });

    const client = await auth.getClient();

    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}:predict`;

    const response = await client.request({
      url,
      method: "POST",
      data: {
        instances: [structuredInstance],
      },
    });

    const data = response.data as {
      predictions: {
        scores: number[];
        classes: string[];
      }[];
    };

    return NextResponse.json({
      predictions: data.predictions,
    });
  } catch (error: unknown) {
    console.error("Prediction error:", error);

    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null) {
      try {
        const errorObj = error as { response?: { data?: unknown } };
        if (errorObj.response?.data) {
          message = JSON.stringify(errorObj.response.data);
        }
      } catch {
        // Fallback to default message
      }
    }

    return NextResponse.json(
      {
        error: "Prediction failed",
        message,
      },
      { status: 500 }
    );
  }
}
