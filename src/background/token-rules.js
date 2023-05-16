/* eslint no-unused-vars: 0 */

/* global
ruleFix,
ruleMonth
ruleDate
ruleCounter
rulePurify
*/

import {ruleFix} from './rules/rule-fix.js';
import {ruleMonth} from './rules/rule-month.js';
import {ruleDate} from './rules/rule-date.js';
import {ruleCounter} from './rules/rule-counter.js';
import {rulePurify} from './rules/rule-purify.js';

const tokenRules = [
  ruleFix,
  ruleMonth,
  ruleDate,
  ruleCounter,
  rulePurify,
];

export const rebulidToken = (token) =>
  tokenRules.reduce((ret, rule) => rule(ret), token);
