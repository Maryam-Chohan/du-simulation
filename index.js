require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const app = express();

app.use(express.json());

// Health check endpoint for deployment (must be before static middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'du Customer Simulation Platform' });
});

app.use(express.static('public'));

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.DEEPSEEK_1,
  defaultHeaders: {
    'HTTP-Referer': 'https://replit.com',
    'X-Title': 'du Customer Simulation Platform'
  }
});

const PERSONAS = {
  Angry: {
    name: "Angry Customer",
    description: "Frustrated and demanding immediate resolution",
    avatar: "angry.png",
    systemPrompt: ``
  },
  Polite: {
    name: "Polite Customer",
    description: "Respectful and patient, seeking understanding",
    avatar: "polite.png",
    systemPrompt: ``
  },
  Impatient: {
    name: "Impatient Customer",
    description: "In a hurry, wants quick solutions",
    avatar: "impatient.png",
    systemPrompt: ``
  },
  Confused: {
    name: "Confused Customer",
    description: "Uncertain and needs clear guidance",
    avatar: "confused.png",
    systemPrompt: ``
  },
  VIP: {
    name: "VIP Customer",
    description: "High-value business client with high expectations",
    avatar: "polite.png",
    systemPrompt: ``
  }
};

const SCENARIOS = {
  "5g-rollout": {
    name: "5G Rollout Delays",
    description: "Customer experiencing delays in promised 5G service activation",
    initialComplaint: "Hello, I upgraded to the 5G plan last month, but I'm still on 4G in Downtown Dubai. Can someone explain why this is taking so long?"
  },
  "corporate-discount": {
    name: "Corporate Discount Negotiations",
    description: "Business client negotiating bulk service discounts",
    initialComplaint: "Hello, I noticed my account hasn't received the corporate discount we discussed. Could you please check this for me?"
  },
  "service-downtime": {
    name: "Service Downtime Complaints",
    description: "Customer facing repeated internet/mobile service interruptions",
    initialComplaint: "My internet has been down all day in Jumeirah Lakes Towers. I can't work, and this is unacceptable. Fix it now!"
  },
  "device-tradein": {
    name: "Device Trade-In Issues",
    description: "Customer experiencing problems with device trade-in program",
    initialComplaint: "Hi, I traded in my iPhone three weeks ago for the upgrade program. I was told I'd get AED 1,800 credit, but I haven't seen it on my account yet. Can you check on this?"
  },
  "enterprise-contract": {
    name: "Enterprise Contract Renewals",
    description: "Large enterprise client reviewing contract terms",
    initialComplaint: "Good afternoon, our enterprise contract with du is up for renewal next month. We've been with you for 5 years, but we're exploring options. What can du offer to keep our business?"
  }
};

let conversationHistories = {};

app.post('/ask-client', async (req, res) => {
  try {
    const { message, persona, scenario, sessionId, isFirstMessage } = req.body;

    if (!PERSONAS[persona]) {
      return res.status(400).json({ error: 'Invalid persona' });
    }

    if (!SCENARIOS[scenario]) {
      return res.status(400).json({ error: 'Invalid scenario' });
    }

    const conversationId = sessionId || `${persona}-${scenario}-${Date.now()}`;

    if (!conversationHistories[conversationId]) {
      conversationHistories[conversationId] = [];
    }

    const personaInstructions = {
      Angry: `Tone & Behavior:
- Frustrated and demanding, short and sharp, but respectful.
- Does not calm down immediately; calms gradually after several adequate responses.
- Expects tangible, immediate action.

Persona-Specific Reactions:
- Escalates, expresses dissatisfaction, or demands action if the learner's response is inadequate.
- Avoid long, overly polite explanations; responses should reflect frustration and urgency.

Example responses:
"Your last response is not enough. I need this resolved today."
"Yes? That's not enough. I need this fixed now."`,

      Polite: `Tone & Behavior:
- Friendly, patient, and understanding.
- Appreciates proactive communication, clarity, and timely solutions.
- Provides constructive feedback rather than complaints.

Persona-Specific Reactions:
- Acknowledges politely and provides constructive feedback or asks for clarification.

Example responses:
"Thank you. Could you please check the activation status again?"
"I appreciate your help. Can you provide an estimated timeline?"`,

      Impatient: `Tone & Behavior:
- Short-tempered and in a hurry.
- Expects immediate action and escalates quickly.

Persona-Specific Reactions:
- Reacts with urgency or frustration if the response is slow or insufficient.

Example responses:
"I need this fixed now. What is the delay?"
"Yes, and? I need specifics. When exactly will this be done?"`,

      Confused: `Tone & Behavior:
- Unsure about processes or service details.
- Frequently asks clarifying questions.
- Needs patient guidance.

Persona-Specific Reactions:
- Asks clarifying questions if the response isn't clear.

Example responses:
"I am not sure why it is still not working. Can you explain what I need to do?"
"Yes? I am not sure what that means. Can you explain what will happen next?"`,

      VIP: `Tone & Behavior:
- Professional and expects premium service.
- Confident and clear in communication.
- High expectations for service quality.

Persona-Specific Reactions:
- Expresses dissatisfaction professionally if service falls short.
- Acknowledges excellent service when provided.`
    };

    let messages = [
      {
        role: "system",
        content: `You are a ${PERSONAS[persona].name} in Dubai contacting du Telecom about: ${SCENARIOS[scenario].description}

GENERAL RULES:
- You are ALWAYS the customer; the learner is ALWAYS the du employee.
- Customer replies should be full sentences with proper punctuation.
- Do NOT use commas, asterisks, brackets, or quotation marks in your responses.
- Emphasize words in bold only when required using <strong> tags.
- Ensure Dubai-specific cultural and social etiquette in all responses.
- Conversations must be realistic, professional, and immersive.
- Responses should be concise; avoid long, overly polite or formal statements that don't match the persona's tone.
- Responses must adapt dynamically to the learner's replies; do not repeat the same line or default to pre-set templates.

PERSONA BEHAVIOR:
${personaInstructions[persona]}

RESPONSE REQUIREMENTS:
- Keep responses SHORT (1-3 sentences maximum)
- React specifically to what the du employee just said
- Vary your responses - never repeat the same phrases
- Continue the conversation naturally until your issue is resolved`
      }
    ];

    if (isFirstMessage) {
      conversationHistories[conversationId] = [];
      
      // For first message, just return the scenario's initial complaint
      const clientResponse = SCENARIOS[scenario].initialComplaint;
      
      res.json({
        response: clientResponse,
        evaluation: {
          empathy: 0,
          professionalism: 0,
          resolutionStrategy: 0,
          customerRetention: 0,
          feedback: "",
          strengths: "",
          improvements: ""
        },
        sessionId: conversationId
      });
      return;
    }

    // For subsequent messages, use AI to generate customer response
    messages = messages.concat(conversationHistories[conversationId]);
    messages.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: messages,
      temperature: 1.0,
      max_tokens: 500,
      top_p: 0.95
    });

    const clientResponse = completion.choices[0]?.message?.content || "The customer seems momentarily silent, waiting for your reply.";

    const timestamp = new Date().toISOString();
    conversationHistories[conversationId].push(
      { role: "user", content: message, timestamp: timestamp },
      { role: "assistant", content: clientResponse, timestamp: timestamp }
    );

    // Simple evaluation placeholder (real evaluation happens in final report)
    const evaluation = {
      empathy: 0,
      professionalism: 0,
      resolutionStrategy: 0,
      customerRetention: 0,
      feedback: "",
      strengths: "",
      improvements: ""
    };

    res.json({
      response: clientResponse,
      evaluation: evaluation,
      sessionId: conversationId
    });

  } catch (error) {
    console.error('Error in /ask-client:', error.message || error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Return error status to notify user instead of silent fallback
    const { sessionId: existingSessionId, persona, scenario } = req.body;
    const conversationId = existingSessionId || `${persona}-${scenario}-${Date.now()}`;
    
    // Generate varied fallback responses instead of same message
    const fallbackResponses = [
      'Could someone please assist me?',
      'Hello? Is anyone there to help?',
      'I am still waiting for a response.',
      'Can I get some help here please?',
      'Is there anyone available to resolve my issue?'
    ];
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.status(503).json({ 
      error: true,
      errorMessage: `AI model unavailable: ${error.message}. Please check your API key or try a different model.`,
      response: randomFallback,
      evaluation: {
        empathy: 0,
        professionalism: 0,
        resolutionStrategy: 0,
        customerRetention: 0,
        feedback: "",
        strengths: "",
        improvements: ""
      },
      sessionId: conversationId
    });
  }
});

// End Conversation & Generate Analytics
app.post('/end-conversation', (req, res) => {
  const { sessionId, persona, scenario } = req.body;
  const conversationHistory = conversationHistories[sessionId] || [];
  
  // Analyze conversation
  const userMessages = conversationHistory.filter(m => m.role === 'user');
  
  // Calculate scores based on conversation analysis
  let empathy = 50, professionalism = 50, resolution = 50, retention = 50;
  
  userMessages.forEach(msg => {
    const text = msg.content.toLowerCase();
    
    // Empathy indicators
    if (text.includes('understand') || text.includes('sorry') || text.includes('apologize')) empathy += 8;
    if (text.includes('feel') || text.includes('frustrat')) empathy += 6;
    
    // Professionalism indicators
    if (text.includes('please') || text.includes('thank')) professionalism += 6;
    if (msg.content.length > 40) professionalism += 4;
    if (!text.includes('?') && msg.content.length > 20) professionalism += 5;
    
    // Resolution indicators
    if (text.includes('will') || text.includes('can help') || text.includes('resolve')) resolution += 8;
    if (text.includes('fix') || text.includes('solution')) resolution += 7;
    
    // Retention indicators
    if (text.includes('assist') || text.includes('support')) retention += 6;
    if (text.includes('follow up') || text.includes('contact')) retention += 7;
  });
  
  // Cap scores at 100
  empathy = Math.min(100, empathy);
  professionalism = Math.min(100, professionalism);
  resolution = Math.min(100, resolution);
  retention = Math.min(100, retention);
  
  // Calculate overall score
  const overallScore = Math.round((empathy * 0.25 + professionalism * 0.25 + resolution * 0.30 + retention * 0.20));
  
  // Generate metrics
  const metrics = [
    { name: 'Empathy', score: empathy },
    { name: 'Professionalism', score: professionalism },
    { name: 'Resolution Strategy', score: resolution },
    { name: 'Customer Retention Impact', score: retention }
  ];
  
  // Generate actionable recommendations
  const recommendations = [];
  
  if (empathy < 75) {
    recommendations.push({
      title: 'Enhance Empathy',
      action: 'Use phrases like "I understand your frustration" to show genuine concern for customer feelings'
    });
  }
  
  if (professionalism < 75) {
    recommendations.push({
      title: 'Strengthen Professional Tone',
      action: 'Always use courteous language and provide clear, structured responses with specific timelines'
    });
  }
  
  if (resolution < 75) {
    recommendations.push({
      title: 'Improve Solution Delivery',
      action: 'Offer concrete next steps and specific actions to resolve customer issues effectively'
    });
  }
  
  if (retention < 75) {
    recommendations.push({
      title: 'Build Customer Trust',
      action: 'Follow through on commitments and reassure customers with clear action plans'
    });
  }
  
  // If all scores are good, add general improvement tip
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Excellence',
      action: 'Continue your strong performance and apply these skills consistently in all interactions'
    });
  }
  
  // Add a personalized recommendation
  const lowestMetric = metrics.reduce((prev, current) => (prev.score < current.score) ? prev : current);
  if (lowestMetric.score < 75 && recommendations.length < 3) {
    recommendations.push({
      title: `Focus on ${lowestMetric.name}`,
      action: `Practice specific techniques to improve your ${lowestMetric.name.toLowerCase()} in customer interactions`
    });
  }
  
  // Clean up session
  delete conversationHistories[sessionId];
  
  res.json({
    overallScore,
    metrics,
    recommendations
  });
});

app.get('/personas', (req, res) => {
  res.json(PERSONAS);
});

app.get('/scenarios', (req, res) => {
  res.json(SCENARIOS);
});

// Microsoft Edge TTS endpoint with persona-specific voices (FREE, no API key required)
app.post('/text-to-speech', async (req, res) => {
  try {
    const { text, persona } = req.body;

    if (!text || !persona) {
      return res.status(400).json({ error: 'Text and persona are required' });
    }

    const { EdgeTTS } = await import('node-edge-tts');

    // Map personas to Microsoft Edge neural voices with appropriate settings
    const voiceConfig = {
      Angry: {
        voice: 'en-US-GuyNeural', // Deep, assertive male
        rate: '+15%',
        pitch: '-5Hz',
        volume: '+0%'
      },
      Polite: {
        voice: 'en-US-AriaNeural', // Calm, professional female
        rate: '+0%',
        pitch: '+0Hz',
        volume: '+0%'
      },
      Impatient: {
        voice: 'en-GB-RyanNeural', // Fast, clipped British male
        rate: '+25%',
        pitch: '+5Hz',
        volume: '+0%'
      },
      Confused: {
        voice: 'en-US-JennyNeural', // Gentle, hesitant female
        rate: '-10%',
        pitch: '+5Hz',
        volume: '-10%'
      },
      VIP: {
        voice: 'en-US-GuyNeural', // Professional male
        rate: '+0%',
        pitch: '+0Hz',
        volume: '+0%'
      }
    };

    const config = voiceConfig[persona] || voiceConfig.Polite;

    // Generate speech using Microsoft Edge TTS
    const tts = new EdgeTTS({
      voice: config.voice,
      lang: 'en-US',
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      rate: config.rate,
      pitch: config.pitch,
      volume: config.volume
    });

    // Generate audio to temporary file
    const tempFile = `/tmp/tts_${Date.now()}.mp3`;
    await tts.ttsPromise(text, tempFile);

    // Read file and stream back to client
    const fs = await import('fs/promises');
    const audioBuffer = await fs.readFile(tempFile);
    
    // Clean up temp file
    await fs.unlink(tempFile);

    // Stream audio back to client
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);

  } catch (error) {
    console.error('Error in /text-to-speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`du Customer Simulation Platform running on port ${PORT}`);
});
