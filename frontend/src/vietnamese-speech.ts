export const GUIDE_LANGUAGE = 'vi-VN';

type VoiceLanguage = { lang: string; default: boolean };

export function selectVietnameseVoice<T extends VoiceLanguage>(voices: readonly T[]): T | null {
  const vietnamese = voices.filter((voice) => /^vi(?:-|$)/i.test(voice.lang.replaceAll('_', '-')));
  const exact = vietnamese.filter((voice) => voice.lang.replaceAll('_', '-').toLowerCase() === 'vi-vn');
  return (
    exact.find((voice) => voice.default) ??
    exact[0] ??
    vietnamese.find((voice) => voice.default) ??
    vietnamese[0] ??
    null
  );
}

/** Some browsers populate voices only after the first getVoices() call. */
export function loadVietnameseVoice(
  synthesis: Pick<SpeechSynthesis, 'getVoices' | 'addEventListener' | 'removeEventListener'>,
  signal: AbortSignal,
  timeoutMs = 2000,
): Promise<SpeechSynthesisVoice | null> {
  if (signal.aborted) return Promise.resolve(null);
  const available = selectVietnameseVoice(synthesis.getVoices());
  if (available) return Promise.resolve(available);

  return new Promise((resolve) => {
    const finish = (voice: SpeechSynthesisVoice | null) => {
      clearTimeout(timer);
      synthesis.removeEventListener('voiceschanged', onVoicesChanged);
      signal.removeEventListener('abort', onAbort);
      resolve(voice);
    };
    const onVoicesChanged = () => {
      const voice = selectVietnameseVoice(synthesis.getVoices());
      if (voice) finish(voice);
    };
    const onAbort = () => finish(null);
    const timer = setTimeout(() => finish(null), timeoutMs);
    synthesis.addEventListener('voiceschanged', onVoicesChanged);
    signal.addEventListener('abort', onAbort, { once: true });
    onVoicesChanged();
  });
}
