# Web Search API Setup

This document explains how to set up the Tavily API for web search functionality in the Cadillac EV Assistant.

## Overview

The web search feature allows the AI to search the internet for current information when users enable the web search toggle. This is powered by the Tavily API, which is optimized for AI applications.

## Setup Instructions

### ✅ API Key Status

**The Tavily API key is already configured and deployed!**

The API key is set via Firebase Functions config:
```bash
tavily.key: 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
```

### For Future Reference: Manual Setup

If you need to update the API key in the future:

#### Option A: Firebase Functions Config

Use Firebase Functions config:

```bash
firebase functions:config:set tavily.key="your_new_api_key_here"
firebase deploy --only functions
```

#### Option B: Environment Variable

Add the API key to your `.env` file in the `functions` directory:

```bash
TAVILY_API_KEY=your_api_key_here
```

Then restart your local functions or redeploy.

## How It Works

1. **User enables web search**: When a user clicks the globe icon in the chat interface, a badge appears indicating web search is enabled.

2. **Frontend sends flag**: The frontend includes `webSearch: true` in the API request.

3. **Backend performs search**: The backend uses Tavily API to search for current information related to the user's query.

4. **Results added to context**: Web search results are added to the AI's context, allowing it to provide current information with citations.

5. **AI responds**: The AI combines database information with web search results to provide comprehensive, up-to-date answers.

## Search Configuration

The web search is configured to:
- Prioritize official Cadillac sources (cadillac.com, gm.com)
- Include German automotive websites (auto-motor-und-sport.de, autozeitung.de)
- Exclude social media platforms
- Return up to 5 most relevant results
- Use advanced search depth for better results

## Troubleshooting

### Web search not working

1. **Check API key**: Verify the API key is correctly set in environment variables or Firebase config
2. **Check logs**: Review Firebase Functions logs for any errors:
   ```bash
   firebase functions:log --only generateChatResponse
   ```
3. **Verify API key**: Test the API key directly with Tavily's API documentation

### No results found

- The search may not find relevant results for very specific queries
- Try rephrasing the query or enabling web search for broader topics
- Check Tavily API status and limits

## Cost Considerations

- Tavily offers a free tier with limited requests
- Monitor usage in the Tavily dashboard
- Consider upgrading if you need more requests

## Alternative APIs

If you prefer a different web search API, you can modify the `performWebSearch` function in `functions/index.js` to use:
- SerpAPI
- Google Custom Search API
- Bing Search API
- Other search APIs

## Notes

- Web search adds latency to responses (typically 1-3 seconds)
- Results are automatically included in the AI context
- The AI will cite sources when using web information
- Database information is always prioritized over web results

