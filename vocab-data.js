/**
 * Curated Vocabulary Decks for Lexi Voice Learning Agent
 */
const VOCAB_DATABASE = [
  {
    id: "ameliorate",
    category: "Executive & Impact",
    word: "ameliorate",
    phonetic: "/əˈmiːli.ə.reɪt/",
    partOfSpeech: "verb",
    definition: "To make something bad, unsatisfactory, or unpleasant better and more bearable.",
    example: "The new transit policy aims to ameliorate severe traffic congestion during peak hours.",
    synonyms: ["improve", "enhance", "alleviate", "mitigate", "upgrade"],
    antonyms: ["worsen", "exacerbate", "aggravate"],
    mnemonic: "Think of 'Amelia rated' high because she made everything better.",
    quizClue: "A formal verb that means to improve or make a distressing condition more tolerable."
  },
  {
    id: "ephemeral",
    category: "Emotional & Nuance",
    word: "ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    partOfSpeech: "adjective",
    definition: "Lasting for a very short time; fleeting or transitory.",
    example: "The cherry blossoms display an ephemeral beauty that disappears in just a few days.",
    synonyms: ["fleeting", "transitory", "momentary", "evanescent", "brief"],
    antonyms: ["permanent", "enduring", "eternal", "everlasting"],
    mnemonic: "Ephemeral sounds like 'eff-fem-moral' — like morning mist evaporating into thin air.",
    quizClue: "An adjective describing something remarkably brief, like a shooting star or morning dew."
  },
  {
    id: "perspicacious",
    category: "Executive & Impact",
    word: "perspicacious",
    phonetic: "/ˌpɜː.spɪˈkeɪ.ʃəs/",
    partOfSpeech: "adjective",
    definition: "Having a ready insight into and keen understanding of things; mentally acute.",
    example: "The perspicacious detective noticed subtle inconsistencies that everyone else overlooked.",
    synonyms: ["shrewd", "astute", "discerning", "insightful", "perceptive"],
    antonyms: ["dull", "obtuseness", "naive", "unperceptive"],
    mnemonic: "Perspective +acious: Someone with extraordinary perspective sees deep into the truth.",
    quizClue: "A word for a person who possesses sharp judgment and deep, penetrating insight."
  },
  {
    id: "serendipity",
    category: "Emotional & Nuance",
    word: "serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    partOfSpeech: "noun",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    example: "Finding my dream job while attending a random tech meetup was pure serendipity.",
    synonyms: ["happy accident", "fluke", "providence", "good fortune", "blessing"],
    antonyms: ["misfortune", "bad luck", "premeditation"],
    mnemonic: "Serene + dip in destiny: Stumbling upon pleasant fortune unexpectedly.",
    quizClue: "A famous noun meaning finding delightful things without intentionally looking for them."
  },
  {
    id: "ubiquitous",
    category: "Executive & Impact",
    word: "ubiquitous",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    partOfSpeech: "adjective",
    definition: "Present, appearing, or found everywhere at the same time.",
    example: "Smartphones have transformed from luxury gadgets into ubiquitous tools of modern life.",
    synonyms: ["omnipresent", "pervasive", "universal", "everywhere", "widespread"],
    antonyms: ["rare", "scarce", "uncommon", "isolated"],
    mnemonic: "You-be-quite-with-us everywhere you go.",
    quizClue: "An adjective that describes something so widespread it seems to exist everywhere at once."
  },
  {
    id: "resilient",
    category: "Everyday Power",
    word: "resilient",
    phonetic: "/rɪˈzɪl.jənt/",
    partOfSpeech: "adjective",
    definition: "Able to withstand or recover quickly from difficult conditions, adversity, or stress.",
    example: "Despite numerous setbacks, the young founder remained resilient and succeeded.",
    synonyms: ["tough", "durable", "buoyant", "adaptable", "tenacious"],
    antonyms: ["fragile", "vulnerable", "weak", "brittle"],
    mnemonic: "Like a rubber band that recoils and springs back into shape after being stretched.",
    quizClue: "A word that describes the capability to bounce back quickly after failure or hardship."
  },
  {
    id: "petrichor",
    category: "Emotional & Nuance",
    word: "petrichor",
    phonetic: "/ˈpet.rɪ.kɔːr/",
    partOfSpeech: "noun",
    definition: "A pleasant, distinctive earthy smell that frequently accompanies the first rain after a dry spell.",
    example: "As the summer shower touched the warm pavement, the soothing scent of petrichor filled the air.",
    synonyms: ["rain-scent", "earthy aroma", "ozone scent"],
    antonyms: ["stench", "aridity"],
    mnemonic: "Petra (stone in Greek) + Ichor (blood of the gods): divine nectar from stone.",
    quizClue: "The poetic term for that unforgettable earthy aroma that rises when rain hits dry soil."
  },
  {
    id: "fastidious",
    category: "Executive & Impact",
    word: "fastidious",
    phonetic: "/fæˈstɪd.i.əs/",
    partOfSpeech: "adjective",
    definition: "Very attentive to and concerned about accuracy and detail; excessively demanding.",
    example: "The master watchmaker was fastidious about the placement of every micro-gear.",
    synonyms: ["meticulous", "scrupulous", "punctilious", "exacting", "perfectionist"],
    antonyms: ["careless", "sloppy", "lax", "negligent"],
    mnemonic: "Fast + tidy: keeping everything fastidiously clean and perfectly orderly.",
    quizClue: "Describes someone who has extremely high standards and obsessively scrutinizes every tiny detail."
  },
  {
    id: "pragmatic",
    category: "Everyday Power",
    word: "pragmatic",
    phonetic: "/præɡˈmæt.ɪk/",
    partOfSpeech: "adjective",
    definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
    example: "Rather than debating endlessly about theory, she proposed a pragmatic, step-by-step compromise.",
    synonyms: ["practical", "sensible", "down-to-earth", "utilitarian", "matter-of-fact"],
    antonyms: ["idealistic", "impractical", "dogmatic", "unrealistic"],
    mnemonic: "Practice-matic: focused on what works in practical reality.",
    quizClue: "An adjective describing an approach focused on realistic practical results rather than rigid theories."
  },
  {
    id: "elucidate",
    category: "Everyday Power",
    word: "elucidate",
    phonetic: "/iˈluː.sɪ.deɪt/",
    partOfSpeech: "verb",
    definition: "To make something clear; to explain lucidly and dispel ambiguity.",
    example: "The professor used real-world metaphors to elucidate complex quantum mechanics concepts.",
    synonyms: ["clarify", "illuminate", "explain", "expound", "unravel"],
    antonyms: ["obscure", "confuse", "cloud", "complicate"],
    mnemonic: "Lucid means clear; elucidate is to bring lucidity and clear light.",
    quizClue: "A verb meaning to explain a concept so clearly that any confusion melts away."
  },
  {
    id: "mellifluous",
    category: "Emotional & Nuance",
    word: "mellifluous",
    phonetic: "/məˈlɪf.lu.əs/",
    partOfSpeech: "adjective",
    definition: "Pleasingly smooth and musical to hear; sweet-sounding.",
    example: "The singer captivated the silent hall with her rich, mellifluous voice.",
    synonyms: ["dulcet", "melodious", "euphonious", "sweet-toned", "harmonious"],
    antonyms: ["cacophonous", "strident", "jarring", "grating"],
    mnemonic: "Melli (honey) + fluent (flow): flowing sweet and smooth like golden honey.",
    quizClue: "An adjective describing a voice or musical tone that is smoothly sweet and flowing like honey."
  },
  {
    id: "cogent",
    category: "Executive & Impact",
    word: "cogent",
    phonetic: "/ˈkoʊ.dʒənt/",
    partOfSpeech: "adjective",
    definition: "Clear, logical, and convincingly persuasive.",
    example: "The defense lawyer presented a cogent argument that swayed the entire jury.",
    synonyms: ["compelling", "convincing", "potent", "persuasive", "sound"],
    antonyms: ["unconvincing", "flimsy", "weak", "incoherent"],
    mnemonic: "Co + agent: acts together with logic to compel belief.",
    quizClue: "A word for an argument so well-structured and logical that it is difficult to dispute."
  }
];

// Helper functions to query vocabulary
const VocabService = {
  getAll: () => VOCAB_DATABASE,
  getCategories: () => [...new Set(VOCAB_DATABASE.map(item => item.category))],
  getByCategory: (category) => VOCAB_DATABASE.filter(item => item.category === category),
  getById: (id) => VOCAB_DATABASE.find(item => item.id === id || item.word.toLowerCase() === id.toLowerCase()),
  getRandom: (excludeId = null) => {
    const list = excludeId ? VOCAB_DATABASE.filter(item => item.id !== excludeId) : VOCAB_DATABASE;
    return list[Math.floor(Math.random() * list.length)];
  },
  findMatchingWord: (text) => {
    if (!text) return null;
    const clean = text.toLowerCase().trim();
    return VOCAB_DATABASE.find(item => 
      clean.includes(item.word.toLowerCase()) || 
      item.synonyms.some(syn => clean.includes(syn.toLowerCase()))
    );
  }
};
