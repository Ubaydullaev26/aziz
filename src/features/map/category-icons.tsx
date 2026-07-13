import {
  Landmark,
  Building2,
  UtensilsCrossed,
  Coffee,
  ChefHat,
  Mountain,
  ShoppingBag,
  Moon,
  Music,
  PartyPopper,
  Image as ImageIcon,
  Palette,
  Compass,
  Users,
  Drama,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Landmark,
  Building2,
  UtensilsCrossed,
  Coffee,
  ChefHat,
  Mountain,
  ShoppingBag,
  Moon,
  Music,
  PartyPopper,
  Image: ImageIcon,
  Palette,
  Compass,
  Users,
  Drama,
  Trophy,
};

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Compass;
}
