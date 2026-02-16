import "./header.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import LanguageSelector from '@components/LanguageSelector/LanguageSelector'
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@auth/useCurrentUser";
import { logout } from "@api/auth";
import { Box, Flex, Heading, Text, IconButton, Avatar, Button } from '@chakra-ui/react'

type Props = {
  innName: string;
};

function initialsFrom(name?: string | null, email?: string) {
  const source = (name && name.trim()) || email || "";
  if (!source) return "?";
  const parts = source
    .replace(/[^\p{L} ]+/gu, "")
    .trim()
    .split(/\s+/);
  const first = parts[0] || source;
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const initials = `${first[0] || ""}${last[0] || ""}`.toUpperCase();
  return initials || (email ? email[0].toUpperCase() : "?");
}

export default function Header({ innName }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  useShrinkHeader(headerRef);

  const initials = useMemo(() => initialsFrom(user?.name, user?.email), [user]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <Box as="header" className="app-header" ref={headerRef}>
      <Flex className="header-content" align="center" px={4} py={3}>
        <Box>
          <Heading as="h1" size="sm" className="inn-name">{innName}</Heading>
          <Text className="subtitle" fontSize="sm">{t('layout.subtitle')}</Text>
        </Box>

        <Box flex="1" />

        <Flex align="center" gap={3}>
          <ThemeToggle />
          <LanguageSelector />
          <IconButton aria-label="User menu" onClick={() => setMenuOpen((v) => !v)} icon={<Avatar size="sm" name={user?.name || user?.email} /> as any} variant="ghost" />
        </Flex>

        {menuOpen && (
          <Box className="user-menu" role="menu" position="absolute" right={4} top="64px" bg="var(--color-surface)" boxShadow="md" borderRadius="md" p={3}>
            <Box className="user-info" mb={2}>
              <Text className="user-name">{user?.name || user?.email}</Text>
              <Text className="user-email" fontSize="sm" color="var(--color-muted)">{user?.email}</Text>
            </Box>
            <Button size="sm" onClick={onLogout}>{t('layout.logout')}</Button>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => !!localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      aria-label="Alternar tema"
      title="Alternar tema"
      onClick={() => setIsDark(v => !v)}
      style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--color-gray-200)', background: 'transparent', cursor: 'pointer' }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}

// Setup scroll listener to toggle compact header class
export function useShrinkHeader(headerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef?.current;
    // set initial CSS variable for header height based on current position
    const initialSmall = window.scrollY > 0;
    if (initialSmall) {
      header?.classList.add('header--small');
      document.documentElement.style.setProperty('--app-header-height', '40px');
    } else {
      header?.classList.remove('header--small');
      document.documentElement.style.setProperty('--app-header-height', '64px');
    }

    if (!header) return;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 0) {
        header.classList.add('header--small');
        document.documentElement.style.setProperty('--app-header-height', '40px');
      } else {
        // only restore when at the very top
        header.classList.remove('header--small');
        document.documentElement.style.setProperty('--app-header-height', '64px');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as EventListener);
  }, [headerRef]);
}
