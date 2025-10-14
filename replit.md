# du Customer Simulation Platform

## Overview
This project is an AI-powered customer simulation platform for du Telecom's Learning & Development, designed to help employees improve customer interaction skills. It offers adaptive, scenario-based learning with real-time AI evaluation and personalized, actionable coaching feedback. The platform aims to transform traditional role-plays into measurable behavioral growth experiences, immersing learners in realistic Dubai-market interactions that reinforce du's customer-centric culture.

## User Preferences
- **AI Role**: Always plays the customer - initiates conversation with complaint/request based on persona and scenario
- **Learner Role**: Always plays the du employee - responds to customer's messages professionally
- **Conversation Flow**: Customer starts → Learner responds → Customer reacts → continues until resolution
- **Customer Responses**: Verbal only (no stage directions), SHORT and NATURAL (1-3 sentences), realistic Dubai customer behavior
- **Error Handling**: Chat never breaks, always continues gracefully with placeholder messages if AI fails
- **Performance Analytics**: After ending conversation, learners see visual analytics dashboard with 4 key metrics (Empathy, Professionalism, Resolution Strategy, Customer Retention Impact) displayed as circular progress indicators with color-coded performance levels, overall performance score, and actionable recommendations for improvement
- **UX Flow**: Guided selection process - persona selection triggers scenario section highlight with pulse animation, start button pulses when both selections complete

## System Architecture

### UI/UX Decisions
The platform features a premium-grade, enterprise-level interface built with Tailwind CSS for styling and du Corporate Branding (du-blue #0073CF, du-cyan #00ADEF, du-red #D71920). The design includes:
- **Welcome Screen**: Dynamic dark gradient background with modern mode selection cards featuring hover lift effects
- **Main Interface**: Clean sidebar with persona/scenario cards showing professional SVG icons (no emojis), main panel with subtle du watermark
- **Chat Interface**: Microsoft Copilot-style message bubbles with smooth animations and typing indicators
- **Dark Mode**: Full light/dark theme toggle with smooth transitions
- **Micro-interactions**: Hover effects, pulse animations, lift-up shadows, and gradient accents
- **Professional Avatars**: Real customer avatar images displayed with circular glow effects
- **Corporate Design**: All icons are professional SVG graphics for an enterprise feel, no emojis used
- **Fixed Layout**: Sidebar with sticky start button at bottom, chat area with auto-scroll to top on new conversation, footer always visible
- **Watermark**: Dynamic du brand watermark with state-based positioning:
  - **Idle State** (before chat): Fixed position at bottom-right corner (32px padding), 7% opacity (5% dark mode), gentle fade-in animation
  - **Active State** (during chat): Absolute position within chat area (100px from bottom, 40px from right), 6% opacity (5% dark mode), smooth 0.4s transition
  - Responsive scaling on smaller screens, z-index layering ensures it never obscures content, never overlaps with footer or input fields
- Typography uses the Inter font family (300-800 weights) for a modern, professional look

### Technical Implementations
The backend is an Express.js server running on port 5000. It utilizes the DeepSeek V3.1 (free) model via OpenRouter for customer simulation. The system handles customer personas (Angry, Confused, Polite, Impatient, VIP customers) and business scenarios (e.g., 5G Rollout Delays, Service Downtime Complaints). It offers both Voice and Text Simulation Modes.

**Customer Persona Behaviors**:

*Angry Customer*:
- Angry but always respectful - no rudeness, just direct frustration
- Remains upset until du employee provides 2-3 adequate, helpful responses
- Does not greet if employee already greeted - responds directly to their message
- Direct and frustrated responses highlighting service issues
- Gradually calms down only when employee provides multiple helpful responses

*Polite Customer*:
- Friendly, patient, and understanding at all times
- Appreciates proactive communication and clear explanations
- Gives constructive feedback instead of complaints
- Reacts positively to helpful responses

*Impatient Customer*:
- Short-tempered and in a hurry
- Expresses urgency clearly and wants immediate action
- Escalates quickly if responses or fixes are slow
- Brief, to-the-point responses

*Confused Customer*:
- Unsure about service processes or technical details
- Frequently asks clarifying questions
- Needs patient guidance from du employee
- Expresses appreciation when things are explained well

**Customer Response Behavior**:
Customers must react realistically and dynamically to du employee behavior:
- **Avoid repetitive single-sentence replies** - never use generic lines like "I see. Can you help me with this?"
- **Each response must be unique and contextual** - reflecting the specific content, tone, and adequacy of employee's message
- **Evolve conversation naturally** - build on what was said before, showing progress, NOT pre-set templates
- **If employee is helpful/polite/apologetic** → Customer responds positively, softens tone, acknowledges effort
- **If employee is dismissive/rude/unhelpful** → Customer becomes frustrated, skeptical, may escalate or express dissatisfaction
- **Angry persona** → Escalates frustration with poor service, gradually calms with good service
- **Polite persona** → Expresses concerns constructively but firmly if treated poorly
- **Impatient persona** → Reacts strongly to delays or unhelpful responses
- **Confused persona** → Seeks urgent clarity if employee is vague

**General Formatting Rules**:
- Use complete, natural sentences with proper punctuation (full stops, commas, question marks)
- NO asterisks, brackets, emojis, or meta-text
- Bold text with `<strong>` tags ONLY if emphasis truly required (without showing symbols)
- Complete sentences only - never cut off mid-thought
- Dubai-specific cultural etiquette in all scenarios
- Realistic, professional, and immersive conversations
- Never repeat mechanical neutral responses - always react to employee's specific words and tone

**Example Responses (Persona-Specific to "Yes")**:

Employee says: "Yes"
- Angry customer: "Yes? That's not enough. I've been waiting for weeks, and I need this resolved immediately."
- Polite customer: "Thank you for confirming. Could you please check the activation status once more?"
- Impatient customer: "Yes, and? I need specifics. When exactly will this be done?"
- Confused customer: "Yes? I'm not sure what that means. Can you explain what will happen next?"

**Reaction to Employee Quality**:

Helpful employee: "I sincerely apologize for the delay. I've prioritized your 5G activation. You'll receive confirmation within 2 hours."
Customer (Angry → Softening): "Okay, I appreciate you taking this seriously. Two hours is acceptable. I'll be waiting for that confirmation."

Unhelpful employee: "There's nothing I can do right now."
Customer (Escalated): "That's completely unacceptable. I've been a loyal customer for years and this is how I'm treated? I need to speak with a supervisor immediately."

### System Design Choices
The core architecture prioritizes robust error handling, ensuring conversations continue gracefully even if AI processing fails. The system is streamlined to focus on chat simulation only, with all performance analytics and reporting features removed. User flow is guided from welcome screen directly to simulation for pure conversational practice. All customer personas and conversational dynamics are specifically tailored to reflect authentic Dubai-based customer behavior and cultural etiquette.

## Voice Simulation Mode
The platform includes a fully optimized **Continuous Voice Simulation Mode** with precision timing and seamless UX:

### Core Features
- **Text + Speech Delivery**: All AI/customer messages are delivered as both bold text AND audible speech
  - Initial AI greeting auto-plays with voice in voice mode
  - Every AI response shown in bold text (no asterisks or markdown symbols)
  - Learner messages displayed in regular text
- **Continuous Voice Interaction**: Learners speak naturally - auto-listening with optional manual control
  - Automatic continuous listening (hands-free)
  - Optional microphone button to manually start/stop listening
  - Zero-click experience for seamless conversations
- **Precise Timing Control**: 
  - 500ms speech pause detection confirms learner finished speaking before processing
  - Prevents partial/overlapping inputs during AI responses
  - Listener auto-pauses during AI thinking AND speaking (no echo/feedback)
  - Immediate auto-resume (200ms) after AI finishes speaking - zero lag
- **Microsoft Edge Text-to-Speech** (FREE, no API key required): High-quality neural voice responses with persona-specific voices:
  - Angry Customer → en-US-GuyNeural (Deep, assertive male, +15% rate, -5Hz pitch)
  - Polite Customer → en-US-AriaNeural (Calm, professional female, normal settings)
  - Impatient Customer → en-GB-RyanNeural (Fast British male, +25% rate, +5Hz pitch)
  - Confused Customer → en-US-JennyNeural (Gentle female, -10% rate, +5Hz pitch, quieter)
  - VIP Customer → en-US-GuyNeural (Professional male voice)

### Intelligent State Management
- **Three-State Voice Loop**:
  - 🎙 **Listening** (blue) - Learner's turn to speak
  - ⏳ **Processing** (yellow) - AI generating response (listener paused)
  - 🗣 **Responding** (purple) - AI speaking (listener paused)
- **Precise End-of-Speech Detection**: Multiple audio event handlers detect exact moment AI finishes speaking
- **Smart Error Recovery**: Graceful handling of API failures, network issues, and browser permission denials
- **Prevents State Confusion**: Robust guards prevent overlapping states (no simultaneous listen/speak/process)

### Technical Optimizations
- **Interim Results Processing**: Uses Web Speech API interim results to detect natural speech pauses
- **Duplicate Prevention**: Tracks last transcript to avoid processing same input twice
- **Safe State Transitions**: Protected start/stop functions prevent race conditions
- **Audio Cleanup**: Proper resource management with URL.revokeObjectURL() and audio disposal
- **Mode Switching**: Seamless switching between voice and text modes with complete state cleanup
- **Accessibility**: All voice messages displayed as text for full accessibility

## External Dependencies
- **OpenRouter**: Provides access to AI models, specifically DeepSeek V3.1 (free) for customer simulation.
- **Microsoft Edge TTS** (node-edge-tts): FREE high-quality neural text-to-speech for Voice Simulation Mode with persona-specific voices. No API key required.
- **Tailwind CSS**: For front-end styling.
- **Web Speech API**: Browser-based voice recognition for voice input capture and fallback TTS if Edge TTS fails.