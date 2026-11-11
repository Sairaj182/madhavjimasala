export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

// later to be migrated to proper E.164 format using library like google-libphonenumber