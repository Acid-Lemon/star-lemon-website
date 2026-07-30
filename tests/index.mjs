import assert from 'node:assert/strict';
import { splitContentByVideo } from '../lib/video-embed.ts';

const [space] = splitContentByVideo('https://space.bilibili.com/43276908');
assert.equal(space.type, 'bilibili-space', 'Bilibili space links should render as profile cards');
assert.equal(space.mid, '43276908');

const [spaceWithPath] = splitContentByVideo('https://space.bilibili.com/43276908/dynamic?spm_id_from=333.999.0.0');
assert.equal(spaceWithPath.type, 'bilibili-space');
assert.equal(spaceWithPath.mid, '43276908', 'Only the numeric UID should be sent to the profile API');

const [plainText] = splitContentByVideo('今天没有分享链接');
assert.equal(plainText.type, 'text', 'Ordinary moment text must stay unchanged');

console.log('All tests passed');
