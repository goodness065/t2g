import { mockTransactions } from "@/utils/mockTransactions";
import { GoogleAuth } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

const ENDPOINT_ID = "5176046645267136512";
const PROJECT_ID = "716466869000";
const LOCATION = "us-central1";

export async function POST(request: NextRequest) {
  try {
    const { transactionData } = await request.json();
    console.log("Transaction data received:", transactionData);

    const timeString = transactionData.Time; // e.g., "14:30"
    const [hours, minutes] = timeString.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const amount = parseFloat(transactionData.amount);

    // ----------------------------------------
    // 🧠 Fake fraud logic triggers (optional)
    // ----------------------------------------

    let isFraudTest = transactionData.isFraudSample;

    if (isFraudTest === undefined) {
      isFraudTest = false;

      // Night time (12 AM – 5 AM) + high amount
      if ((hours < 6 || hours > 22) && amount > 100) {
        isFraudTest = true;
      }

      // Amount too exact (common for fraud, like $999.99)
      if (amount === 999.99 || amount === 199.99) {
        isFraudTest = true;
      }

      // Edge case time (e.g. right after midnight)
      if (hours === 0 && minutes < 30 && amount > 50) {
        isFraudTest = true;
      }

      // Small amount but late night
      if (amount < 5 && hours >= 23) {
        isFraudTest = true;
      }

      // Random trigger just to balance demo
      if (Math.random() < 0.1) {
        isFraudTest = true;
      }
    }

    const sampleGroup = isFraudTest
      ? mockTransactions.fraud
      : mockTransactions.nonFraud;

    const selectedSample =
      sampleGroup[Math.floor(Math.random() * sampleGroup.length)];

    console.log(
      `Selected ${isFraudTest ? "fraud" : "non-fraud"} sample:`,
      selectedSample
    );

    const modelData: Record<string, number> = {};
    for (const [key, value] of Object.entries(selectedSample)) {
      modelData[key] = typeof value === "string" ? parseFloat(value) : value;
    }

    modelData.Time = timeInMinutes;
    modelData.Amount = amount;

    console.log("Sending to model:", modelData);

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}:predict`;

    const response = await client.request({
      url,
      method: "POST",
      data: {
        instances: [modelData],
      },
    });

    console.log("Vertex AI response:", response.data);

    const responseData = response.data as { predictions: unknown[] };

    return NextResponse.json({
      success: true,
      prediction: responseData.predictions[0],
    });
  } catch (error) {
    console.error("Fraud detection error:", error);

    if (typeof error === "object" && error !== null && "response" in error) {
      const errWithResponse = error as { response?: { data?: unknown } };
      console.error("Error response:", errWithResponse.response?.data);
    }

    return NextResponse.json(
      {
        error: "Fraud detection failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
