# Truth or Dare — Data Schema Reference
**Database:** `truth_dare_v5.json` / `data/questions.json`
**Version:** 5.0.0 | **Total Questions:** 1,943 | **Categories:** 32 | **Languages:** 11

> For developer use — describes the JSON structure, all field definitions, filter values, and integration patterns. Read this instead of opening the 2.7MB JSON file.

---

## Table of Contents
1. [File Structure](#1-file-structure)
2. [Question Object — All Fields](#2-question-object--all-fields)
3. [Category Object — All Fields](#3-category-object--all-fields)
4. [All 32 Categories](#4-all-32-categories)
5. [Enums & Filter Values](#5-enums--filter-values)
6. [Special Mechanics](#6-special-mechanics)
7. [Pack & Monetisation](#7-pack--monetisation)
8. [Common Query Patterns](#8-common-query-patterns)

---

## 1. File Structure

```json
{
  "meta":            { },   // database metadata: version, counts, languages
  "age_groups":      { },   // definitions for each age group (label, min/max age)
  "seasonal_packs":  [ ],   // available seasonal themes
  "categories":      [ ]    // array of 32 category objects — the main content
}
```

### Global Stats

| Metric | Value | Breakdown |
|--------|-------|-----------|
| Total questions | 1,943 | 1,242 truths / 701 dares |
| Total categories | 32 | 21 free / 11 premium |
| Age groups | 5 | kids, teens, young_adult, adult, 18plus |
| Languages | 11 | en + 10 translations |
| Moods | 4 | party (1,010) · intimate (567) · chill (297) · icebreaker (69) |
| Intensity scale | 1–5 | 1 = mild, 5 = extreme |

---

## 2. Question Object — All Fields

Every question has every field. None are optional.

### Core Identity

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"fr_te_t_001"` | Unique ID. Format: `{cat}_{age}_{type}_{num}` |
| `type` | `string` | `"truth"` | `"truth"` or `"dare"` |
| `age_group` | `string` | `"teens"` | One of: `kids`, `teens`, `young_adult`, `adult`, `18plus` |
| `text` | `string` | `"Have you ever..."` | The question or dare text in English |

### Gameplay Metadata

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `tags` | `string[]` | `["deep","cringe"]` | Primary tags: `funny`, `deep`, `cringe`, `wholesome`, `romantic` |
| `sub_tags` | `string[]` | `["nostalgia","trust"]` | Granular topic tags (73 available). Used for smart filtering. |
| `group_size` | `string` | `"group"` | Best played: `solo`, `pair`, or `group` |
| `intensity` | `integer` | `3` | 1 (mild) to 5 (extreme) — emotional/social intensity |
| `duration_seconds` | `int\|null` | `30` | Dare time limit in seconds. `null` for truths. |
| `mood` | `string` | `"party"` | Room vibe: `party`, `intimate`, `chill`, `icebreaker` |
| `props` | `string[]` | `["phone"]` | Items needed for dare: `"phone"`, `"paper"`, `"pen"`. Empty `[]` if none. |
| `relationship_type` | `string[]` | `["close_friends"]` | Best context — see [Relationship Types](#relationship-types) |
| `seasonal` | `string` | `"halloween"` | `"none"` or theme: `christmas`, `halloween`, `valentines`, `new_year`, `summer` |

### Special Mechanics

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `chain` | `boolean` | `true` | If `true`, next player must respond to this answer |
| `chain_prompt` | `string\|null` | `"Based on {player}..."` | Text shown to next player. Replace `{player}` with answerer's name. |
| `hot_seat` | `boolean` | `false` | If `true`, group fires rapid questions at one player for `duration_seconds` |
| `escalation_level` | `int\|null` | `2` | 1–5 for questions in an escalating series. `null` if standalone. |
| `screenshot_moment` | `boolean` | `true` | Dare designed to produce a shareable/funny photo or video |
| `reaction_prompt` | `string\|null` | `"Group reacts..."` | Optional follow-up shown to the group after the answer |

### Discovery & Learning

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `follow_up_question` | `string` | `"Would you do it again?"` | Suggested follow-up to go deeper. Always present on every question. |
| `related_questions` | `string[]` | `["fr_ya_t_005"]` | IDs of 1–2 thematically related questions from other categories |
| `bundle_id` | `string\|null` | `"nostalgia_arc"` | Groups questions into a narrative arc for sequential serving |

### Localisation

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `translations` | `object` | `{"vi":"...", "es":"..."}` | Translated text keyed by language code. 10 languages when fully translated. |

### Admin / Analytics

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `flagged` | `boolean` | `false` | Set `true` to hide question pending review |
| `community_submitted` | `boolean` | `false` | `true` for user-submitted questions |
| `analytics` | `object` | `{times_played: 0}` | Write-back stub — see [Analytics](#analytics-write-back) |

### Full Question Example

```json
{
  "id": "fr_te_t_016",
  "type": "truth",
  "age_group": "teens",
  "text": "What's the most recent thing a friend did that genuinely surprised you — in a good way?",
  "tags": ["wholesome", "deep"],
  "sub_tags": ["belonging", "gratitude"],
  "group_size": "solo",
  "intensity": 2,
  "duration_seconds": null,
  "seasonal": "none",
  "flagged": false,
  "community_submitted": false,
  "mood": "chill",
  "props": [],
  "relationship_type": ["close_friends", "party"],
  "chain": false,
  "chain_prompt": null,
  "hot_seat": false,
  "escalation_level": null,
  "screenshot_moment": false,
  "reaction_prompt": null,
  "follow_up_question": "Did you tell them that?",
  "related_questions": ["fr_ya_t_016"],
  "bundle_id": null,
  "translations": {
    "vi": "Điều gần đây nhất mà một người bạn làm khiến bạn thực sự bất ngờ — theo hướng tốt — là gì?",
    "es": "¿Cuál es la cosa más reciente que un amigo hizo que genuinamente te sorprendió — para bien?",
    "zh": "最近朋友做的让你真正感到惊喜的事情是什么？"
  },
  "analytics": {
    "times_played": 0,
    "times_skipped": 0,
    "times_completed": 0,
    "avg_reaction": null,
    "skip_rate": null,
    "completion_rate": null
  }
}
```

---

## 3. Category Object — All Fields

```json
{
  "id": "friendship",
  "label": "Friendship",
  "icon": "👫",
  "color": "#FF6B9D",
  "explicit": false,
  "pack": {
    "is_premium": false,
    "pack_id": "base",
    "unlock_price_usd": null,
    "recommended_group_size": [3, 10],
    "recommended_duration_minutes": 20,
    "best_for": ["party", "close_friends", "new_friends"]
  },
  "questions": [ /* array of question objects */ ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique snake_case identifier |
| `label` | `string` | Display name shown in UI |
| `icon` | `string` | Emoji icon for the category card |
| `color` | `string` | Hex color for card background/accent |
| `explicit` | `boolean` | `true` for 18+ categories — gate behind age verification |
| `pack` | `object` | Monetisation config — see [Pack Object](#pack-object) |
| `questions` | `array` | Array of question objects |

### Pack Object

| Field | Type | Description |
|-------|------|-------------|
| `is_premium` | `boolean` | If `true`, category locked behind a purchase |
| `pack_id` | `string` | Pack this belongs to: `base`, `couples`, `adult_18`, `adult_life`, `deep_dive` |
| `unlock_price_usd` | `float\|null` | USD price. `null` for free categories. |
| `recommended_group_size` | `[int, int]` | Min/max ideal player count |
| `recommended_duration_minutes` | `integer` | Suggested play time in minutes |
| `best_for` | `string[]` | Ideal contexts: `party`, `couple`, `family`, `close_friends`, `coworkers`, `intimate` |

---

## 4. All 32 Categories

| Icon | ID | Label | Questions | Ages | Pack | Explicit | Description |
|------|----|-------|-----------|------|------|----------|-------------|
| 👫 | `friendship` | Friendship | 106 | kids–adult | free | ❌ | Classic friendship questions. Wholesome to cringe. Great icebreaker. |
| 💕 | `romance` | Romance | 82 | kids–adult | free | ❌ | Crushes, dating, relationships. Scales from innocent to honest. |
| 😳 | `embarrassing` | Embarrassing Moments | 94 | kids–adult | free | ❌ | Cringe memories, public fails, awkward stories. |
| 👨‍👩‍👧‍👦 | `family` | Family | 92 | kids–adult | free | ❌ | Parents, siblings, traditions, childhood dynamics. |
| 📚 | `school_work` | School & Work | 90 | kids–adult | free | ❌ | School memories, career, all-nighters, professional fails. |
| 😱 | `fears` | Fears & Phobias | 88 | kids–adult | free | ❌ | Personal fears, vulnerability, what scares you most. |
| 📱 | `social_media` | Social Media | 89 | kids–adult | free | ❌ | Online identity, screen time, embarrassing posts, DMs. |
| 🧠 | `deep_thoughts` | Deep Thoughts | 90 | kids–18+ | free | ❌ | Philosophy, life meaning, identity, values. |
| 🤔 | `would_you_rather` | Would You Rather | 70 | kids–18+ | free | ❌ | Hypothetical dilemmas across all difficulty levels. |
| 💑 | `couples_edition` | Couples Edition | 58 | teens–adult | **couples $1.99** | ❌ | Questions designed specifically for romantic partners. |
| ♊ | `zodiac_personality` | Zodiac & Personality | 56 | kids–adult | free | ❌ | Star signs, personality types, self-perception. |
| 🕺 | `body_language_dares` | Body Language Dares | 46 | kids–adult | free | ❌ | Physical performance dares: impressions, dancing, acting. |
| 🃏 | `wild_card` | Wild Card | 83 | kids–adult | free | ❌ | Random mix of truths and dares across all topics. |
| 🔥 | `hot_takes` | Hot Takes | 81 | teens–adult | free | ❌ | Controversial opinions, unpopular beliefs, group debates. |
| 🙈 | `never_have_i_ever` | Never Have I Ever | 83 | kids–adult | free | ❌ | Classic confession format across all age groups. |
| 🎵 | `music_vibes` | Music & Vibes | 81 | kids–adult | free | ❌ | Music tastes, singing dares, song-based truths. |
| 🌶️ | `relationships_18plus` | Spicy Relationships | 40 | 18+ | **adult_18 $2.99** | ✅ | Adult relationship questions, commitment, intimacy topics. |
| 🌙 | `after_dark_18plus` | After Dark Dares | 40 | 18+ | **adult_18 $2.99** | ✅ | Bold adult dares for mature groups. |
| 🔒 | `dark_secrets_18plus` | Dark Secrets | 43 | 18+ | **adult_18 $2.99** | ✅ | Deep confessions, vulnerability, things never said aloud. |
| 🌍 | `culture_travel` | Culture & Travel | 81 | kids–adult | free | ❌ | Travel experiences, cultural curiosity, language, food. |
| 🎮 | `gaming_tech` | Gaming & Tech | 81 | kids–adult | free | ❌ | Gaming habits, screen time, social media, tech opinions. |
| 💼 | `work_career` | Work & Career | 46 | young adult–adult | **adult_life $1.99** | ❌ | Career fears, workplace drama, salary, ambition. |
| 🎭 | `roleplay_act` | Roleplay & Act It Out | 56 | kids–adult | free | ❌ | Performance dares: impressions, roleplay scenes, acting. |
| 👁️ | `first_impressions` | First Impressions | 28 | teens–adult | free | ❌ | Directed at specific people in the room — unique mechanic. |
| 💰 | `money_status` | Money & Status | 39 | young adult–adult | **adult_life $1.99** | ❌ | Income, spending habits, financial honesty. |
| 🔥 | `unpopular_opinions` | Unpopular Opinions | 29 | teens–adult | free | ❌ | Controversial takes, debate-starter questions. |
| 🌙 | `dream_vs_reality` | Dream vs Reality | 36 | kids–adult | **deep_dive $1.99** | ❌ | Life goals, regrets, the gap between plans and reality. |
| 🤫 | `confessions_lite` | Confessions | 30 | teens–adult | **deep_dive $1.99** | ❌ | Things never told to anyone in the room specifically. |
| 🧲 | `chemistry_attraction_18plus` | Chemistry & Attraction | 40 | 18+ | **adult_18 $2.99** | ✅ | Attraction, flirting, desire — bold but not explicit. |
| 💋 | `desire_honesty_18plus` | Desire & Honesty | 40 | 18+ | **adult_18 $2.99** | ✅ | Emotional intimacy, relationship honesty, vulnerability. |
| 🔗 | `chain_mode` | Chain Reactions | 10 | teens–18+ | free | ❌ | Questions where next player responds to the previous answer. |
| 📈 | `escalating_mode` | Escalating Series | 15 | teens–18+ | **deep_dive $1.99** | ❌ | Linked sets of 5 questions increasing in intensity (levels 1–5). |

---

## 5. Enums & Filter Values

### Age Groups

| Value | Range | Filter Inherits |
|-------|-------|-----------------|
| `kids` | 6–12 | kids only |
| `teens` | 13–17 | kids + teens |
| `young_adult` | 18–24 | kids + teens + young_adult |
| `adult` | 25–40 | kids + teens + young_adult + adult |
| `18plus` | 18+ | all including 18plus (explicit: true) |

> **Age group inheritance:** When filtering for `adult`, include questions from `kids`, `teens`, `young_adult`, and `adult`. Only `18plus` selection unlocks `explicit: true` categories.

### Mood

| Value | Count | When to serve |
|-------|-------|----------------|
| `icebreaker` | 69 | Game start, new groups, warming up |
| `party` | 1,010 | High energy, group laughs, main game flow |
| `chill` | 297 | Mid-game cooldown, reflective moments |
| `intimate` | 567 | Close friends or couples, deeper connection |

### Relationship Types

| Value | Description |
|-------|-------------|
| `new_friends` | Just met — safe icebreakers, no personal history assumed |
| `close_friends` | Known 1+ year — deeper questions appropriate |
| `couple` | Romantic partners — intimate and relationship-focused |
| `family` | Family-appropriate, multigenerational safe |
| `coworkers` | Office/professional — HR-safe |
| `party` | Large mixed group, casual, high energy |
| `intimate` | Very small group (2–3), deep emotional content |

### Languages (translations object keys)

| Code | Language | Register |
|------|----------|----------|
| `en` | English | Base language — all questions |
| `es` | Spanish | Casual Latin American |
| `zh` | Chinese (Simplified) | Casual Mandarin youth speech |
| `hi` | Hindi | Casual conversational |
| `ar` | Arabic | Modern Standard, relaxed tone |
| `pt` | Portuguese | Brazilian casual informal |
| `fr` | French | Casual colloquial, tu-form |
| `id` | Indonesian | Casual Bahasa Indonesia |
| `vi` | Vietnamese | Southern casual, bạn/mình style |
| `ja` | Japanese | Casual, informal endings ね/よ |
| `de` | German | Casual du-form |

**Usage:** `question.translations[langCode] ?? question.text` — always fallback to English if translation missing.

### Tags (primary)

`funny` · `deep` · `cringe` · `wholesome` · `romantic`

### Top 15 Sub-Tags

| Sub-tag | Count | Topics covered |
|---------|-------|----------------|
| `nostalgia` | 925 | Past memories, childhood, things left behind |
| `identity` | 894 | Self-concept, personality, who you are |
| `impressions` | 826 | Acting, mimicry, performance dares |
| `performance` | 700 | Physical dares, singing, dancing, roleplay |
| `reputation` | 574 | Social standing, embarrassment, what others think |
| `vulnerability` | 412 | Emotional openness, admissions, deep truths |
| `desire` | 320 | Wants, attraction, ambition |
| `attraction` | 317 | Romantic interest, physical appeal |
| `belonging` | 219 | Friendship, inclusion, group identity |
| `trust` | 199 | Honesty, secrets, reliability |
| `morality` | 186 | Ethics, right vs wrong, values judgements |
| `values` | 178 | Beliefs, priorities, what matters |
| `online-identity` | 171 | Social media persona vs real self |
| `peer-pressure` | 164 | Fitting in, social conformity, influence |
| `phone-dare` | 149 | Dares that require a phone |

Full sub-tag pool (73 total): `self-worth`, `grief`, `loneliness`, `gratitude`, `social-anxiety`, `gossip`, `exclusion`, `leadership`, `flirting`, `heartbreak`, `commitment`, `ex-relationships`, `dating`, `body-image`, `jealousy`, `compatibility`, `parents`, `siblings`, `childhood`, `family-conflict`, `expectations`, `generational`, `home`, `traditions`, `ambition`, `failure`, `success`, `money`, `debt`, `career-change`, `work-stress`, `workplace-drama`, `hustle`, `physical-challenge`, `singing`, `dancing`, `food`, `animals`, `games`, `travel`, `culture-shock`, `language`, `food-culture`, `life-goals`, `regret`, `future`, `past`, `hypothetical`, `secrets`, `guilt`, `forgiveness`, `boundaries`, `jealousy-romantic`

---

## 6. Special Mechanics

### Chain Questions
**Detect:** `question.chain === true`

After the current player answers, show `chain_prompt` to the next player. Replace `{player}` with the answerer's display name.

```typescript
if (question.chain && question.chain_prompt) {
  const prompt = question.chain_prompt.replace('{player}', currentPlayer.name);
  showChainBanner(prompt); // shown to next player before their turn
}
```

**Count in database:** 11 chain questions

### Hot Seat Mode
**Detect:** `question.hot_seat === true`

The entire group fires rapid questions at one player for `duration_seconds`. Start a countdown timer and let other players ask freely.

**Count in database:** 4 hot seat questions

### Escalating Series
**Detect:** `question.escalation_level !== null`

Questions with `escalation_level` 1–5 belong to a linked series. Serve them in order for a narrative arc that builds in intensity.

```typescript
// Get a full escalating series sorted by level
const series = allQuestions
  .filter(q => q.bundle_id === 'vulnerability_arc')
  .sort((a, b) => (a.escalation_level ?? 0) - (b.escalation_level ?? 0));
```

**Count in database:** 17 questions in escalating series (3 series total)

### Bundle Arcs
**Detect:** `question.bundle_id !== null`

Bundle IDs group thematically related questions for sequential serving.

| bundle_id | Description |
|-----------|-------------|
| `vulnerability_arc` | Self-worth, openness, emotional honesty |
| `nostalgia_arc` | Past memories, childhood, friends drifted from |
| `identity_arc` | Who you are vs who you present to the world |
| `couple_deep_arc` | Deep intimacy questions for romantic partners |
| `money_confession_arc` | Financial honesty and status confessions |
| `phone_dare_arc` | Dares requiring a phone — chain for escalating embarrassment |

**Count in database:** 19 questions assigned to bundle arcs

### Props Required
**Detect:** `question.props.length > 0`

Some dares need physical items. Warn players before serving a props dare.

| Prop value | When needed |
|------------|-------------|
| `"phone"` | Show social media, send messages, reveal screen |
| `"paper"` | Write something down |
| `"pen"` | Write something down |

**Count in database:** 178 dares with props

### Screenshot Moments
**Detect:** `question.screenshot_moment === true`

Dare is specifically designed to produce a shareable funny/memorable photo or video.

**Count in database:** 5 screenshot moment dares

### Analytics Write-Back

The `analytics` object on each question is a stub for your backend to populate:

```typescript
// After a question is answered
question.analytics.times_played += 1;
question.analytics.times_completed += wasCompleted ? 1 : 0;
question.analytics.times_skipped += wasSkipped ? 1 : 0;

// Recalculate periodically
if (question.analytics.times_played > 0) {
  question.analytics.skip_rate =
    question.analytics.times_skipped / question.analytics.times_played;
  question.analytics.completion_rate =
    question.analytics.times_completed / question.analytics.times_played;
}
```

---

## 7. Pack & Monetisation

| Pack ID | Price | Categories | Questions | Best for |
|---------|-------|-----------|-----------|----------|
| `base` | FREE | 21 | 1,516 | All users — general gameplay |
| `couples` | $1.99 | 1 | 58 | Romantic partners, date nights |
| `adult_life` | $1.99 | 2 | 85 | Adults 25+, work socials, life confessions |
| `deep_dive` | $1.99 | 3 | 81 | Close friends, deep emotional content |
| `adult_18` | $2.99 | 5 | 203 | Adults 18+ only — requires age verification |

### Checking access in code

```typescript
function isCategoryAccessible(category: Category, unlockedPacks: string[]): boolean {
  if (!category.pack.is_premium) return true;
  return unlockedPacks.includes(category.pack.pack_id);
}

function getAccessibleQuestions(allQuestions: Question[], unlockedPacks: string[]): Question[] {
  return allQuestions.filter(q => {
    const cat = CATEGORIES.find(c => c.id === getCategoryId(q.id));
    return cat ? isCategoryAccessible(cat, unlockedPacks) : false;
  });
}
```

---

## 8. Common Query Patterns

### Build a question pool for a game session

```typescript
function buildQuestionPool(config: GameConfig, unlockedPacks: string[]): Question[] {
  return allQuestions
    .filter(q => matchesAgeGroup(q.age_group, config.ageGroup))  // age inheritance
    .filter(q => !config.mood || q.mood === config.mood)
    .filter(q => !q.flagged)
    .filter(q => isCategoryAccessible(getCategoryById(q), unlockedPacks))
    .filter(q => config.typeFilter === 'both' || q.type === config.typeFilter)
    .filter(q => config.categoryIds === 'all' || config.categoryIds.includes(getCategoryId(q.id)));
}
```

### Age group inheritance

```typescript
const AGE_INCLUDES: Record<AgeGroup, AgeGroup[]> = {
  kids:        ['kids'],
  teens:       ['kids', 'teens'],
  young_adult: ['kids', 'teens', 'young_adult'],
  adult:       ['kids', 'teens', 'young_adult', 'adult'],
  '18plus':    ['kids', 'teens', 'young_adult', 'adult', '18plus'],
};

function matchesAgeGroup(questionAge: AgeGroup, selectedAge: AgeGroup): boolean {
  return AGE_INCLUDES[selectedAge].includes(questionAge);
}
```

### Get translation with English fallback

```typescript
function getQuestionText(question: Question, lang: LanguageCode): string {
  if (lang === 'en') return question.text;
  return question.translations?.[lang] || question.text;
}
```

### Shuffle with recent-ID dedup

```typescript
function preparePool(pool: Question[], recentIds: string[]): Question[] {
  const deduped = pool.filter(q => !recentIds.includes(q.id));
  const source = deduped.length >= 10 ? deduped : pool; // fallback if dedup too aggressive
  return fisherYates(source);
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### Filter by sub-tag

```typescript
const nostalgiaQuestions = allQuestions.filter(q => q.sub_tags.includes('nostalgia'));
const phoneQuestions = allQuestions.filter(q => q.props.includes('phone'));
```

### Get an escalating series in order

```typescript
function getEscalatingSeries(bundleId: string): Question[] {
  return allQuestions
    .filter(q => q.bundle_id === bundleId)
    .sort((a, b) => (a.escalation_level ?? 0) - (b.escalation_level ?? 0));
}
```

### Kids / family safe mode

```typescript
const safePool = allQuestions.filter(q =>
  q.age_group === 'kids' &&
  !q.flagged &&
  q.intensity <= 2 &&
  ['party', 'icebreaker'].includes(q.mood) &&
  !q.props.length // no phone/paper needed
);
```

### Find questions with chain mechanics

```typescript
const chainQuestions    = allQuestions.filter(q => q.chain);           // 11 questions
const hotSeatQuestions  = allQuestions.filter(q => q.hot_seat);        // 4 questions
const escalatingQuestions = allQuestions.filter(q => q.escalation_level !== null); // 17 questions
```
