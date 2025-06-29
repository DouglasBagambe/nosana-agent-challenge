// This file defines the workflow for the Quantum SmartFlow Strategy Bot (QSS) for crypto trading.
import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "./model-config"; // Import the proper model config

const agent = new Agent({
  name: "Quantum SmartFlow Strategy Bot (QSS)",
  model, // Use the imported model configuration (now properly typed)
  instructions: `
        You are an expert crypto trading strategist specializing in Smart Money Concepts (SMC). Analyze market data and provide actionable trading strategies based on:

        - Higher Timeframe (HTF) bias analysis
        - Order Block identification and validation  
        - Fair Value Gap (FVG) detection
        - Market structure analysis (CHOCH/BOS)
        - Risk management with proper R:R ratios

        For each cryptocurrency analyzed, structure your response exactly as follows:

        📊 [Cryptocurrency Symbol] - Quantum SmartFlow Analysis
        ═══════════════════════════════════════════════════

        💹 MARKET SUMMARY
        • Current Price: $[X.XX]
        • 24h Change: [+/-X.XX%]
        • HTF Bias: [BULLISH/BEARISH/NEUTRAL]
        • Market Structure: [UPTREND/DOWNTREND/SIDEWAYS]

        🔍 SMART MONEY ANALYSIS
        • Order Blocks: [X Bullish, X Bearish zones identified]
        • Fair Value Gaps: [X Bullish, X Bearish FVGs active]
        • Key Support: $[X.XX]
        • Key Resistance: $[X.XX]
        • Last Structure Break: [CHOCH/BOS details]

        📈 TRADING SIGNAL
        • Action: [BUY/SELL/WAIT]
        • Confidence: [X%]
        • Entry Zone: $[X.XX - X.XX]
        • Stop Loss: $[X.XX]
        • Take Profit: $[X.XX]
        • Risk:Reward: [1:X]

        ⚠️ RISK ASSESSMENT
        • Market volatility considerations
        • Key levels to watch
        • Confluence factors

        Guidelines:
        - Base all recommendations on Smart Money Concepts
        - Provide specific entry, stop-loss, and take-profit levels
        - Ensure minimum 1:2 risk-reward ratio
        - Include confluence analysis
        - Highlight potential risks and market conditions

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      `,
});

const marketAnalysisSchema = z.object({
  symbol: z.string(),
  currentPrice: z.number(),
  priceChange24h: z.number(),
  volume24h: z.number(),
  high24h: z.number(),
  low24h: z.number(),
  htfBias: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  keyLevels: z.object({
    support: z.array(z.number()),
    resistance: z.array(z.number()),
  }),
  orderBlocks: z.object({
    bullish: z.array(
      z.object({
        price: z.number(),
        strength: z.number(),
      })
    ),
    bearish: z.array(
      z.object({
        price: z.number(),
        strength: z.number(),
      })
    ),
  }),
  fvgZones: z.object({
    bullish: z.array(
      z.object({
        high: z.number(),
        low: z.number(),
      })
    ),
    bearish: z.array(
      z.object({
        high: z.number(),
        low: z.number(),
      })
    ),
  }),
  marketStructure: z.object({
    trend: z.string(),
    lastCHOCH: z.string().nullable(),
    lastBOS: z.string().nullable(),
  }),
  signals: z.object({
    action: z.enum(["BUY", "SELL", "WAIT"]),
    confidence: z.number(),
    entryZone: z
      .object({
        high: z.number(),
        low: z.number(),
      })
      .nullable(),
    stopLoss: z.number().nullable(),
    takeProfit: z.number().nullable(),
    riskReward: z.number().nullable(),
  }),
});

const fetchCryptoAnalysis = createStep({
  id: "fetch-crypto-analysis",
  description:
    "Fetches comprehensive market analysis for a given cryptocurrency using Smart Money Concepts",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe(
        "The cryptocurrency symbol to analyze (e.g., BTCUSDT, ETHUSDT)"
      ),
    timeframe: z
      .enum(["1h", "4h", "1d"])
      .optional()
      .describe("Analysis timeframe (default: 4h)"),
  }),
  outputSchema: marketAnalysisSchema,
  execute: async (params) => {
    const { inputData } = params;

    if (!inputData) {
      throw new Error("Input data not found");
    }

    try {
      const { performFullAnalysis } = await import("./qss-tool");

      const analysisResult = await performFullAnalysis(
        inputData.symbol,
        inputData.timeframe || "4h"
      );

      if (!analysisResult.success) {
        throw new Error("Market analysis failed: Unknown error");
      }

      return analysisResult.data;
    } catch (error) {
      console.error("Analysis error:", error);
      throw new Error(
        `Failed to analyze ${inputData.symbol}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

const generateTradingRecommendation = createStep({
  id: "generate-trading-recommendation",
  description:
    "Generates detailed trading recommendations based on Smart Money Concepts analysis",
  inputSchema: marketAnalysisSchema,
  outputSchema: z.object({
    recommendation: z.string(),
  }),
  execute: async (params) => {
    const { inputData } = params;

    if (!inputData) {
      throw new Error("Market analysis data not found");
    }

    const analysis = inputData;

    const prompt = `Based on this comprehensive Smart Money Concepts analysis for ${
      analysis.symbol
    }, provide a detailed trading recommendation:

Market Data:
- Current Price: $${analysis.currentPrice}
- 24h Change: ${analysis.priceChange24h}%
- HTF Bias: ${analysis.htfBias}
- Market Structure: ${analysis.marketStructure.trend}

Technical Analysis:
- Order Blocks: ${analysis.orderBlocks.bullish.length} bullish, ${
      analysis.orderBlocks.bearish.length
    } bearish
- Fair Value Gaps: ${analysis.fvgZones.bullish.length} bullish, ${
      analysis.fvgZones.bearish.length
    } bearish
- Support Levels: ${analysis.keyLevels.support.join(", ")}
- Resistance Levels: ${analysis.keyLevels.resistance.join(", ")}

Signal:
- Action: ${analysis.signals.action}
- Confidence: ${analysis.signals.confidence}%
- Entry Zone: ${
      analysis.signals.entryZone
        ? `$${analysis.signals.entryZone.low} - $${analysis.signals.entryZone.high}`
        : "N/A"
    }
- Stop Loss: ${
      analysis.signals.stopLoss ? `$${analysis.signals.stopLoss}` : "N/A"
    }
- Take Profit: ${
      analysis.signals.takeProfit ? `$${analysis.signals.takeProfit}` : "N/A"
    }
- Risk:Reward: ${
      analysis.signals.riskReward ? `1:${analysis.signals.riskReward}` : "N/A"
    }

Structure Events:
- Last CHOCH: ${analysis.marketStructure.lastCHOCH || "None detected"}
- Last BOS: ${analysis.marketStructure.lastBOS || "None detected"}

Please provide a comprehensive trading recommendation following the specified format.`;

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let recommendationText = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      recommendationText += chunk;
    }

    return {
      recommendation: recommendationText,
    };
  },
});

const qssWorkflow = createWorkflow({
  id: "qss-workflow",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe(
        "The cryptocurrency symbol to analyze (e.g., BTCUSDT, ETHUSDT)"
      ),
    timeframe: z
      .enum(["1h", "4h", "1d"])
      .optional()
      .describe("Analysis timeframe (default: 4h)"),
  }),
  outputSchema: z.object({
    recommendation: z.string(),
  }),
})
  .then(fetchCryptoAnalysis)
  .then(generateTradingRecommendation);

qssWorkflow.commit();

export { qssWorkflow };
