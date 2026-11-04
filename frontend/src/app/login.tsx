import { AuthLayout, AuthSwitchLink, FormField, PasswordField } from "../components/auth";
import { PrimaryButton } from "../components/ui";
import { useLogin } from "../hooks/useLogin";

export default function Login() {
  const f = useLogin();

  return (
    <AuthLayout
      title="Selamat Datang"
      subtitle="Masuk untuk mendapatkan rekomendasi makanan."
    >
      <FormField
        label="Email"
        placeholder="Masukkan email"
        value={f.email}
        onChangeText={f.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PasswordField
        label="Password"
        placeholder="Masukkan password"
        value={f.password}
        onChangeText={f.setPassword}
      />

      <PrimaryButton title="Login" onPress={f.handleLogin} loading={f.loading} />

      <AuthSwitchLink text="Belum punya akun?" linkText="Daftar" onPress={f.goRegister} />
    </AuthLayout>
  );
}
