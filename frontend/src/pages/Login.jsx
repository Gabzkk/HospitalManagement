import React, { useState } from 'react';
import { useAuth, ROLE_DASHBOARDS } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Stethoscope, Eye, EyeOff, Zap } from 'lucide-react';

const getLoginErrorMessage = (err) => {
    if (err?.response?.status === 401) return 'Invalid credentials';
    const apiMessage = err?.response?.data?.error?.message;
    if (apiMessage) return apiMessage;
    if (err?.code === 'ERR_NETWORK') {
        return 'Cannot reach API at http://localhost:3000. Start backend with npm run dev:backend.';
    }
    return 'Login failed. Please try again.';
};

// Demo credentials — real backend users + mock role overrides
const DEMO_CREDS = [
    { role: 'Admin', email: 'admin@hospital.com', pass: 'admin123', mockRole: 'ADMIN', color: 'bg-primary-950' },
    { role: 'Doctor', email: 'doctor1@hospital.com', pass: 'doctor123', mockRole: 'DOCTOR', color: 'bg-blue-700' },
    { role: 'Nurse', email: 'admin@hospital.com', pass: 'admin123', mockRole: 'NURSE', color: 'bg-teal-600' },
    { role: 'HR Staff', email: 'admin@hospital.com', pass: 'admin123', mockRole: 'HR', color: 'bg-purple-700' },
    { role: 'Secretary', email: 'staff1@hospital.com', pass: 'staff123', mockRole: 'SECRETARY', color: 'bg-amber-600' },
    { role: 'Cashier', email: 'admin@hospital.com', pass: 'admin123', mockRole: 'CASHIER', color: 'bg-emerald-600' },
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, mockLogin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedUser = await login(email.trim(), password);
            navigate(ROLE_DASHBOARDS[loggedUser.role] || '/dashboard');
        } catch (err) {
            setError(getLoginErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Instant demo login — no API call, no loading spinner, works without backend
    const handleDemoLogin = (cred) => {
        mockLogin(cred.mockRole);
        navigate(ROLE_DASHBOARDS[cred.mockRole] || '/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
            {/* Background glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary-400 opacity-10 blur-3xl" />
                <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#00C97B] opacity-10 blur-3xl" />
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Logo & Branding */}
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-[#00C97B] flex items-center justify-center shadow-lg mb-4">
                        <Stethoscope className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Medcare</h2>
                    <p className="mt-2 text-sm text-primary-200">
                        Sign in to your hospital management account
                    </p>
                </div>
                
                <Card className="mt-8 backdrop-blur-sm bg-white/95 shadow-elevated border-0">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" role="alert">
                                {error}
                            </div>
                        )}
                        
                        <Input 
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@hospital.com"
                        />

                        <div className="relative">
                            <Input 
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-11"
                            isLoading={loading}
                        >
                            Sign in
                        </Button>
                    </form>
                    
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 text-xs">
                                    Quick Demo Login (click to fill)
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-2">
                            {DEMO_CREDS.map((cred) => (
                                <button
                                    key={cred.role}
                                    type="button"
                                    onClick={() => handleDemoLogin(cred)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all text-left group"
                                >
                                    <div className={`h-7 w-7 rounded-full ${cred.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                                        {cred.role.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700">{cred.role}</span>
                                        <span className="text-xs text-gray-400 ml-2">{cred.email}</span>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Zap className="h-3 w-3" />Instant
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
