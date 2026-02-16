import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import { Box, Flex, VStack, useDisclosure } from '@chakra-ui/react'
import "./menu.css";

export default function Menu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [tariffOpen, setTariffOpen] = useState(false);
  const { isOpen: drawerOpen, onOpen, onClose } = useDisclosure();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [drawerView, setDrawerView] = useState<'main' | 'settings' | 'tariffs'>('main');
  const topRefs = useRef<Array<HTMLElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }));
  };
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimerOpenRef = useRef<number | null>(null);
  const closeTimerFinanceRef = useRef<number | null>(null);
  const closeTimerTariffRef = useRef<number | null>(null);
  const isTouchRef = useRef<boolean>(false);

  const clearTimer = (ref: { current: number | null } ) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const onTopKeyDown = (e: any, index: number) => {
    const len = topRefs.current.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % len;
      topRefs.current[next]?.focus();
      setFocusedIndex(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + len) % len;
      topRefs.current[prev]?.focus();
      setFocusedIndex(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      topRefs.current[0]?.focus();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      topRefs.current[len - 1]?.focus();
      setFocusedIndex(len - 1);
    } else if (e.key === 'ArrowDown') {
      // open submenu for this index if any and focus first child
      e.preventDefault();
      if (index === 3) { // finance
        setFinanceOpen(true);
        const submenu = menuRef.current?.querySelector('.menu-entry:nth-child(4) .submenu a') as HTMLElement | null;
        submenu?.focus();
      }
      if (index === 4) { // settings
        setOpen(true);
        const submenu = menuRef.current?.querySelector('.menu-entry:nth-child(5) .submenu a') as HTMLElement | null;
        submenu?.focus();
      }
    }
  };

  const setCloseTimer = (ref: { current: number | null }, setter: (v: boolean) => void, ms = 150) => {
    clearTimer(ref);
    // @ts-ignore window.setTimeout returns number in browser
    ref.current = window.setTimeout(() => {
      setter(false);
      ref.current = null;
    }, ms);
  };

  useEffect(() => {
    // detect touch devices to change interaction patterns
    try {
      isTouchRef.current = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
    } catch (err) {
      isTouchRef.current = false;
    }
    function onDocClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setOpen(false);
        setFinanceOpen(false);
        setTariffOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, []);

  const openDrawer = () => {
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    setDrawerView('main');
    onOpen();
  };

  const closeDrawer = () => {
    onClose();
    setExpandedSections({});
    setDrawerView('main');
    if (previousActiveRef.current) previousActiveRef.current.focus();
  };

  // prevent background scrolling on touch devices while a menu panel is open
  useEffect(() => {
    if (!isTouchRef.current) return;
    const anyOpen = open || financeOpen || tariffOpen || drawerOpen;
    const previous = document.body.style.overflow;
    if (anyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previous || '';
    }
    return () => { document.body.style.overflow = previous || ''; };
  }, [open, financeOpen, tariffOpen, drawerOpen]);

  // focus management + keyboard handling for mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = previousActiveRef.current;
    // focus the first focusable element inside the drawer
    const container = menuRef.current?.querySelector('.mobile-drawer') as HTMLElement | null;
    const focusable = container ? Array.from(container.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')) as HTMLElement[] : [];
    const first = focusable[0] || null;
    const last = focusable[focusable.length - 1] || null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key === 'Tab' && focusable.length > 0) {
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || active === container) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // next tick focus
    setTimeout(() => { first?.focus(); }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      // restore previous focus
      if (prev) prev.focus();
    };
  }, [drawerOpen]);

  return (
    <Box as="nav" className="app-menu horizontal" ref={menuRef}>
      <Flex align="center" gap={3}>
        {/* Mobile hamburger: visible via CSS only on small screens */}
        <Box
          className="mobile-hamburger"
          as="button"
          type="button"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={openDrawer}
          onTouchStart={(e) => { e.preventDefault(); openDrawer(); }}
          ref={(el) => (topRefs.current[0] = el)}
          tabIndex={focusedIndex === 0 ? 0 : -1}
          onFocus={() => setFocusedIndex(0)}
        >
          ☰
        </Box>
        <NavLink to="/" end className="menu-link" ref={(el) => (topRefs.current[1] = el)} tabIndex={focusedIndex === 1 ? 0 : -1} onFocus={() => setFocusedIndex(1)} onKeyDown={(e) => onTopKeyDown(e, 1)}>{t('menu.calendar')}</NavLink>
        <NavLink to="/reservas/list" end className="menu-link" style={{ marginLeft: 6 }} ref={(el) => (topRefs.current[2] = el)} tabIndex={focusedIndex === 2 ? 0 : -1} onFocus={() => setFocusedIndex(2)} onKeyDown={(e) => onTopKeyDown(e, 2)}>{t('menu.reservations')}</NavLink>

        <Box className="menu-entry"
          onMouseEnter={() => { clearTimer(closeTimerFinanceRef); setFinanceOpen(true); }}
          onMouseLeave={() => setCloseTimer(closeTimerFinanceRef, setFinanceOpen)}
          onClick={() => setFinanceOpen((v) => !v)}
        >
          <Box as="span" className={`menu-link with-chevron ${financeOpen ? 'open' : ''}`} role="button" tabIndex={focusedIndex === 3 ? 0 : -1} ref={(el) => (topRefs.current[3] = el)} onFocus={() => setFocusedIndex(3)} onKeyDown={(e) => onTopKeyDown(e, 3)}
            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFinanceOpen((v) => !v); } }}
          >{t('menu.financial')}<span className="chevron">▾</span></Box>
          {financeOpen && (
            <Box className="submenu" role="menu"><NavLink to="/invoices" role="menuitem">{t('menu.invoices')}</NavLink></Box>
          )}
        </Box>

        <Box className="menu-entry"
          onMouseEnter={() => { clearTimer(closeTimerOpenRef); setOpen(true); }}
          onMouseLeave={() => setCloseTimer(closeTimerOpenRef, setOpen)}
          onClick={() => setOpen((v) => !v)}
        >
          <Box as="span" className={`menu-link with-chevron ${open ? 'open' : ''}`} role="button" tabIndex={focusedIndex === 4 ? 0 : -1} ref={(el) => (topRefs.current[4] = el)} onFocus={() => setFocusedIndex(4)} onKeyDown={(e) => onTopKeyDown(e, 4)}
            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
          >{t('menu.settings')}<span className="chevron">▾</span></Box>
          {open && (
            <VStack align="start" className="submenu" role="menu">
              <NavLink to="/config/propriedade">{t('menu.property')}</NavLink>
              <NavLink to="/config/parceiros">{t('menu.partners')}</NavLink>
              <NavLink to="/minibar">{t('menu.minibar')}</NavLink>
              <NavLink to="/config/minibar/products">{t('menu.products')}</NavLink>
              <NavLink to="/config/bloqueios">{t('menu.blocks')}</NavLink>
              <NavLink to="/config/quartos">{t('menu.rooms')}</NavLink>
              <NavLink to="/config/categorias-quartos">{t('menu.roomCategories')}</NavLink>
              <Box className="submenu-group">
                <span className="submenu-title">{t('menu.tariffs')}</span>
                <Box className="submenu-entry"
                  onMouseEnter={() => { clearTimer(closeTimerTariffRef); setTariffOpen(true); }}
                  onMouseLeave={() => setCloseTimer(closeTimerTariffRef, setTariffOpen)}
                >
                  <span
                    className={`submenu-link with-chevron ${tariffOpen ? 'open' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-expanded={tariffOpen}
                    onClick={() => setTariffOpen((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setTariffOpen((v) => !v);
                      } else if (e.key === 'ArrowRight') {
                        setTariffOpen(true);
                      } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
                        setTariffOpen(false);
                      }
                    }}
                  >
                    {t('menu.tariffs')}<span className="chevron">▸</span>
                  </span>
                  {tariffOpen && (
                    <Box className="nested-submenu" role="menu">
                      <NavLink to="/config/tarifario/base" role="menuitem">{t('menu.baseRates')}</NavLink>
                      <NavLink to="/config/tarifario/quartos" role="menuitem">{t('menu.roomRates')}</NavLink>
                      <NavLink to="/config/tarifario/periodos" role="menuitem">{t('menu.periodRates')}</NavLink>
                    </Box>
                  )}
                </Box>
              </Box>
            </VStack>
          )}
        </Box>

        <NavLink to="/search" className="menu-link">{t('menu.search')}</NavLink>
      </Flex>

      {/* Mobile drawer using Chakra */}
      {/* Mobile drawer (simple implementation using CSS) */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={closeDrawer} onTouchStart={closeDrawer}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="mobile-drawer-header">
              <button className="mobile-drawer-close" aria-label="Close menu" onClick={closeDrawer}>✕</button>
            </div>
            <div className="mobile-drawer-body">
              {drawerView === 'main' && (
                <nav>
                  <NavLink to="/" onClick={closeDrawer}>{t('menu.calendar')}</NavLink>
                  <NavLink to="/reservas/list" onClick={closeDrawer}>{t('menu.reservations')}</NavLink>
                  <NavLink to="/search" onClick={closeDrawer}>{t('menu.search')}</NavLink>

                  <div style={{ marginTop: 12 }}>
                    <button className="drawer-section-toggle" onClick={() => setDrawerView('settings')} aria-label={t('menu.settings')}>{t('menu.settings')} <span className="chevron">▸</span></button>
                  </div>
                </nav>
              )}

              {drawerView === 'settings' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="mobile-drawer-close" onClick={() => setDrawerView('main')} aria-label="Back">←</button>
                    <div style={{ fontWeight: 600 }}>{t('menu.settings')}</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <NavLink to="/config/propriedade" onClick={closeDrawer}>{t('menu.property')}</NavLink>
                    <NavLink to="/config/parceiros" onClick={closeDrawer}>{t('menu.partners')}</NavLink>
                    <NavLink to="/minibar" onClick={closeDrawer}>{t('menu.minibar')}</NavLink>
                    <NavLink to="/config/minibar/products" onClick={closeDrawer}>{t('menu.products')}</NavLink>
                    <NavLink to="/config/bloqueios" onClick={closeDrawer}>{t('menu.blocks')}</NavLink>
                    <NavLink to="/config/quartos" onClick={closeDrawer}>{t('menu.rooms')}</NavLink>
                    <NavLink to="/config/categorias-quartos" onClick={closeDrawer}>{t('menu.roomCategories')}</NavLink>

                    <div style={{ marginTop: 8 }}>
                      <button className="drawer-section-toggle" onClick={() => setDrawerView('tariffs')}>{t('menu.tariffs')} <span className="chevron">▸</span></button>
                    </div>
                  </div>
                </div>
              )}

              {drawerView === 'tariffs' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="mobile-drawer-close" onClick={() => setDrawerView('settings')} aria-label="Back">←</button>
                    <div style={{ fontWeight: 600 }}>{t('menu.tariffs')}</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <NavLink to="/config/tarifario/base" onClick={closeDrawer}>{t('menu.baseRates')}</NavLink>
                    <NavLink to="/config/tarifario/quartos" onClick={closeDrawer}>{t('menu.roomRates')}</NavLink>
                    <NavLink to="/config/tarifario/periodos" onClick={closeDrawer}>{t('menu.periodRates')}</NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
