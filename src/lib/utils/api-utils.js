// src/lib/utils/api-utils.js
import axios from 'axios';

export const sendLocaleJson = async (base, originalLang, translateLang) => {
  const payload = {
    base,
    language: originalLang,
    translate: translateLang
  };
  const res = await axios.post('/api/translate', payload);
  return res.data;
};
