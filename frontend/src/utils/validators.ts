type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Mengembalikan pesan error, atau null jika semua valid.
export function validateRegister(v: RegisterInput): string | null {
  if (!v.name.trim() || !v.email.trim() || !v.password || !v.confirmPassword) {
    return "Semua kolom harus diisi.";
  }
  if (v.password !== v.confirmPassword) return "Konfirmasi password tidak sama.";
  if (v.name.trim().length < 2) return "Nama minimal 2 karakter.";
  if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(v.email.trim())) {
    return "Format email tidak valid, contoh: nama@gmail.com.";
  }
  if (v.password.length < 8) return "Password minimal 8 karakter.";
  return null;
}
