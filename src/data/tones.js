// Lao Tones and Tone Rules (Vientiane Standard - 6 Tones)

export const TONE_MARKS = [
  {
    mark: '່',
    nameLao: 'ໄມ້ເອກ (May Ek)',
    nameEnglish: 'First Tone Mark',
    description: 'Forces Low tone on Middle and High consonants; Mid / Low-Falling tone on Low consonants.',
    example: 'ໄກ່ (gai - chicken, Low tone), ແມ່ (maae - mother, Mid tone)',
  },
  {
    mark: '້',
    nameLao: 'ໄມ້ໂທ (May Tho)',
    nameEnglish: 'Second Tone Mark',
    description: 'Produces High-Falling tone on Middle and High consonants; High / High-Falling tone on Low consonants.',
    example: 'ບ້ານ (baan - home), ນ້ຳ (nam - water)',
  },
  {
    mark: '໊',
    nameLao: 'ໄມ້ຕີ (May Tri)',
    nameEnglish: 'Third Tone Mark',
    description: 'Rare; primarily used on Middle class words for onomatopoeia or loanwords (produces High tone).',
    example: 'ໂຕະ໊ (to - emphatic table)',
  },
  {
    mark: '໋',
    nameLao: 'ໄມ້ຈັດຕະວາ (May Chattawa)',
    nameEnglish: 'Fourth Tone Mark',
    description: 'Rare; primarily used on Middle class words (produces Rising tone).',
    example: 'ປ໋ອງ (pawng - can / tin)',
  },
];

export const TONE_DEFINITIONS = {
  mid: {
    id: 'mid',
    name: 'Mid Tone',
    nameLao: 'ສຽງສາມັນ (ກາງ)',
    pitchNumber: '˧˧ (33)',
    description: 'Steady, comfortable pitch around the middle of your vocal range without rising or falling.',
    color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
    contourPoints: [1.0, 1.0, 1.0], // flat mid
    exampleWord: 'ກາ (gaa - crow)',
    ipaSymbol: '˧',
  },
  low: {
    id: 'low',
    name: 'Low Tone',
    nameLao: 'ສຽງເອກ (ຕ່ຳ)',
    pitchNumber: '˨˩ (21)',
    description: 'Starts low in your voice and slightly falls down even lower.',
    color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
    contourPoints: [0.85, 0.8, 0.72], // low falling
    exampleWord: 'ໄກ່ (gai - chicken)',
    ipaSymbol: '˩',
  },
  high: {
    id: 'high',
    name: 'High Tone',
    nameLao: 'ສຽງຕີ (ສູງ)',
    pitchNumber: '˥˥ (55)',
    description: 'Starts high in your head voice and stays level with bright, energetic pitch.',
    color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
    contourPoints: [1.35, 1.35, 1.32], // high level
    exampleWord: 'ມາ (maa - come)',
    ipaSymbol: '˥',
  },
  rising: {
    id: 'rising',
    name: 'Rising Tone',
    nameLao: 'ສຽງຈັດຕະວາ (ຂຶ້ນ)',
    pitchNumber: '˨˦ (24)',
    description: 'Starts low and sweeps upward like asking a curious question in English: "Really?!"',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    contourPoints: [0.82, 0.95, 1.3], // rising curve
    exampleWord: 'ຂາ (khaa - leg)',
    ipaSymbol: '˨˦',
  },
  highFalling: {
    id: 'highFalling',
    name: 'High Falling Tone',
    nameLao: 'ສຽງໂທ (ຕົກສູງ)',
    pitchNumber: '˥˩ (51)',
    description: 'Starts high and glides down sharply and firmly, like a resolute "Yes!" or "No!".',
    color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
    contourPoints: [1.35, 1.1, 0.75], // steep fall
    exampleWord: 'ບ້ານ (baan - village/home)',
    ipaSymbol: '˥˩',
  },
  lowFalling: {
    id: 'lowFalling',
    name: 'Low Falling Tone',
    nameLao: 'ສຽງຕົກຕ່ຳ',
    pitchNumber: '˧˩ (31)',
    description: 'Starts at mid pitch and gently descends down to a low register.',
    color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
    contourPoints: [1.05, 0.9, 0.75], // gentle fall
    exampleWord: 'ແມ່ (maae - mother)',
    ipaSymbol: '˧˩',
  },
};

// Educational tone rules table
export const TONE_RULES_TABLE = [
  {
    consonantClass: 'Middle (ກາງ)',
    noMarkLive: { tone: 'Mid (ກາງ)', example: 'ກາ (gaa)' },
    noMarkDeadShort: { tone: 'Low (ຕ່ຳ)', example: 'ກະ (ka)' },
    noMarkDeadLong: { tone: 'Low (ຕ່ຳ)', example: 'ກາດ (kaat)' },
    mayEk: { tone: 'Low (ຕ່ຳ)', example: 'ໄກ່ (gai)' },
    mayTho: { tone: 'High-Falling (ຕົກສູງ)', example: 'ເກົ້າ (gao)' },
  },
  {
    consonantClass: 'High (ສູງ)',
    noMarkLive: { tone: 'Rising (ຂຶ້ນ)', example: 'ຂາ (khaa)' },
    noMarkDeadShort: { tone: 'Low (ຕ່ຳ)', example: 'ຂະ (kha)' },
    noMarkDeadLong: { tone: 'Low (ຕ່ຳ)', example: 'ຂາດ (khaat)' },
    mayEk: { tone: 'Low (ຕ່ຳ)', example: 'ໄຂ່ (khai)' },
    mayTho: { tone: 'High-Falling (ຕົກສູງ)', example: 'ເຂົ້າ (khao)' },
  },
  {
    consonantClass: 'Low (ຕໍ່າ)',
    noMarkLive: { tone: 'High (ສູງ)', example: 'ມາ (maa)' },
    noMarkDeadShort: { tone: 'Mid (ກາງ)', example: 'ຄະ (kha)' },
    noMarkDeadLong: { tone: 'High-Falling (ຕົກສູງ)', example: 'ມາກ (maak)' },
    mayEk: { tone: 'Low-Falling (ຕົກຕ່ຳ)', example: 'ແມ່ (maae)' },
    mayTho: { tone: 'High-Falling (ຕົກສູງ)', example: 'ມ້າ (maa)' },
  },
];
