
import { GOOGLE_SHEET_URL } from '../constants';

export const syncToSheets = async (payload: any) => {
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Ralat sinkronisasi:", err);
  }
};
