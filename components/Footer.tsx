'use client';

import { useI18n } from '@/lib/i18n';
import { AdSlot } from '@/components/AdSlot';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-line">
      {/* Footer ad — leaderboard on desktop, rectangle on mobile */}
      <div className="flex justify-center px-4 py-6">
        <div className="lg:hidden">
          <AdSlot type="300x250" />
        </div>
        <div className="hidden lg:block">
          <AdSlot type="728x90" />
        </div>
      </div>

      <p className="px-4 pb-6 text-center text-sm text-fg-3">{t.footer}</p>
    </footer>
  );
}
