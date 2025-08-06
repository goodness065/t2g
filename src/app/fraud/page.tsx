"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Loader2, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface FormData {
  amount: string;
  international: string;
  online: string;
  timeofday: string;
  device: string;
}

interface Prediction {
  label: string;
  confidence: number;
  scores?: number[];
  classes?: string[];
}

export default function FraudDetectionForm() {
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    international: "0",
    online: "0",
    timeofday: "0",
    device: "0",
  });

  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const inputData = {
      amount: parseFloat(formData.amount),
      international: parseInt(formData.international),
      online: parseInt(formData.online),
      timeofday: parseInt(formData.timeofday),
      device: parseInt(formData.device),
    };

    const pcaVector = mapToPCA(inputData);
    const prediction = await callVertexAIPredict(pcaVector, inputData);
    setResult(prediction);
    setLoading(false);
  };

  const mapToPCA = ({ amount, international, online, timeofday, device }: {
    amount: number;
    international: number;
    online: number;
    timeofday: number;
    device: number;
  }): number[] => {
    // Determine fraud risk based on form inputs
    const isHighRisk = international === 1 && timeofday === 2 && device === 0; // International + Night + Desktop
    const isMediumRisk = international === 1 || timeofday === 2 || (online === 1 && amount > 500);
    const isLowRisk = international === 0 && timeofday === 0 && online === 0 && amount < 500;

    let base: number[] = [];

    if (isHighRisk) {
      // High fraud risk: Generate large negative values (-8 to -12 range) for most V fields
      base = [
        -9.5 + Math.random() * 2, // V1: -9.5 to -7.5
        -10.2 + Math.random() * 3, // V2: -10.2 to -7.2
        -8.8 + Math.random() * 2.5, // V3: -8.8 to -6.3
        6.2 + Math.random() * 3, // V4: 6.2 to 9.2 (some positive for variety)
        -11.1 + Math.random() * 2, // V5: -11.1 to -9.1
        -7.6 + Math.random() * 2, // V6: -7.6 to -5.6
        -9.3 + Math.random() * 2.5, // V7: -9.3 to -6.8
        0.7 + Math.random() * 0.5, // V8: 0.7 to 1.2
        -8.9 + Math.random() * 2, // V9: -8.9 to -6.9
        -10.5 + Math.random() * 2.5, // V10: -10.5 to -8.0
        4.7 + Math.random() * 2, // V11: 4.7 to 6.7
        -8.5 + Math.random() * 2, // V12: -8.5 to -6.5
        0.7 + Math.random() * 0.5, // V13: 0.7 to 1.2
        -7.6 + Math.random() * 2, // V14: -7.6 to -5.6
        -2.2 + Math.random() * 1, // V15: -2.2 to -1.2
        -2.6 + Math.random() * 1, // V16: -2.6 to -1.6
        -5.3 + Math.random() * 2, // V17: -5.3 to -3.3
        -1.0 + Math.random() * 0.5, // V18: -1.0 to -0.5
        -0.6 + Math.random() * 0.3, // V19: -0.6 to -0.3
        0.4 + Math.random() * 0.2, // V20: 0.4 to 0.6
        0.3 + Math.random() * 0.2, // V21: 0.3 to 0.5
        -0.9 + Math.random() * 0.3, // V22: -0.9 to -0.6
        -0.1 + Math.random() * 0.2, // V23: -0.1 to 0.1
        -0.7 + Math.random() * 0.3, // V24: -0.7 to -0.4
        0.5 + Math.random() * 0.3, // V25: 0.5 to 0.8
        0.1 + Math.random() * 0.2, // V26: 0.1 to 0.3
        0.8 + Math.random() * 0.3, // V27: 0.8 to 1.1
        0.4 + Math.random() * 0.2, // V28: 0.4 to 0.6
      ];
    } else if (isMediumRisk) {
      // Medium fraud risk: Mix of negative and positive values
      base = [
        -1.7 + Math.random() * 2, // V1: -1.7 to 0.3
        0.3 + Math.random() * 1, // V2: 0.3 to 1.3
        -0.5 + Math.random() * 1, // V3: -0.5 to 0.5
        3.2 + Math.random() * 2, // V4: 3.2 to 5.2
        -0.4 + Math.random() * 1, // V5: -0.4 to 0.6
        -1.3 + Math.random() * 1, // V6: -1.3 to -0.3
        -2.3 + Math.random() * 1.5, // V7: -2.3 to -0.8
        0.7 + Math.random() * 0.5, // V8: 0.7 to 1.2
        -1.4 + Math.random() * 1, // V9: -1.4 to -0.4
        -3.0 + Math.random() * 1.5, // V10: -3.0 to -1.5
        0.7 + Math.random() * 1, // V11: 0.7 to 1.7
        -4.6 + Math.random() * 2, // V12: -4.6 to -2.6
        -1.9 + Math.random() * 1, // V13: -1.9 to -0.9
        -4.8 + Math.random() * 2, // V14: -4.8 to -2.8
        -1.2 + Math.random() * 0.8, // V15: -1.2 to -0.4
        -2.5 + Math.random() * 1, // V16: -2.5 to -1.5
        -5.4 + Math.random() * 2, // V17: -5.4 to -3.4
        -2.0 + Math.random() * 1, // V18: -2.0 to -1.0
        -0.6 + Math.random() * 0.5, // V19: -0.6 to -0.1
        0.1 + Math.random() * 0.3, // V20: 0.1 to 0.4
        0.4 + Math.random() * 0.3, // V21: 0.4 to 0.7
        -0.2 + Math.random() * 0.3, // V22: -0.2 to 0.1
        -0.3 + Math.random() * 0.3, // V23: -0.3 to 0.0
        0.2 + Math.random() * 0.3, // V24: 0.2 to 0.5
        0.2 + Math.random() * 0.3, // V25: 0.2 to 0.5
        0.0 + Math.random() * 0.2, // V26: 0.0 to 0.2
        0.5 + Math.random() * 0.3, // V27: 0.5 to 0.8
        0.2 + Math.random() * 0.2, // V28: 0.2 to 0.4
      ];
    } else {
      // Low fraud risk: Small values mostly in -1 to 1 range
      base = [
        -1.1 + Math.random() * 2, // V1: -1.1 to 0.9
        0.3 + Math.random() * 1, // V2: 0.3 to 1.3
        0.9 + Math.random() * 1, // V3: 0.9 to 1.9
        2.7 + Math.random() * 1, // V4: 2.7 to 3.7
        0.3 + Math.random() * 0.5, // V5: 0.3 to 0.8
        -0.4 + Math.random() * 0.5, // V6: -0.4 to 0.1
        -0.4 + Math.random() * 0.5, // V7: -0.4 to 0.1
        0.1 + Math.random() * 0.3, // V8: 0.1 to 0.4
        1.1 + Math.random() * 0.5, // V9: 1.1 to 1.6
        -0.3 + Math.random() * 0.5, // V10: -0.3 to 0.2
        0.1 + Math.random() * 0.3, // V11: 0.1 to 0.4
        -2.4 + Math.random() * 1, // V12: -2.4 to -1.4
        1.6 + Math.random() * 0.5, // V13: 1.6 to 2.1
        0.8 + Math.random() * 0.5, // V14: 0.8 to 1.3
        -1.7 + Math.random() * 0.5, // V15: -1.7 to -1.2
        0.7 + Math.random() * 0.3, // V16: 0.7 to 1.0
        0.2 + Math.random() * 0.3, // V17: 0.2 to 0.5
        0.0 + Math.random() * 0.2, // V18: 0.0 to 0.2
        -1.8 + Math.random() * 0.5, // V19: -1.8 to -1.3
        -0.2 + Math.random() * 0.3, // V20: -0.2 to 0.1
        -0.1 + Math.random() * 0.3, // V21: -0.1 to 0.2
        -0.2 + Math.random() * 0.3, // V22: -0.2 to 0.1
        0.0 + Math.random() * 0.2, // V23: 0.0 to 0.2
        0.6 + Math.random() * 0.3, // V24: 0.6 to 0.9
        0.0 + Math.random() * 0.2, // V25: 0.0 to 0.2
        -0.3 + Math.random() * 0.3, // V26: -0.3 to 0.0
        -0.2 + Math.random() * 0.3, // V27: -0.2 to 0.1
        0.1 + Math.random() * 0.2, // V28: 0.1 to 0.3
      ];
    }

    return base;
  };

  const callVertexAIPredict = async (pcaVector: number[], formData: any): Promise<Prediction> => {
    try {
      const res = await fetch("/api/fraud-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instances: [pcaVector],
          formData: formData
        }),
      });
      const data = await res.json();
      const scores = data.predictions[0].scores;
      const classes = data.predictions[0].classes;

      const maxIndex = scores.indexOf(Math.max(...scores));
      const confidence = scores[maxIndex] * 100;
      const label = classes[maxIndex] === "1" ? "FRAUD" : "NOT FRAUD";

      return {
        label,
        confidence,
        scores,
        classes
      };
    } catch (error) {
      console.error(error);
      return { label: "Error", confidence: 0 };
    }
  };

  const getConfidenceColor = (confidence: number, label: string) => {
    if (label === "FRAUD") {
      if (confidence > 70) return "text-red-600";
      if (confidence > 30) return "text-yellow-600";
      return "text-green-600";
    } else {
      if (confidence > 70) return "text-green-600";
      if (confidence > 30) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const getBarColor = (confidence: number, label: string) => {
    if (label === "FRAUD") {
      if (confidence > 70) return "bg-red-500";
      if (confidence > 30) return "bg-yellow-500";
      return "bg-green-500";
    } else {
      if (confidence > 70) return "bg-green-500";
      if (confidence > 30) return "bg-yellow-500";
      return "bg-red-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">🛡️ Fraud Detection Demo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Transaction Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="mt-1 w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Is the transaction international?</label>
            <select
              name="international"
              value={formData.international}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Is this an online transaction?</label>
            <select
              name="online"
              value={formData.online}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Time of Day</label>
            <select
              name="timeofday"
              value={formData.timeofday}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="0">Morning</option>
              <option value="1">Afternoon</option>
              <option value="2">Night</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Device Used</label>
            <select
              name="device"
              value={formData.device}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-md"
            >
              <option value="0">Desktop</option>
              <option value="1">Mobile</option>
              <option value="2">ATM</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing Transaction...</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Check for Fraud</span>
              </>
            )}
          </button>
        </form>

        {loading ? (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Analyzing Transaction</h3>
              <p className="text-blue-600 text-sm">Processing your transaction data with AI...</p>
            </div>
          </div>
        ) : result ? (
          <div className="mt-8">
            <div className={`rounded-2xl p-6 border-2 ${
              result.label === "FRAUD" 
                ? "bg-red-50 border-red-200" 
                : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                {result.label === "FRAUD" ? (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                <h2 className={`text-2xl font-bold ${
                  result.label === "FRAUD" ? "text-red-800" : "text-green-800"
                }`}>
                  {result.label}
                </h2>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm mb-2">Confidence Level</p>
                <p className={`text-3xl font-bold ${getConfidenceColor(result.confidence, result.label)}`}>
                  {result.confidence.toFixed(1)}%
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getBarColor(result.confidence, result.label)}`}
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
              
              {result.scores && result.classes && (
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-3 text-center">Model Predictions</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.classes.map((cls, i) => (
                      <div key={cls} className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                        <span className="text-gray-700 font-medium">
                          {cls === "1" ? "Fraud" : "Legitimate"}
                        </span>
                        <span className="font-mono text-gray-900 font-semibold">
                          {(result.scores![i] * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
