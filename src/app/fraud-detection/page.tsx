"use client";

import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormData {
  amount: string;
  Time: string;
  isFraudSample?: boolean; // optional
}

interface PredictionResult {
  success: boolean;
  prediction?: {
    scores: number[];
    classes: string[];
  };
  error?: string;
  message?: string;
}

export default function FraudDetection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [formData, setFormData] = useState<FormData>({
    amount: "",
    Time: "",
    isFraudSample: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/fraud-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionData: formData }),
      });

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({
        success: false,
        error: "Network error occurred",
        message: "Failed to connect to fraud detection service",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    setFormData({
      amount: "79.99",
      Time: "14:45",
    });
  };
  const getFraudScore = (pred: PredictionResult["prediction"]) =>
    pred?.scores?.[1] ?? 0;

  const getConfidence = (pred: PredictionResult["prediction"]) =>
    Math.max(...(pred?.scores ?? []));

  const getRiskLevel = (score: number) => {
    if (score > 0.7)
      return {
        level: "High Risk",
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    if (score > 0.3)
      return {
        level: "Medium Risk",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return {
      level: "Low Risk",
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const getRecommendation = (score: number) => {
    if (score > 0.7) return "Flag for manual review";
    if (score > 0.3) return "Monitor closely";
    return "Approve transaction";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-8"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Fraud Detection
                </h1>
                <p className="text-gray-600 text-sm">
                  AI-powered transaction analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Transaction Details
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      amount: "79.99",
                      Time: "14:45",
                      isFraudSample: false,
                    })
                  }
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                >
                  Use Non-Fraud Sample
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      amount: "199.99",
                      Time: "02:30",
                      isFraudSample: true,
                    })
                  }
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                >
                  Use Fraud Sample
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full text-gray-900 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Day
                </label>
                <input
                  type="time"
                  value={formData.Time}
                  onChange={(e) =>
                    setFormData({ ...formData, Time: e.target.value })
                  }
                  className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Transaction"
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Analysis Results
            </h2>

            {!result && !loading && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>
                  Enter transaction details and click &quot;Analyze&quot; to get
                  started
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing transaction...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
            )}

            {result && result.success && result.prediction && (
              <div className="space-y-6">
                <div className="text-center">
                  {/* Helper functions to extract fraud score and confidence */}
                  {(() => {
                    const fraudScore = result.prediction.scores?.[1] ?? 0;
                    const confidence = Math.max(
                      ...(result.prediction.scores ?? [])
                    );
                    const risk = getRiskLevel(fraudScore);

                    return (
                      <>
                        <div className="mb-4">
                          {fraudScore > 0.7 ? (
                            <AlertTriangle className="h-20 w-20 text-red-500 mx-auto" />
                          ) : fraudScore > 0.3 ? (
                            <AlertTriangle className="h-20 w-20 text-yellow-500 mx-auto" />
                          ) : (
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                          )}
                        </div>

                        <div className="text-4xl font-bold mb-2 text-gray-900">
                          {(fraudScore * 100).toFixed(1)}%
                        </div>

                        <div
                          className={`text-xl font-medium mb-4 ${risk.color}`}
                        >
                          {risk.level}
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${
                              fraudScore > 0.7
                                ? "bg-red-500"
                                : fraudScore > 0.3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${fraudScore * 100}%` }}
                          ></div>
                        </div>

                        <div className={`p-4 rounded-lg ${risk.bgColor}`}>
                          <h3 className="font-semibold mb-3 text-gray-900">
                            Analysis Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Fraud Probability:
                              </span>
                              <span className="font-medium">
                                {(fraudScore * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Model Confidence:
                              </span>
                              <span className="font-medium">
                                {(confidence * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Risk Level:</span>
                              <span className={`font-medium ${risk.color}`}>
                                {risk.level}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <span className="text-gray-600">
                                Recommendation:
                              </span>
                              <p className="font-medium mt-1 text-black">
                                {getRecommendation(fraudScore)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {result && !result.success && (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Analysis Failed</p>
                <p className="text-gray-600 text-sm">
                  {result.message || result.error}
                </p>
                <button
                  onClick={() => setResult(null)}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
