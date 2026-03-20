import {
  Utensils,
  Car,
  Home,
  Lightbulb,
  Gamepad2,
  Shirt,
  Heart,
  GraduationCap,
  ShoppingCart,
  Smartphone,
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  Plane,
  Coffee,
  Music,
  Film,
  Dumbbell,
  Stethoscope,
  Baby,
  PawPrint,
  Wrench,
  Fuel,
  CreditCard,
  Building2,
  Wifi,
  Phone,
  Tv,
  BookOpen,
  Cigarette,
  Wine,
  Pizza,
  Bus,
  Train,
  Bike,
  Scissors,
  Sparkles,
  Pill,
  Umbrella,
  Shield,
  Receipt,
  Banknote,
  PiggyBank,
  HandCoins,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

// Mapa de iconos disponibles para categorías
export const categoryIcons: Record<string, LucideIcon> = {
  // Alimentación
  Utensils,
  Coffee,
  Pizza,
  Wine,

  // Transporte
  Car,
  Bus,
  Train,
  Bike,
  Plane,
  Fuel,

  // Hogar
  Home,
  Lightbulb,
  Wifi,
  Tv,
  Wrench,

  // Entretenimiento
  Gamepad2,
  Music,
  Film,

  // Ropa y cuidado personal
  Shirt,
  Scissors,
  Sparkles,

  // Salud
  Heart,
  Stethoscope,
  Pill,
  Dumbbell,

  // Educación
  GraduationCap,
  BookOpen,

  // Compras
  ShoppingCart,
  Gift,

  // Tecnología
  Smartphone,
  Phone,

  // Trabajo e ingresos
  Briefcase,
  Building2,
  TrendingUp,

  // Finanzas
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  HandCoins,
  CircleDollarSign,
  Coins,
  Receipt,

  // Seguros
  Shield,
  Umbrella,

  // Familia
  Baby,
  PawPrint,

  // Vicios
  Cigarette,
};

// Lista de iconos organizados por categoría para el selector
export const iconCategories = [
  {
    name: 'Alimentación',
    icons: ['Utensils', 'Coffee', 'Pizza', 'Wine'],
  },
  {
    name: 'Transporte',
    icons: ['Car', 'Bus', 'Train', 'Bike', 'Plane', 'Fuel'],
  },
  {
    name: 'Hogar',
    icons: ['Home', 'Lightbulb', 'Wifi', 'Tv', 'Wrench'],
  },
  {
    name: 'Entretenimiento',
    icons: ['Gamepad2', 'Music', 'Film'],
  },
  {
    name: 'Personal',
    icons: ['Shirt', 'Scissors', 'Sparkles'],
  },
  {
    name: 'Salud',
    icons: ['Heart', 'Stethoscope', 'Pill', 'Dumbbell'],
  },
  {
    name: 'Educación',
    icons: ['GraduationCap', 'BookOpen'],
  },
  {
    name: 'Compras',
    icons: ['ShoppingCart', 'Gift'],
  },
  {
    name: 'Tecnología',
    icons: ['Smartphone', 'Phone'],
  },
  {
    name: 'Trabajo',
    icons: ['Briefcase', 'Building2', 'TrendingUp'],
  },
  {
    name: 'Finanzas',
    icons: ['Wallet', 'CreditCard', 'Banknote', 'PiggyBank', 'HandCoins', 'CircleDollarSign', 'Coins', 'Receipt'],
  },
  {
    name: 'Seguros',
    icons: ['Shield', 'Umbrella'],
  },
  {
    name: 'Familia',
    icons: ['Baby', 'PawPrint'],
  },
  {
    name: 'Otros',
    icons: ['Cigarette'],
  },
];

// Mapeo de emojis antiguos a iconos de Lucide (para migración)
export const emojiToLucideMap: Record<string, string> = {
  '🍔': 'Utensils',
  '🚗': 'Car',
  '🏠': 'Home',
  '💡': 'Lightbulb',
  '🎮': 'Gamepad2',
  '👕': 'Shirt',
  '🏥': 'Stethoscope',
  '📚': 'GraduationCap',
  '🛒': 'ShoppingCart',
  '📱': 'Smartphone',
  '💰': 'Wallet',
  '💼': 'Briefcase',
  '📈': 'TrendingUp',
  '🎁': 'Gift',
  '💵': 'Banknote',
  '✈️': 'Plane',
  '☕': 'Coffee',
  '🎵': 'Music',
  '🎬': 'Film',
  '💪': 'Dumbbell',
  '❤️': 'Heart',
  '👶': 'Baby',
  '🐾': 'PawPrint',
  '🔧': 'Wrench',
  '⛽': 'Fuel',
  '💳': 'CreditCard',
  '🏢': 'Building2',
  '📡': 'Wifi',
  '📞': 'Phone',
  '📺': 'Tv',
  '📖': 'BookOpen',
};

// Icono por defecto
export const DEFAULT_ICON = 'Receipt';
