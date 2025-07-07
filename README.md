# Quantum SmartFlow Strategy Bot (QSS) - Nosana Builders Challenge Submission

![Agent-101](./assets/NosanaBuildersChallengeAgents.jpg)

## Introduction

Welcome to my submission for the Nosana Builders Challenge (2nd Edition - Agent-101). I've developed the Quantum SmartFlow Strategy Bot (QSS), a specialized AI agent for crypto trading analysis. For general information about the challenge, Mastra framework, and setup basics, refer to the [Original README](<./README(Original).md>).

This document focuses on my agent, providing all necessary details for the submission requirements, including setup, usage, and deployment information.

## My Agent: Quantum SmartFlow Strategy Bot (QSS)

Hey there! I've built the Quantum SmartFlow Strategy Bot (QSS) for the Nosana Builders Challenge. Here's the lowdown on my agent:

- **Description & Purpose**: QSS is a crypto trading strategist using Smart Money Concepts (SMC). It analyzes market data to provide actionable trading strategies, identifying order blocks, fair value gaps, and market structure with specific entry, stop-loss, and take-profit levels for cryptocurrencies.
- **Setup Instructions**: Clone this repo, install dependencies with `pnpm install`, and run the dev server with `pnpm run dev`. Access it at `http://localhost:8080`.
- **Environment Variables**: You'll need to set `GROQ_API_KEY` for Groq's free API (used instead of the default Ollama setup basically because my machine could not handle running Ollama locally), `API_BASE_URL` (defaults to `https://api.groq.com/openai/v1`), and `MODEL_NAME_AT_ENDPOINT` (defaults to `llama-3.1-8b-instant`). Check `.env` or `.env.docker` for examples.
- **Docker Build & Run**: Build with `docker build -t username/nosana-agent-challenge:v1.0.0 .` and run locally with `docker run -p 8080:8080 --env-file .env.docker username/nosana-agent-challenge:v1.0.0`.
- **Example Usage**: Interact with QSS via the chat interface or API to analyze a crypto like BTCUSDT. Ask it to analyze market structure on a 4h timeframe, and it'll give you a detailed breakdown with trading signals, confidence levels, entry points, entry times, stop losses, RR ratio, etc.
- **Key Features**: QSS delivers a structured market summary for each analysis, including current price, 24h change, higher timeframe bias (bullish/bearish/neutral), and market structure. It identifies key support/resistance levels, order blocks, and fair value gaps, offering trading signals with precise entry zones, stop-loss, take-profit levels, and a minimum 1:2 risk-reward ratio, all backed by confluence analysis and risk assessments.
- **Why Groq's API**: I opted for Groq's free API over the default Ollama setup due to hardware constraints on my machine, ensuring efficient processing without compromising the agent's analytical capabilities.

That's my agent in a nutshell. It's powered by Groq's free API for efficient processing, tailored specifically for crypto trading insights!

## Submission Details

As part of the Nosana Builders Challenge submission requirements, here are the details for my project:

- **Docker Container URL**: https://hub.docker.com/repository/docker/douglasab/nosana-agent-challenge/tags/v1.0.0
- **Nosana Deployment Proof**:
  - Job ID 2: https://dashboard.nosana.com/jobs/7Dwp6eiBPJiH161i8uCg5adT8F4S3EHuKoo87xPas3Qu
- **Video Demo Link**: https://youtu.be/y-5G0tG11uU
- **GitHub Repository Link**: https://github.com/DouglasBagambe/nosana-agent-challenge
- **X (Twitter) Post Link**: https://x.com/realdyson_/status/1942219367770689687?s=46&t=d3S863JpVJJxByzKACtPOg

## Testing & Deployment

- **Local Testing**: Start the development server with `pnpm run dev` and test QSS at `http://localhost:8080`. Verify conversation flow, tool functionality, error handling, and check console logs for issues.
- **Docker Testing**: Build and run the container as mentioned above to ensure it mirrors the Nosana deployment environment.
- **Nosana Deployment**: My agent has been deployed on Nosana (see job IDs above). For deployment instructions or troubleshooting, refer to the [Original README](<./README(Original).md>) or contact Nosana support on [Discord](https://discord.gg/nosana-ai).

## Support & Resources

If you need broader context or technical assistance:

- **Challenge Resources**: See [Original README](<./README(Original).md>) for Nosana and Mastra documentation links.
- **Support**: Join the [Nosana Discord](https://discord.gg/nosana) (Builders Challenge Dev channel) or follow [@nosana_ai](https://x.com/nosana_ai) for updates.

## Closing Note

I'm excited to present QSS as my entry for the Nosana Builders Challenge. I hope this agent showcases the power of AI in crypto trading analysis. Good luck to all participants, and happy building!
