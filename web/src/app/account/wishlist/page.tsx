'use client';
import Link from 'next/link';
import { Heart, Zap } from 'lucide-react';

export default function WishlistPage() {
    return (
        <section className="tactical-wishlist">
            <header className="page-header">
                <div>
                    <h1>
                        Tactical <span className="text-primary">Collection</span>
                    </h1>
                    <p>Track high-performance components for your next build.</p>
                </div>
            </header>

            <div className="void-container">
                <div className="void-orb">
                    <Heart size={48} className="void-icon" />
                </div>
                <div className="void-content">
                    <h3>Empty Collection</h3>
                    <p>
                        You haven't bookmarked any specialized parts yet.
                        Explore our verified manufacturer network to find what fits.
                    </p>
                    <Link href="/" className="explore-btn">
                        <Zap size={20} />
                        Explore Catalog
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .tactical-wishlist {
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

        .void-container {
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 48px;
          padding: 100px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 40px 100px rgba(0,0,0,0.05);
        }

        .void-orb {
          width: 120px;
          height: 120px;
          background: rgba(255, 140, 0, 0.1);
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          box-shadow: 0 0 30px rgba(255, 140, 0, 0.1);
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .void-icon {
          filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.5));
        }

        .void-content h3 {
          font-size: 2rem;
          font-weight: 950;
          margin: 0 0 16px;
          letter-spacing: -1px;
        }

        .void-content p {
          max-width: 500px;
          margin: 0 auto 40px;
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 20px 48px;
          background: var(--color-primary);
          color: white;
          text-decoration: none;
          border-radius: 20px;
          font-weight: 900;
          font-size: 1.1rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 15px 35px rgba(255, 140, 0, 0.25);
        }

        .explore-btn:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 45px rgba(255, 140, 0, 0.35);
        }

        @media (max-width: 600px) {
          .void-container {
            padding: 60px 24px;
            border-radius: 32px;
          }
          .void-orb {
            width: 80px;
            height: 80px;
            border-radius: 24px;
          }
          .explore-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </section>
    );
}
