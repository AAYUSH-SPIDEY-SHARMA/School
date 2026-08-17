import {
  Award,
  BookOpen,
  Bus,
  Calendar,
  ClipboardList,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Laptop,
  Library,
  LifeBuoy,
  MapPin,
  Music,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Trophy,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icons a card section may use.
 *
 * A curated list rather than the whole Lucide set, for two reasons: the school
 * picks from something browsable instead of guessing icon names, and the bundle
 * only carries icons that can actually appear.
 *
 * Chosen to cover what a school site actually needs — teaching, facilities,
 * safety, transport, arts, sport, admissions.
 */
export const SECTION_ICONS = {
  BookOpen,
  GraduationCap,
  Library,
  FlaskConical,
  Laptop,
  Palette,
  Music,
  Trophy,
  Award,
  Star,
  Sparkles,
  Users,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Bus,
  Utensils,
  MapPin,
  Phone,
  Calendar,
  ClipboardList,
  FileText,
  Compass,
  Landmark,
  LifeBuoy,
} as const satisfies Record<string, LucideIcon>;

export type SectionIconName = keyof typeof SECTION_ICONS;

export const SECTION_ICON_NAMES = Object.keys(SECTION_ICONS) as SectionIconName[];

/** Resolve a stored icon name, falling back rather than crashing the page. */
export function resolveIcon(name: string | undefined): LucideIcon {
  if (name && name in SECTION_ICONS) {
    return SECTION_ICONS[name as SectionIconName];
  }
  return Sparkles;
}
