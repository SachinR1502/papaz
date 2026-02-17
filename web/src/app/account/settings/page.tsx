'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [name, setName] = useState(user?.profile?.fullName || user?.name || '');
    const [email, setEmail] = useState(user?.profile?.email || user?.email || '');
    const [phone, setPhone] = useState(user?.profile?.phone || user?.phoneNumber || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Security identity updated');
        if (login && user) {
            login(localStorage.getItem('auth_token') || '', {
                ...user,
                profile: { ...user.profile, fullName: name, email, phone },
                name: name,
                email: email,
                phoneNumber: phone
            });
        }
    };

    return (
        <section className="profile-settings">
            <header className="page-header">
                <div>
                    <h1>
                        Profile <span className="text-primary">Integrity</span>
                    </h1>
                    <p>Manage your core credentials and technical verification details.</p>
                </div>
            </header>

            <div className="settings-orb">
                <form onSubmit={handleSave} className="settings-form">
                    <div className="section-title">
                        <div className="title-bar"></div>
                        <h3>Identity Synchronization</h3>
                    </div>

                    <div className="input-grid">
                        <div className="input-field">
                            <label>Legal Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Encrypted Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Technical Communication</label>
                            <div className="input-wrapper">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="save-btn">
                            <ShieldCheck size={20} />
                            Sync Security Profile
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .profile-settings {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          margin-bottom: 48px;
        }

        h1 {
          font-size: clamp(2rem, 4vw, 2.6rem);
          font-weight: 950;
          margin: 0;
          letter-spacing: -2px;
        }

        .text-primary {
          color: var(--color-primary);
        }

        p {
          margin: 8px 0 0;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 1.1rem;
        }

        .settings-orb {
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 40px;
          padding: 64px;
          max-width: 900px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .settings-orb::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,140,0,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 48px;
        }

        .title-bar {
          width: 4px;
          height: 28px;
          background: var(--color-primary);
          border-radius: 2px;
          box-shadow: 0 0 10px var(--color-primary);
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .input-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          margin-bottom: 56px;
        }

        .input-field label {
          display: block;
          margin-bottom: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--text-muted);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 20px;
          color: var(--text-muted);
          transition: 0.3s;
        }

        input {
          width: 100%;
          padding: 18px 24px 18px 54px;
          background: rgba(var(--bg-card-rgb), 0.4);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          color: var(--text-body);
          font-size: 1.05rem;
          font-weight: 600;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus {
          border-color: var(--color-primary);
          background: rgba(var(--bg-card-rgb), 0.6);
          box-shadow: 0 0 0 4px rgba(255, 140, 0, 0.1);
        }

        input:focus + .input-icon {
          color: var(--color-primary);
          transform: scale(1.1);
        }

        .form-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 40px;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 48px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 900;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 15px 35px rgba(255, 140, 0, 0.25);
        }

        .save-btn:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 45px rgba(255, 140, 0, 0.35);
        }

        @media (max-width: 768px) {
          .settings-orb {
            padding: 32px;
            border-radius: 32px;
          }
          .input-grid {
            grid-template-columns: 1fr;
          }
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </section>
    );
}
