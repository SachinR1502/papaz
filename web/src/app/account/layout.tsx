'use client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="account-page-wrapper">

            {/* Ambient Background (Subtle) */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            <Navbar />

            <main className="account-main-area">
                <div className="container">
                    <div className="account-layout-grid">

                        {/* SIDEBAR COLUMN */}
                        <div className="sidebar-column">
                            <AccountSidebar />
                        </div>

                        {/* CONTENT COLUMN */}
                        <div className="content-column animate-fade-in">
                            <div className="content-inner-glass">
                                {children}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />

            <style jsx global>{`
                /* --- BASE PAGE SETUP --- */
                .account-page-wrapper {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-body, #f8f9fa); /* Fallback color */
                    position: relative;
                    overflow-x: hidden;
                }

                .account-main-area {
                    flex: 1;
                    padding-top: 120px; /* Space for fixed Navbar */
                    padding-bottom: 80px;
                    position: relative;
                    z-index: 1;
                }

                .container {
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* --- DESKTOP GRID LAYOUT --- */
                .account-layout-grid {
                    display: grid;
                    /* 280px matches Sidebar width + 1fr for Content */
                    grid-template-columns: 280px 1fr; 
                    gap: 40px;
                    align-items: start; /* Crucial for Sticky Sidebar */
                }

                .sidebar-column {
                    position: sticky;
                    top: 100px; /* offset for navbar */
                    height: fit-content;
                    z-index: 10;
                }

                .content-column {
                    width: 100%;
                    min-width: 0; /* Prevents flex/grid overflow issues */
                }

                /* --- CONTENT GLASS CONTAINER --- */
                .content-inner-glass {
                    /* Clean glass effect */
                    background: rgba(var(--bg-card-rgb, 255, 255, 255), 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--border-color, rgba(0,0,0,0.1));
                    border-radius: 24px;
                    padding: 32px;
                    min-height: 400px;
                }

                /* --- AMBIENT GLOWS --- */
                .ambient-glow {
                    position: fixed;
                    width: 500px;
                    height: 500px;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.05;
                    pointer-events: none;
                    z-index: 0;
                }
                .glow-1 { top: -100px; right: -100px; background: var(--color-primary, orange); }
                .glow-2 { bottom: -100px; left: -100px; background: blue; }
                
                .animate-fade-in {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ========================================= */
                /* RESPONSIVE DESIGN (TABLET & MOBILE)       */
                /* ========================================= */

                @media (max-width: 992px) {
                    .account-layout-grid {
                        display: flex;
                        flex-direction: column; /* Stack vertically */
                        gap: 24px;
                    }

                    .sidebar-column {
                        position: relative; /* Remove sticky on mobile */
                        top: 0;
                        width: 100%;
                        z-index: 20;
                    }

                    .content-inner-glass {
                        padding: 24px 16px; /* Less padding on mobile */
                        border-radius: 16px;
                        background: transparent; /* Remove glass box on mobile for cleaner look */
                        border: none;
                        backdrop-filter: none;
                    }

                    .account-main-area {
                        padding-top: 100px;
                        padding-bottom: 40px;
                    }
                    
                    .container {
                        padding: 0 16px;
                    }
                }
            `}</style>
        </div>
    );
}