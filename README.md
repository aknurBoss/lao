# LaoLingo (ຮຽນພາສາລາວ) 🇱🇦🐘
### The Duolingo for Learning Lao — Reading, Speaking & Tones

A gamified Duolingo-style language learning application specifically designed for the **Lao Language**, featuring full support for **Telegram Web / Mini App (TWA)**, **Mobile Phones**, and **Laptops**.

---

## 🌟 Duolingo Experience Features

1. **Learning Path & Stepping Stones**:
   - Meandering winding path through Units (Greetings, Food & Sticky Rice, Alphabet & Consonant Classes, Tones, Shopping & Numbers, Travel).
   - Milestone Treasure Chests (`💎 Gems` rewards).
   - Unit Guidebooks summarizing key phrases and grammar notes.

2. **Bite-Sized Gamified Lessons**:
   - **Word Bank Builder**: Tap scrambled word tiles into order to build sentences.
   - **Multiple Choice Cards**: Tappable cards with audio, Romanization, and English.
   - **Match Pairs**: Match Lao words with English definitions with tactile haptics.
   - **Listen & Pick**: Spoken audio prompt comprehension.
   - **Tone Ear Trainer**: Formant pitch synthesizer for Lao tones.
   - **Speaking & Repeat Drill**: Pronounce words and compare with native voice.

3. **Gamification Economy**:
   - ❤️ **Hearts / Lives**: 5 Hearts max. Lose 1 on mistake. Practice or use gems to refill.
   - 💎 **Gems (Lingots)**: Earn by completing lessons and opening unit chests. Use in Shop.
   - 🔥 **Daily Streak**: Track daily practice with Streak Freeze protection (`🧊`).
   - 🏆 **Leagues & Leaderboard**: Compete with other learners in Bronze, Silver, Gold, and Diamond leagues.
   - 🎯 **Daily Quests & Badges**: Earn XP goals and collect achievements.

4. **"Xang" (ຊ້າງ) the Mascot**:
   - Cheerful green Lao baby elephant mascot with dynamic mood animations (Happy, Celebrate, Thinking, Sad/Encouraging).

5. **Integrated Specialized Workshops**:
   - **Script & Stroke Order Pad**: Trace 27 Lao consonants and vowels with handwriting canvas.
   - **Live Tone Calculator**: Automatically parses any Lao syllable and explains consonant class, coda, and calculated tone.
   - **Conversational Studio**: Real-life dialogues with microphone recorder and waveform comparison.
   - **Tokenized Graded Reader**: Click any word in stories to decode its meaning and tone.
   - **Searchable Phrasebook**: 25+ essential situational phrases.

---

## 📱 Running in Telegram Web / Mini App (TWA)

This app includes full native integration with the **Telegram WebApp SDK**:
- Auto-expands to full mobile screen (`Telegram.WebApp.expand()`).
- Haptic tactile feedback on mobile phone taps (`Telegram.WebApp.HapticFeedback`).
- Syncs with Telegram user profile (First Name, Username, Profile Photo).
- Native Telegram BackButton support during lessons.
- Share link directly to Telegram chats.

### Connecting to Telegram with @BotFather:
1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newapp`.
3. Select your bot.
4. Set App Title: `LaoLingo`
5. Provide your app's live URL (e.g., deployed on Vercel, Render, Cloudflare, or local `ngrok http 5173`).
6. Launch your Telegram Mini App link (e.g. `https://t.me/your_bot/app`) on mobile phone, desktop, or Telegram Web!

---

## 💻 Running on Mobile Phone or Laptop

- **Local Laptop**: `http://localhost:5173/`
- **Mobile Phone over WiFi**: Open `http://<YOUR-LOCAL-IP>:5173/` (e.g., `http://192.168.18.171:5173/`) on your phone browser.
- **Toggle View on Laptop**: Click the phone/monitor icon in the top right to switch between **Full Desktop Mode** (with left navigation sidebar) and **Mobile Phone Mockup** (simulating a mobile phone inside a bezel).
