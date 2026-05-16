import Link from 'next/link';

const NAV = [
  { href: '/',        label: 'Dashboard' },
  { href: '/tokens',  label: 'Tokens'    },
  { href: '/alerts',  label: 'Alerts'    },
];

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-3 flex items-center gap-6">
      <Link href="/" className="text-white font-bold text-lg tracking-tight">
        🛡️ Stellar RugPull Detector
      </Link>
      <div className="flex gap-4 ml-4">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className="text-gray-400 hover:text-white text-sm transition-colors">
            {n.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
