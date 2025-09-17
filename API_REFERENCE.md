# API Responses Format

## Perplexity API Response Example
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "llama-3.1-sonar-small-128k-online",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "Here are recent scientific articles:\n\n1. **Title**: Example Article\n   **URL**: https://nature.com/articles/example\n   **Description**: Brief description of the article..."
      }
    }
  ]
}
```

## OpenAI API Response Example
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "## Main Findings\nThe study found...\n\n## Methodology\nResearchers used...\n\n## Implications\nThis research suggests..."
      }
    }
  ]
}
```

## Space Devs API Response Example
```json
{
  "count": 100,
  "next": "https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "id": "12345",
      "name": "Falcon 9 Block 5 | Starlink Group 6-1",
      "status": {
        "id": 1,
        "name": "Go for Launch"
      },
      "net": "2024-01-15T10:30:00Z",
      "window_end": "2024-01-15T14:30:00Z",
      "image": "https://spaceflightnow.com/wp-content/uploads/2021/05/falcon9_starlink.jpg",
      "launch_service_provider": {
        "id": 121,
        "name": "SpaceX",
        "type": "Commercial"
      },
      "rocket": {
        "id": 164,
        "configuration": {
          "id": 164,
          "name": "Falcon 9",
          "family": "Falcon",
          "full_name": "Falcon 9 Block 5"
        }
      },
      "mission": {
        "id": 1234,
        "name": "Starlink Group 6-1",
        "description": "A batch of 23 satellites for the Starlink mega-constellation...",
        "type": "Communications"
      },
      "pad": {
        "id": 87,
        "name": "Launch Complex 39A",
        "location": {
          "id": 27,
          "name": "Kennedy Space Center, FL, USA",
          "country_code": "USA"
        }
      },
      "webcast_live": false,
      "probability": 85
    }
  ]
}
```

## Discord Embed Structure
```javascript
{
  title: "📄 Paper of the Week - Revolutionary Quantum Computing Breakthrough",
  description: "## Main Findings\nResearchers have achieved...\n\n## Methodology\n...",
  url: "https://nature.com/articles/example",
  color: 0x00AA55,
  timestamp: "2024-01-15T09:00:00.000Z",
  fields: [
    {
      name: "🔗 Source",
      value: "[Read full article](https://nature.com/articles/example)",
      inline: true
    },
    {
      name: "📅 Published",
      value: "15/01/2024",
      inline: true
    },
    {
      name: "🤖 Selected by",
      value: "Science Squad AI",
      inline: true
    }
  ],
  footer: {
    text: "Paper of the Week • Published automatically every Monday"
  }
}
```

## n8n Webhook Payload
```json
{
  "type": "weekly_paper_published",
  "title": "Revolutionary Quantum Computing Breakthrough",
  "url": "https://nature.com/articles/example",
  "summary": "Researchers have achieved a major breakthrough in quantum computing by demonstrating...",
  "timestamp": "2024-01-15T09:00:00.000Z",
  "channel_id": "758136600788368416",
  "guild_id": "758136600788368415"
}
```

## Error Response Format
```json
{
  "error": {
    "type": "API_ERROR",
    "message": "Failed to fetch article summary",
    "details": {
      "service": "OpenAI",
      "status": 429,
      "rate_limit": true
    },
    "timestamp": "2024-01-15T09:00:00.000Z"
  }
}
```