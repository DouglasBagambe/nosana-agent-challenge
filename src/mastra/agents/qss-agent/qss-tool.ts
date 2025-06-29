import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface BinanceTickerResponse {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceKlineResponse {
  [index: number]: string | number;
  0: number; // openTime
  1: string; // open
  2: string; // high
  3: string; // low
  4: string; // close
  5: string; // volume
  6: number; // closeTime
  7: string; // quoteAssetVolume
  8: number; // numberOfTrades
  9: string; // takerBuyBaseAssetVolume
  10: string; // takerBuyQuoteAssetVolume
}

interface MarketAnalysis {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  htfBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  orderBlocks: {
    bullish: Array<{ price: number; strength: number }>;
    bearish: Array<{ price: number; strength: number }>;
  };
  fvgZones: {
    bullish: Array<{ high: number; low: number }>;
    bearish: Array<{ high: number; low: number }>;
  };
  marketStructure: {
    trend: string;
    lastCHOCH: string | null;
    lastBOS: string | null;
  };
  signals: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    entryZone: { high: number; low: number } | null;
    stopLoss: number | null;
    takeProfit: number | null;
    riskReward: number | null;
  };
}

export const qssTool = createTool({
  id: "qss-crypto-analyzer",
  description:
    "Analyze cryptocurrency markets using Smart Money Concepts and provide trading signals",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("Cryptocurrency trading pair (e.g., BTCUSDT, ETHUSDT)"),
    action: z
      .enum(["analyze", "getPrice", "getTechnicals"])
      .describe("Type of analysis to perform"),
    timeframe: z
      .enum(["1h", "4h", "1d"])
      .optional()
      .describe("Timeframe for analysis (default: 4h)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const { symbol, action, timeframe = "4h" } = context;

      switch (action) {
        case "analyze":
          return await performFullAnalysis(symbol, timeframe);
        case "getPrice":
          return await getCurrentPrice(symbol);
        case "getTechnicals":
          return await getTechnicalData(symbol, timeframe);
        default:
          throw new Error("Invalid action specified");
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || "An error occurred during analysis",
      };
    }
  },
});

async function getCurrentPrice(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.statusText}`);
    }

    const data: BinanceTickerResponse = await response.json();

    return {
      success: true,
      data: {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
      },
    };
  } catch (error: any) {
    throw new Error(`Price fetch failed: ${error.message}`);
  }
}

async function getTechnicalData(symbol: string, timeframe: string) {
  try {
    const interval = timeframeToInterval(timeframe);
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=100`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch technical data: ${response.statusText}`);
    }

    const klines: BinanceKlineResponse[] = await response.json();

    // Convert to OHLCV format
    const candles = klines.map((k) => ({
      time: k[0] as number,
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
    }));

    return {
      success: true,
      data: {
        symbol,
        timeframe,
        candles: candles.slice(-50), // Return last 50 candles
        currentPrice: candles[candles.length - 1]?.close || 0,
      },
    };
  } catch (error: any) {
    throw new Error(`Technical data fetch failed: ${error.message}`);
  }
}

export async function performFullAnalysis(
  symbol: string,
  timeframe: string
): Promise<{ success: boolean; data: MarketAnalysis }> {
  try {
    // Get current price data
    const priceData = await getCurrentPrice(symbol);
    if (!priceData.success) {
      throw new Error("Failed to get current price");
    }

    // Get technical data
    const techData = await getTechnicalData(symbol, timeframe);
    if (!techData.success) {
      throw new Error("Failed to get technical data");
    }

    const candles = techData.data.candles;
    const currentPrice = priceData.data.price;

    // Perform Smart Money Concepts analysis
    const htfBias = determineHTFBias(candles);
    const keyLevels = identifyKeyLevels(candles);
    const orderBlocks = detectOrderBlocks(candles);
    const fvgZones = detectFairValueGaps(candles);
    const marketStructure = analyzeMarketStructure(candles);
    const signals = generateTradingSignals(
      currentPrice,
      htfBias,
      orderBlocks,
      fvgZones,
      marketStructure
    );

    const analysis: MarketAnalysis = {
      symbol: priceData.data.symbol,
      currentPrice: currentPrice,
      priceChange24h: priceData.data.change24h,
      volume24h: priceData.data.volume24h,
      high24h: priceData.data.high24h,
      low24h: priceData.data.low24h,
      htfBias,
      keyLevels,
      orderBlocks,
      fvgZones,
      marketStructure,
      signals,
    };

    return {
      success: true,
      data: analysis,
    };
  } catch (error: any) {
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

function timeframeToInterval(timeframe: string): string {
  const intervals: { [key: string]: string } = {
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
  };
  return intervals[timeframe] || "4h";
}

function determineHTFBias(candles: any[]): "BULLISH" | "BEARISH" | "NEUTRAL" {
  if (candles.length < 10) return "NEUTRAL";

  const recent = candles.slice(-10);
  const highs = recent.map((c) => c.high);
  const lows = recent.map((c) => c.low);

  let higherHighs = 0;
  let lowerHighs = 0;
  let higherLows = 0;
  let lowerLows = 0;

  for (let i = 1; i < highs.length; i++) {
    if (highs[i] > highs[i - 1]) higherHighs++;
    else lowerHighs++;

    if (lows[i] > lows[i - 1]) higherLows++;
    else lowerLows++;
  }

  if (higherHighs > lowerHighs && higherLows > lowerLows) return "BULLISH";
  if (lowerHighs > higherHighs && lowerLows > higherLows) return "BEARISH";
  return "NEUTRAL";
}

function identifyKeyLevels(candles: any[]) {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  const resistance = findSignificantLevels(highs, true);
  const support = findSignificantLevels(lows, false);

  return { support, resistance };
}

function findSignificantLevels(
  prices: number[],
  isResistance: boolean
): number[] {
  const levels: number[] = [];
  const lookback = 5;

  for (let i = lookback; i < prices.length - lookback; i++) {
    let isSignificant = true;

    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;

      if (isResistance && prices[j] >= prices[i]) {
        isSignificant = false;
        break;
      }
      if (!isResistance && prices[j] <= prices[i]) {
        isSignificant = false;
        break;
      }
    }

    if (isSignificant) {
      levels.push(prices[i]);
    }
  }

  return levels.slice(-5); // Return last 5 significant levels
}

function detectOrderBlocks(candles: any[]) {
  const bullishOBs: Array<{ price: number; strength: number }> = [];
  const bearishOBs: Array<{ price: number; strength: number }> = [];

  for (let i = 5; i < candles.length - 5; i++) {
    const candle = candles[i];
    const bodySize = Math.abs(candle.close - candle.open);
    const avgBody =
      candles
        .slice(i - 5, i + 5)
        .reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / 10;

    if (bodySize > avgBody * 1.5) {
      // Check for strong move after this candle
      const nextCandles = candles.slice(i + 1, i + 4);
      let strongMove = false;

      for (const nextCandle of nextCandles) {
        if (candle.close < candle.open && nextCandle.low < candle.low * 0.98) {
          strongMove = true;
          break;
        }
        if (
          candle.close > candle.open &&
          nextCandle.high > candle.high * 1.02
        ) {
          strongMove = true;
          break;
        }
      }

      if (strongMove) {
        if (candle.close < candle.open) {
          bullishOBs.push({
            price: (candle.open + candle.low) / 2,
            strength: bodySize / avgBody,
          });
        } else {
          bearishOBs.push({
            price: (candle.open + candle.high) / 2,
            strength: bodySize / avgBody,
          });
        }
      }
    }
  }

  return {
    bullish: bullishOBs.slice(-3),
    bearish: bearishOBs.slice(-3),
  };
}

function detectFairValueGaps(candles: any[]) {
  const bullishFVGs: Array<{ high: number; low: number }> = [];
  const bearishFVGs: Array<{ high: number; low: number }> = [];

  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    // Bullish FVG: next.low > prev.high
    if (next.low > prev.high) {
      const gapSize = next.low - prev.high;
      const avgRange =
        (prev.high - prev.low + curr.high - curr.low + next.high - next.low) /
        3;

      if (gapSize > avgRange * 0.1) {
        bullishFVGs.push({
          high: next.low,
          low: prev.high,
        });
      }
    }

    // Bearish FVG: next.high < prev.low
    if (next.high < prev.low) {
      const gapSize = prev.low - next.high;
      const avgRange =
        (prev.high - prev.low + curr.high - curr.low + next.high - next.low) /
        3;

      if (gapSize > avgRange * 0.1) {
        bearishFVGs.push({
          high: prev.low,
          low: next.high,
        });
      }
    }
  }

  return {
    bullish: bullishFVGs.slice(-3),
    bearish: bearishFVGs.slice(-3),
  };
}

function analyzeMarketStructure(candles: any[]) {
  const recent = candles.slice(-20);
  const highs = recent.map((c) => c.high);
  const lows = recent.map((c) => c.low);

  let trend = "SIDEWAYS";
  let lastCHOCH = null;
  let lastBOS = null;

  // Simple trend analysis
  const firstHalf = recent.slice(0, 10);
  const secondHalf = recent.slice(10);

  const firstAvgHigh =
    firstHalf.reduce((sum, c) => sum + c.high, 0) / firstHalf.length;
  const secondAvgHigh =
    secondHalf.reduce((sum, c) => sum + c.high, 0) / secondHalf.length;
  const firstAvgLow =
    firstHalf.reduce((sum, c) => sum + c.low, 0) / firstHalf.length;
  const secondAvgLow =
    secondHalf.reduce((sum, c) => sum + c.low, 0) / secondHalf.length;

  if (secondAvgHigh > firstAvgHigh && secondAvgLow > firstAvgLow) {
    trend = "UPTREND";
    lastBOS = "Bullish BOS detected";
  } else if (secondAvgHigh < firstAvgHigh && secondAvgLow < firstAvgLow) {
    trend = "DOWNTREND";
    lastBOS = "Bearish BOS detected";
  }

  // Look for CHOCH patterns
  for (let i = 5; i < recent.length - 5; i++) {
    const currentHigh = recent[i].high;
    const currentLow = recent[i].low;
    const prevHighs = recent.slice(i - 5, i).map((c) => c.high);
    const nextHighs = recent.slice(i + 1, i + 6).map((c) => c.high);

    const breaksPreviousStructure =
      currentHigh > Math.max(...prevHighs) ||
      currentLow < Math.min(...prevHighs.map((_, j) => recent[i - 5 + j].low));

    if (breaksPreviousStructure) {
      lastCHOCH =
        currentHigh > Math.max(...prevHighs)
          ? "Bullish CHOCH"
          : "Bearish CHOCH";
    }
  }

  return {
    trend,
    lastCHOCH,
    lastBOS,
  };
}

function generateTradingSignals(
  currentPrice: number,
  htfBias: "BULLISH" | "BEARISH" | "NEUTRAL",
  orderBlocks: any,
  fvgZones: any,
  marketStructure: any
) {
  let action: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confidence = 0;
  let entryZone = null;
  let stopLoss = null;
  let takeProfit = null;
  let riskReward = null;

  // Check for confluences
  const bullishConfluence =
    htfBias === "BULLISH" && marketStructure.trend === "UPTREND";
  const bearishConfluence =
    htfBias === "BEARISH" && marketStructure.trend === "DOWNTREND";

  // Check if price is in a significant zone
  for (const ob of orderBlocks.bullish) {
    const priceInZone =
      Math.abs(currentPrice - ob.price) / currentPrice < 0.002; // Within 0.2%
    if (priceInZone && bullishConfluence) {
      action = "BUY";
      confidence = Math.min(90, 60 + ob.strength * 10);
      entryZone = { high: ob.price * 1.001, low: ob.price * 0.999 };
      stopLoss = ob.price * 0.985; // 1.5% stop loss
      takeProfit = ob.price * 1.045; // 4.5% take profit (1:3 R:R)
      riskReward = 3.0;
      break;
    }
  }

  for (const ob of orderBlocks.bearish) {
    const priceInZone =
      Math.abs(currentPrice - ob.price) / currentPrice < 0.002;
    if (priceInZone && bearishConfluence) {
      action = "SELL";
      confidence = Math.min(90, 60 + ob.strength * 10);
      entryZone = { high: ob.price * 1.001, low: ob.price * 0.999 };
      stopLoss = ob.price * 1.015; // 1.5% stop loss
      takeProfit = ob.price * 0.955; // 4.5% take profit (1:3 R:R)
      riskReward = 3.0;
      break;
    }
  }

  // Check FVG zones if no order block signal
  if (action === "WAIT") {
    for (const fvg of fvgZones.bullish) {
      if (
        currentPrice >= fvg.low &&
        currentPrice <= fvg.high &&
        bullishConfluence
      ) {
        action = "BUY";
        confidence = 70;
        entryZone = { high: fvg.high, low: fvg.low };
        stopLoss = fvg.low * 0.99;
        takeProfit = fvg.high * 1.06;
        riskReward = 2.0;
        break;
      }
    }

    for (const fvg of fvgZones.bearish) {
      if (
        currentPrice >= fvg.low &&
        currentPrice <= fvg.high &&
        bearishConfluence
      ) {
        action = "SELL";
        confidence = 70;
        entryZone = { high: fvg.high, low: fvg.low };
        stopLoss = fvg.high * 1.01;
        takeProfit = fvg.low * 0.94;
        riskReward = 2.0;
        break;
      }
    }
  }

  return {
    action,
    confidence,
    entryZone,
    stopLoss,
    takeProfit,
    riskReward,
  };
}
