import { AuthLayout, AuthSwitchLink, FormField, PasswordField } from "../components/auth";
import { PrimaryButton } from "../components/ui";
import { useRegister } from "../hooks/useRegister";

export default function Register() {
  const f = useRegister();

  return (
    <AuthLayout
      compact
      title="Buat Akun Baru"
      subtitle="Daftar untuk menikmati rekomendasi makanan."
    >
      <FormField
        compact
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        value={f.name}
        onChangeText={f.setName}
        autoCapitalize="words"
      />
      <FormField
        compact
        label="Email"
        placeholder="Masukkan email"
        value={f.email}
        onChangeText={f.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PasswordField
        compact
        label="Password"
        placeholder="Masukkan password"
        value={f.password}
        onChangeText={f.setPassword}
      />
      <PasswordField
        compact
        label="Konfirmasi Password"
        placeholder="Ulangi password"
        value={f.confirmPassword}
        onChangeText={f.setConfirmPassword}
      />

      <PrimaryButton title="Daftar" onPress={f.handleRegister} loading={f.loading} />

      <AuthSwitchLink compact text="Sudah punya akun?" linkText="Login" onPress={f.goLogin} />
    </AuthLayout>
  );
}
