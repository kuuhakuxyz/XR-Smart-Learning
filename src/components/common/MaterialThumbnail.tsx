import React from 'react';
import { ModelTemplateId, Subject } from '../../types';

interface MaterialThumbnailProps {
  template: ModelTemplateId;
  subject: Subject;
}

export const MaterialThumbnail: React.FC<MaterialThumbnailProps> = ({ template, subject }) => {
  const bgMap: Record<Subject, string> = {
    Biology: 'from-[#0F172A] via-[#172554] to-[#1E3A8A]',
    Chemistry: 'from-[#0F172A] via-[#1E1B4B] to-[#312E81]',
    Physics: 'from-[#090D16] via-[#172554] to-[#0F172A]',
    Geography: 'from-[#0F172A] via-[#1E293B] to-[#172554]',
  };

  return (
    <div
      className={`relative w-full aspect-[16/10] bg-gradient-to-br ${bgMap[subject]} overflow-hidden flex items-center justify-center`}
    >
      {/* Subtle blueprint grid lines */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${template}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#93C5FD" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${template})`} />
      </svg>

      {/* Template-specific crisp scientific vector illustration */}
      {template === 'human-heart' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <path
            d="M84 22 C84 10, 108 10, 108 26 L108 40"
            fill="none"
            stroke="#EF4444"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M72 34 L72 18 M72 24 L56 20 M72 24 L92 20"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M62 46 C46 46, 44 78, 76 102 C104 92, 118 66, 106 46 C96 34, 74 34, 62 46 Z"
            fill="#DC2626"
            stroke="#FCA5A5"
            strokeWidth="1.5"
          />
          <path
            d="M62 46 C48 48, 48 76, 74 96 L78 50 Z"
            fill="#2563EB"
            opacity="0.88"
          />
          <circle cx="92" cy="64" r="3" fill="#FFFFFF" />
          <circle cx="64" cy="64" r="3" fill="#FFFFFF" />
          <circle cx="96" cy="18" r="3" fill="#FFFFFF" />
        </svg>
      )}

      {template === 'human-skeleton' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <circle cx="90" cy="24" r="12" fill="#F1ECE1" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="87" y="36" width="6" height="44" rx="2" fill="#E2E8F0" />
          <ellipse cx="90" cy="52" rx="20" ry="14" fill="none" stroke="#F1ECE1" strokeWidth="3" />
          <line x1="72" y1="48" x2="108" y2="48" stroke="#F1ECE1" strokeWidth="2.5" />
          <line x1="72" y1="56" x2="108" y2="56" stroke="#F1ECE1" strokeWidth="2.5" />
          <path d="M74 78 Q90 88 106 78" fill="none" stroke="#F1ECE1" strokeWidth="4" strokeLinecap="round" />
          <line x1="78" y1="82" x2="74" y2="108" stroke="#F1ECE1" strokeWidth="4" strokeLinecap="round" />
          <line x1="102" y1="82" x2="106" y2="108" stroke="#F1ECE1" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}

      {template === 'human-cell' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <ellipse cx="90" cy="62" rx="54" ry="38" fill="#0EA5E9" fillOpacity="0.22" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="90" cy="60" r="16" fill="#6366F1" stroke="#A5B4FC" strokeWidth="1.5" />
          <circle cx="90" cy="60" r="6" fill="#312E81" />
          <ellipse cx="122" cy="56" rx="10" ry="5" transform="rotate(-25 122 56)" fill="#EA580C" />
          <ellipse cx="60" cy="70" rx="9" ry="5" transform="rotate(20 60 70)" fill="#10B981" />
          <path d="M68 42 Q84 32 104 38" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}

      {template === 'water-molecule' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <line x1="90" y1="46" x2="54" y2="82" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          <line x1="90" y1="46" x2="126" y2="82" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="90" cy="46" r="20" fill="#DC2626" stroke="#FCA5A5" strokeWidth="1.5" />
          <circle cx="54" cy="82" r="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="126" cy="82" r="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x="90" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">O</text>
          <text x="54" y="86" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">H</text>
          <text x="126" y="86" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">H</text>
          <text x="90" y="96" textAnchor="middle" fill="#93C5FD" fontSize="10" fontFamily="monospace">104.5°</text>
        </svg>
      )}

      {template === 'atomic-structure' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <ellipse cx="90" cy="60" rx="48" ry="18" transform="rotate(28 90 60)" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.7" />
          <ellipse cx="90" cy="60" rx="48" ry="18" transform="rotate(-28 90 60)" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.7" />
          <ellipse cx="90" cy="60" rx="28" ry="28" fill="none" stroke="#93C5FD" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="87" cy="58" r="5" fill="#EF4444" />
          <circle cx="93" cy="58" r="5" fill="#64748B" />
          <circle cx="90" cy="63" r="5" fill="#EF4444" />
          <circle cx="48" cy="37" r="4" fill="#3B82F6" />
          <circle cx="132" cy="83" r="4" fill="#3B82F6" />
          <circle cx="132" cy="37" r="4" fill="#A78BFA" />
        </svg>
      )}

      {template === 'solar-system' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <ellipse cx="90" cy="60" rx="28" ry="11" fill="none" stroke="#475569" strokeWidth="1" />
          <ellipse cx="90" cy="60" rx="46" ry="18" fill="none" stroke="#475569" strokeWidth="1" />
          <ellipse cx="90" cy="60" rx="68" ry="26" fill="none" stroke="#475569" strokeWidth="1" />
          <circle cx="90" cy="60" r="13" fill="#F59E0B" />
          <circle cx="118" cy="60" r="4.5" fill="#3B82F6" />
          <circle cx="52" cy="48" r="7" fill="#D97706" />
          <g transform="translate(148, 48)">
            <ellipse cx="0" cy="0" rx="13" ry="4" transform="rotate(-18)" fill="none" stroke="#FEF08A" strokeWidth="2" />
            <circle cx="0" cy="0" r="6" fill="#EAB308" />
          </g>
        </svg>
      )}

      {template === 'earth-layers' && (
        <svg viewBox="0 0 180 120" className="w-40 h-28 relative z-10" aria-hidden="true">
          <circle cx="90" cy="60" r="42" fill="#1D4ED8" />
          <path d="M58 46 Q74 36 80 54 Q66 64 56 56 Z" fill="#16A34A" />
          <path d="M90 60 L90 18 A42 42 0 0 1 132 60 Z" fill="#B91C1C" />
          <path d="M90 60 L90 32 A28 28 0 0 1 118 60 Z" fill="#F97316" />
          <path d="M90 60 L90 46 A14 14 0 0 1 104 60 Z" fill="#FEF08A" />
        </svg>
      )}

      <span className="absolute bottom-2.5 right-3 text-[11px] font-mono text-blue-200/80 tracking-wide">
        Interactive 3D / AR
      </span>
    </div>
  );
};
