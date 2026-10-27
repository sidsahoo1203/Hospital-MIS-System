// The doctor's unfinished prescription for one appointment: notes plus the
// medicines picked in the store ({ code: quantity }). Kept in sessionStorage so
// it survives moving between the consultation and store pages (and a refresh),
// and disappears when the browser tab is closed.
const key = (appointmentId) => `prescription-draft-${appointmentId}`;
const empty = () => ({ notes: "", cart: {} });

export const loadDraft = (appointmentId) => {
  try {
    return { ...empty(), ...JSON.parse(sessionStorage.getItem(key(appointmentId))) };
  } catch {
    return empty();
  }
};

export const saveDraft = (appointmentId, draft) => {
  try {
    sessionStorage.setItem(key(appointmentId), JSON.stringify(draft));
  } catch {
    // Storage unavailable: the draft still works until the page is left
  }
};

export const clearDraft = (appointmentId) => {
  try {
    sessionStorage.removeItem(key(appointmentId));
  } catch {
    // nothing to clear
  }
};
