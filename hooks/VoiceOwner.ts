// hooks/VoiceOwner.ts
let currentVoiceOwner: 'home' | 'mic' | null = null;

export const setVoiceOwner = (owner: 'home' | 'mic') => {
  currentVoiceOwner = owner;
};

export const getVoiceOwner = () => currentVoiceOwner;

export const clearVoiceOwner = () => {
  currentVoiceOwner = null;
};
