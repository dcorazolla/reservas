import React from 'react'
import { FiCalendar, FiList, FiLogOut } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import './Home.css'

export default function Home() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>{t('common.status.welcome') || 'Bem-vindo'}</h1>
        <p className="home-description">
          {t('home.description') || 'Gerencie suas propriedades, reservas e disponibilidade'}
        </p>
      </div>

      <div className="home-cards">
        <div className="card">
          <div className="card-icon calendar-icon">
            <FiCalendar size={32} />
          </div>
          <div className="card-content">
            <h3 className="card-title">{t('menu.calendar')}</h3>
            <p className="card-description">
              {t('home.calendar_description') || 'Visualize e gerencie suas reservas em um calendário interativo'}
            </p>
          </div>
          <RouterLink to="/calendar" className="card-button calendar-button">
            {t('common.actions.view') || 'Visualizar'}
          </RouterLink>
        </div>

        <div className="card">
          <div className="card-icon reservations-icon">
            <FiList size={32} />
          </div>
          <div className="card-content">
            <h3 className="card-title">{t('menu.reservations')}</h3>
            <p className="card-description">
              {t('home.reservations_description') || 'Gerencie suas reservas com filtros e relatórios'}
            </p>
          </div>
          <button className="card-button reservations-button disabled" disabled>
            {t('common.status.coming_soon') || 'Em breve'}
          </button>
        </div>
      </div>

      <div className="home-footer">
        <button onClick={logout} className="logout-button">
          <FiLogOut size={18} />
          {t('common.actions.logout') || 'Sair'}
        </button>
      </div>
    </div>
  )
}

