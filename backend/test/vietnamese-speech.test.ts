import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadVietnameseVoice, selectVietnameseVoice } from '../../frontend/src/vietnamese-speech';

const voice = (lang: string, isDefault = false) => ({ lang, default: isDefault }) as SpeechSynthesisVoice;
class Voices extends EventTarget {
  list: SpeechSynthesisVoice[] = [];
  getVoices() {
    return this.list;
  }
  load(list: SpeechSynthesisVoice[]) {
    this.list = list;
    this.dispatchEvent(new Event('voiceschanged'));
  }
}

test('Vietnamese guide chooses vi-VN ahead of the default English voice', () => {
  const vi = voice('vi-VN');
  assert.equal(selectVietnameseVoice([voice('en-US', true), voice('vi'), vi]), vi);
  assert.equal(selectVietnameseVoice([voice('VI_vn')])?.lang, 'VI_vn');
});

test('accepts a Vietnamese language voice but never another language', () => {
  assert.equal(selectVietnameseVoice([voice('en-US', true), voice('vi')])?.lang, 'vi');
  assert.equal(selectVietnameseVoice([voice('en-US', true), voice('fr-FR')]), null);
});

test('loads an already available Vietnamese voice immediately', async () => {
  const synth = new Voices();
  synth.list = [voice('vi-VN')];
  assert.equal(await loadVietnameseVoice(synth, new AbortController().signal), synth.list[0]);
});

test('waits for Vietnamese voices even if English voices arrive first', async () => {
  const synth = new Voices();
  const result = loadVietnameseVoice(synth, new AbortController().signal);
  synth.load([voice('en-US', true)]);
  const vi = voice('vi-VN');
  synth.load([voice('en-US', true), vi]);
  assert.equal(await result, vi);
});

test('times out without falling back to an English voice', async () => {
  const synth = new Voices();
  synth.list = [voice('en-US', true)];
  assert.equal(await loadVietnameseVoice(synth, new AbortController().signal, 5), null);
});

test('stopping during voice loading prevents a delayed voice from being used', async () => {
  const synth = new Voices();
  const run = new AbortController();
  const result = loadVietnameseVoice(synth, run.signal);
  run.abort();
  synth.load([voice('vi-VN')]);
  assert.equal(await result, null);
  assert.equal(await loadVietnameseVoice(synth, run.signal), null);
});
