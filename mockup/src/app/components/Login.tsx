import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { LogIn } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Password é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Password deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setErrors({ password: 'Credenciais inválidas' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00CB73]/20 to-[#004E53]/10">
      <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-[#004E53]/10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#004E53] p-3 rounded-lg">
            <LogIn className="text-white" size={32} />
          </div>
        </div>

        <h2 className="text-center mb-2 text-[#004E53] text-4xl font-bold">OPSA</h2>
        <p className="text-center text-[#009889] mb-8 text-base font-medium">
          Sistema de Gestão Empresarial
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-base text-[#009889] hover:text-[#00CB73] font-medium">
            Esqueceu a password?
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-[#004E53]/20 text-center text-sm text-[#004E53]/70">
          <p className="font-medium">Projeto PAP 2025/2026 - 12º IG</p>
          <p>Oleksii, Pedro, Sofia, André</p>
        </div>
      </div>
    </div>
  );
}
