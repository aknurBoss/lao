// Lao Syllable Analyzer and Tone Calculator
// Parses Lao text to identify:
// - Initial consonant & class (High, Mid, Low)
// - Tone mark (none, may ek, may tho, may tri, may chattawa)
// - Vowel and its length (short vs long)
// - Ending / Coda (Live vs Dead)
// - Resulting tone according to Vientiane Lao phonology

import { CONSONANTS, COMPOUND_CONSONANTS } from '../data/consonants';
import { TONE_DEFINITIONS } from '../data/tones';

// Map of consonants to their class
const CONSONANT_CLASS_MAP = {};
CONSONANTS.forEach(c => {
  CONSONANT_CLASS_MAP[c.char] = c.class;
});
// ຢ is Middle class historically in Lao tone rules
CONSONANT_CLASS_MAP['ຢ'] = 'middle';

// Compound high prefixes
const COMPOUND_PREFIXES = ['ໝ', 'ໜ', 'ຫຼ', 'ຫລ', 'ຫມ', 'ຫນ', 'ຫງ', 'ຫຍ', 'ຫວ'];

// Final consonants classification
// Live codas: m, n, ng, y, w
const LIVE_CODAS = ['ງ', 'ນ', 'ມ', 'ຍ', 'ວ', 'ຣ', 'ລ'];
// Dead codas: k, t, p
const DEAD_CODAS = ['ກ', 'ດ', 'ຕ', 'ບ', 'ປ', 'ສ', 'ຖ', 'ຂ', 'ພ', 'ຟ', 'ທ', 'ຊ'];

export function analyzeSyllable(syllableStr) {
  if (!syllableStr || typeof syllableStr !== 'string') {
    return null;
  }
  const clean = syllableStr.trim();
  if (!clean) return null;

  // 1. Detect Tone Mark
  let toneMark = null;
  let toneMarkName = 'None (ບໍ່ມີໄມ້ວັນນະຍຸດ)';
  if (clean.includes('່')) {
    toneMark = 'mayEk';
    toneMarkName = 'ໄມ້ເອກ (May Ek)';
  } else if (clean.includes('້')) {
    toneMark = 'mayTho';
    toneMarkName = 'ໄມ້ໂທ (May Tho)';
  } else if (clean.includes('໊')) {
    toneMark = 'mayTri';
    toneMarkName = 'ໄມ້ຕີ (May Tri)';
  } else if (clean.includes('໋')) {
    toneMark = 'mayChattawa';
    toneMarkName = 'ໄມ້ຈັດຕະວາ (May Chattawa)';
  }

  // 2. Detect Initial Consonant
  let initial = '';
  let consonantClass = 'middle';
  let isCompound = false;

  // Check compounds first
  for (const comp of COMPOUND_PREFIXES) {
    if (clean.startsWith(comp)) {
      initial = comp;
      consonantClass = 'high';
      isCompound = true;
      break;
    }
  }

  // Check ຫ + low consonant prefix written separately (e.g. ຫງ, ຫຍ, ຫລ)
  if (!initial && clean.startsWith('ຫ') && clean.length > 1) {
    const secondChar = clean[1];
    if (CONSONANT_CLASS_MAP[secondChar] === 'low') {
      initial = 'ຫ' + secondChar;
      consonantClass = 'high';
      isCompound = true;
    }
  }

  // Check single consonant (accounting for leading vowels ເ, ແ, ໂ, ໄ, ໃ)
  if (!initial) {
    let index = 0;
    const leadingVowels = ['ເ', 'ແ', 'ໂ', 'ໄ', 'ໃ'];
    if (leadingVowels.includes(clean[0]) && clean.length > 1) {
      index = 1;
    }
    // Check if initial has compound after leading vowel
    for (const comp of COMPOUND_PREFIXES) {
      if (clean.slice(index).startsWith(comp)) {
        initial = comp;
        consonantClass = 'high';
        isCompound = true;
        break;
      }
    }
    if (!initial && clean[index]) {
      initial = clean[index];
      consonantClass = CONSONANT_CLASS_MAP[initial] || 'middle';
    }
  }

  // 3. Detect Coda & Syllable Type (Live vs Dead)
  // Check the last character of the syllable (excluding tone marks)
  const strippedOfMarks = clean.replace(/[່້໊໋]/g, '');
  const lastChar = strippedOfMarks[strippedOfMarks.length - 1];

  let endingType = 'live'; // 'live' or 'dead'
  let endingReason = '';

  // Special diphthongs that are naturally live (ໄ-, ໃ-, ເ-ົາ, -ຳ)
  const isSpecialLiveVowel =
    clean.includes('ໄ') ||
    clean.includes('ໃ') ||
    clean.includes('ຳ') ||
    (clean.includes('ເ') && clean.includes('ົາ'));

  if (DEAD_CODAS.includes(lastChar)) {
    endingType = 'dead';
    endingReason = `Ends with stop consonant '${lastChar}' (p/t/k sound)`;
  } else if (LIVE_CODAS.includes(lastChar)) {
    endingType = 'live';
    endingReason = `Ends with sonorant consonant '${lastChar}' (m/n/ng/w/y sound)`;
  } else if (clean.includes('ະ') || clean.includes('ັ') || clean.includes('ິ') || clean.includes('ຶ') || clean.includes('ຸ')) {
    // If it has short vowel indicator and no live coda, it's a dead syllable (checked by glottal stop)
    if (!strippedOfMarks.slice(1).split('').some(c => LIVE_CODAS.includes(c))) {
      endingType = 'dead';
      endingReason = 'Ends with a short vowel sound (glottal stop)';
    } else {
      endingType = 'live';
      endingReason = 'Has a sonorant final ending';
    }
  } else {
    endingType = 'live';
    endingReason = isSpecialLiveVowel
      ? 'Diphthong / sonorant vowel ending'
      : 'Open syllable with long vowel sound';
  }

  // 4. Detect Vowel Length (short vs long)
  let vowelLength = 'long';
  if (clean.includes('ະ') || clean.includes('ັ') || clean.includes('ິ') || clean.includes('ຶ') || clean.includes('ຸ')) {
    vowelLength = 'short';
  }

  // 5. Calculate Tone
  let calculatedToneId = 'mid';
  let explanation = '';

  if (toneMark === 'mayEk') {
    if (consonantClass === 'middle' || consonantClass === 'high') {
      calculatedToneId = 'low';
      explanation = `${consonantClass.toUpperCase()} class consonant + ໄມ້ເອກ (May Ek) = LOW tone.`;
    } else {
      // Low class + may ek = Low-falling / Mid tone
      calculatedToneId = 'lowFalling';
      explanation = 'LOW class consonant + ໄມ້ເອກ (May Ek) = LOW-FALLING tone.';
    }
  } else if (toneMark === 'mayTho') {
    if (consonantClass === 'middle' || consonantClass === 'high') {
      calculatedToneId = 'highFalling';
      explanation = `${consonantClass.toUpperCase()} class consonant + ໄມ້ໂທ (May Tho) = HIGH-FALLING tone.`;
    } else {
      // Low class + may tho = High-falling / High
      calculatedToneId = 'highFalling';
      explanation = 'LOW class consonant + ໄມ້ໂທ (May Tho) = HIGH-FALLING tone.';
    }
  } else if (toneMark === 'mayTri') {
    calculatedToneId = 'high';
    explanation = 'ໄມ້ຕີ (May Tri) = HIGH tone.';
  } else if (toneMark === 'mayChattawa') {
    calculatedToneId = 'rising';
    explanation = 'ໄມ້ຈັດຕະວາ (May Chattawa) = RISING tone.';
  } else {
    // No tone mark
    if (endingType === 'live') {
      if (consonantClass === 'middle') {
        calculatedToneId = 'mid';
        explanation = 'MIDDLE class consonant + LIVE ending + NO mark = MID tone.';
      } else if (consonantClass === 'high') {
        calculatedToneId = 'rising';
        explanation = 'HIGH class consonant + LIVE ending + NO mark = RISING tone.';
      } else {
        // Low class
        calculatedToneId = 'high';
        explanation = 'LOW class consonant + LIVE ending + NO mark = HIGH tone.';
      }
    } else {
      // Dead ending
      if (consonantClass === 'middle' || consonantClass === 'high') {
        calculatedToneId = 'low';
        explanation = `${consonantClass.toUpperCase()} class consonant + DEAD ending = LOW tone.`;
      } else {
        // Low class
        if (vowelLength === 'short') {
          calculatedToneId = 'mid';
          explanation = 'LOW class consonant + DEAD ending (SHORT vowel) = MID tone.';
        } else {
          calculatedToneId = 'highFalling';
          explanation = 'LOW class consonant + DEAD ending (LONG vowel) = HIGH-FALLING tone.';
        }
      }
    }
  }

  const toneInfo = TONE_DEFINITIONS[calculatedToneId] || TONE_DEFINITIONS.mid;

  return {
    syllable: clean,
    initial,
    consonantClass,
    isCompound,
    toneMark,
    toneMarkName,
    endingType,
    endingReason,
    vowelLength,
    tone: toneInfo,
    explanation,
  };
}
