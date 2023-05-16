/* eslint no-unused-vars: 0 */

const SPECIAL_COUNTER_NUMBERS_MAP = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  '１': 1,
  '２': 2,
  '３': 3,
  '４': 4,
  '５': 5,
  '６': 6,
  '７': 7,
  '８': 8,
  '９': 9,
  '１０': 10,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  何: 0,
};

// rules from here:
// http://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/017.html
const SPECIAL_COUNTER_MAP = {
  人: [
    null,
    'ひとり',
    'ふたり',
    null,
    'よにん',
  ],
  匹: [
    'なんびき',
    'いっぴき',
    null,
    'さんびき',
    null,
    null,
    'ろっぴき',
    null,
    'はっぴき',
    null,
    'じゅっぴき',
    'なんびき',
  ],
  階: [
    'なんがい',
    'いっかい',
    null,
    null,
    null,
    null,
    'ろっかい',
    null,
    null,
    'じゅっかい',
    'なんがい',
  ],
  回: [
    null,
    'いっかい',
    null,
    null,
    null,
    null,
    'ろっかい',
    null,
    'はっかい',
    null,
    'じゅっかい',
  ],
  円: [
    null,
    null,
    null,
    null,
    'よえん',
  ],
  歳: [
    null,
    'いっさい',
    null,
    null,
    null,
    null,
    null,
    null,
    'はっさい',
    null,
    'じゅっさい',
  ],
  個: [
    null,
    'いっこ',
    null,
    null,
    null,
    null,
    'ろっこ',
    null,
    'はっこ',
    null,
    'じゅっこ',
  ],
  本: [
    'なんぼん',
    'いっぽん',
    null,
    'さんぼん',
    null,
    null,
    'ろっぽん',
    null,
    'はっぽん',
    null,
    'じゅっぽん',
  ],
  冊: [
    null,
    'いっさつ',
    null,
    null,
    null,
    null,
    null,
    null,
    'はっさつ',
    null,
    'じゅっさつ',
  ],
  杯: [
    'なんばい',
    'いっぱい',
    null,
    'さんばい',
    null,
    null,
    'ろっぱい',
    null,
    'はっぱい',
    null,
    'じゅっぱい',
  ],
};

const getCounterReading = (number, counter) => {
  const _number = SPECIAL_COUNTER_NUMBERS_MAP[number];

  // cant use negivate condition because the 0 is make sense
  if (_number === undefined) {
    return null;
  }

  const _counter = SPECIAL_COUNTER_MAP[counter];
  if (!_counter) {
    return null;
  }

  return _counter[_number];
};


export const ruleCounter = (token) => {
  const result = [];
  for (let i = 0; i < token.length; i++) {
    const curr = token[i];
    if (i >= token.length - 1) {
      result.push(curr);
      continue;
    }

    const next = token[i + 1];
    if (curr.pos_detail_1 !== '数') {
      result.push(curr);
      continue;
    }

    if (next.pos_detail_2 !== '助数詞') {
      result.push(curr);
      continue;
    }

    const reading = getCounterReading(curr.surface_form, next.surface_form);
    if (!reading) {
      result.push(curr);
      continue;
    }

    const replaced = {
      word_id: null,
      word_type: 'KNOWN',
      word_position: curr.word_position,
      surface_form: `${curr.surface_form}${next.surface_form}`,
      pos: '名詞',
      pos_detail_1: '一般',
      pos_detail_2: '*',
      pos_detail_3: '*',
      conjugated_type: '*',
      conjugated_form: '*',
      basic_form: null,
      reading,
      pronunciation: reading,
    };

    result.push(replaced);
    i += 1;
  }

  return result;
};
