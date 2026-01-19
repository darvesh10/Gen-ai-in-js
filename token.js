import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const enc = new Tiktoken(o200k_base);

const userQuery = 'Hey There, I am darvesh';
const tokens = enc.encode(userQuery);

console.log( tokens );

const inputTokens = [25216, 3274, 11, 357, 939, 5653, 3350,  71];
const decoded = enc.decode(inputTokens);
console.log( decoded );