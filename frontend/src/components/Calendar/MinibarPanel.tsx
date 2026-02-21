/**
 * MinibarPanel Component
 * Grid of minibar products for consumption management + consumption history
 */

import React, { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createMinibarConsumption, listConsumptions, deleteConsumption } from '@services/minibar'
import type { MinibarProduct, MinibarConsumption } from '@models/minibar'
import './MinibarPanel.css'

type Props = {
  products: MinibarProduct[]
  reservationId: string | null
  onConsumptionCreated?: (consumption: MinibarConsumption) => void
  onConsumptionDeleted?: (consumptionId: string) => void
  onProductsChange?: (products: MinibarProduct[]) => void
}

export default function MinibarPanel({
  products,
  reservationId,
  onConsumptionCreated,
  onConsumptionDeleted,
  onProductsChange,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<MinibarProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Consumptions history
  const [showHistory, setShowHistory] = useState(false)
  const [consumptions, setConsumptions] = useState<MinibarConsumption[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  // Load consumptions when history is toggled on
  useEffect(() => {
    if (showHistory && reservationId) {
      loadConsumptionHistory()
    }
  }, [showHistory, reservationId])

  // Recarregar histórico quando um consumo é adicionado
  useEffect(() => {
    if (showHistory && reservationId) {
      loadConsumptionHistory()
    }
  }, [])

  const loadConsumptionHistory = async () => {
    if (!reservationId) return
    try {
      setHistoryLoading(true)
      setHistoryError('')
      const data = await listConsumptions(reservationId)
      setConsumptions(data)
    } catch (err: any) {
      setHistoryError(err.message || 'Erro ao carregar histórico')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleDeleteConsumption = async (consumptionId: string) => {
    try {
      await deleteConsumption(consumptionId)
      // Remover da lista local sem confirm
      setConsumptions((prev) => prev.filter((c) => c.id !== consumptionId))
      // Chamar callback para atualizar parent
      if (onConsumptionDeleted) {
        onConsumptionDeleted(consumptionId)
      }
    } catch (err: any) {
      setHistoryError(err.message || 'Erro ao excluir consumo')
    }
  }

  const getProductPrice = (product: MinibarProduct): number => {
    return product.price || product.price_per_unit || 0
  }

  const getConsumptionTotal = (consumption: MinibarConsumption, products: MinibarProduct[]): number => {
    if (consumption.total_price && consumption.total_price > 0) {
      return consumption.total_price
    }
    
    let unitPrice = consumption.unit_price || 0
    
    // Se unit_price é 0, busca do produto
    if (unitPrice === 0) {
      const product = products.find((p) => p.id === consumption.product_id)
      unitPrice = product ? getProductPrice(product) : 0
    }
    
    return unitPrice * consumption.quantity
  }

  const handleProductClick = (product: MinibarProduct) => {
    setSelectedProduct(product)
    setQuantity(1)
    setError('')
  }

  const handleAddConsumption = async () => {
    if (!selectedProduct || !reservationId) {
      setError('Produto ou reserva não selecionada')
      return
    }

    try {
      setLoading(true)
      setError('')

      const consumption = await createMinibarConsumption({
        reservation_id: reservationId,
        product_id: selectedProduct.id,
        quantity,
      })

      if (onConsumptionCreated) {
        onConsumptionCreated(consumption)
      }

      // Recarregar histórico se está mostrando
      if (showHistory) {
        loadConsumptionHistory()
      }

      // Atualizar estoque localmente
      if (selectedProduct.stock !== undefined && selectedProduct.stock !== null) {
        const updated = products.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, stock: (p.stock || 0) - quantity }
            : p
        )
        if (onProductsChange) {
          onProductsChange(updated)
        }
      }

      setSelectedProduct(null)
      setQuantity(1)
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedProduct(null)
    setQuantity(1)
    setError('')
  }

  // Modal de consumo
  if (selectedProduct) {
    return (
      <div className="minibar-modal-overlay" onClick={handleCancel}>
        <div className="minibar-modal" onClick={(e) => e.stopPropagation()}>
          <div className="minibar-modal-header">
            <h3>{selectedProduct.name}</h3>
            <button
              type="button"
              className="minibar-modal-close"
              onClick={handleCancel}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <div className="minibar-modal-body">
            {selectedProduct.sku && (
              <div className="minibar-info">
                <span className="label">SKU:</span>
                <span className="value">{selectedProduct.sku}</span>
              </div>
            )}

            <div className="minibar-info">
              <span className="label">Preço:</span>
              <span className="value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(getProductPrice(selectedProduct))}
              </span>
            </div>

            {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
              <div className="minibar-info">
                <span className="label">Estoque:</span>
                <span className="value">{selectedProduct.stock}</span>
              </div>
            )}

            <div className="minibar-quantity">
              <label htmlFor="quantity">Quantidade:</label>
              <div className="minibar-quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={loading || quantity <= 1}
                  className="minibar-quantity-button"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={loading}
                  className="minibar-quantity-input"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={loading}
                  className="minibar-quantity-button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="minibar-total">
              <span className="label">Total:</span>
              <span className="value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(getProductPrice(selectedProduct) * quantity)}
              </span>
            </div>

            {error && (
              <div className="minibar-error-message">
                {error}
              </div>
            )}
          </div>

          <div className="minibar-modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddConsumption}
              disabled={loading || !reservationId}
              className="btn btn-primary"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Grid de produtos
  return (
    <div className="minibar-panel">
      {/* Toggle para histórico */}
      <div className="minibar-history-toggle-section">
        <div className="minibar-history-toggle-info">
          <h3 className="minibar-history-toggle-title">Adicionar Consumo</h3>
          {consumptions.length > 0 && (
            <div className="minibar-history-toggle-summary">
              {consumptions.reduce((sum, c) => sum + c.quantity, 0)} item{consumptions.reduce((sum, c) => sum + c.quantity, 0) !== 1 ? 'ns' : ''} •{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(
                consumptions.reduce((sum, c) => {
                  const product = products.find((p) => p.id === c.product_id)
                  const unitPrice = product ? (product.price || product.price_per_unit || 0) : (c.unit_price || 0)
                  return sum + unitPrice * c.quantity
                }, 0)
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className={`minibar-history-toggle-button ${showHistory ? 'active' : ''}`}
        >
          {showHistory ? 'Ocultar Consumo' : 'Ver Consumo'}
        </button>
      </div>

      {/* Grid de produtos para adicionar consumo */}
      <div className="minibar-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="minibar-card"
            onClick={() => handleProductClick(product)}
          >
            <div className="minibar-card-name">{product.name}</div>
            {product.sku && <div className="minibar-card-sku">{product.sku}</div>}
            <div className="minibar-card-price">
              <strong>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(getProductPrice(product))}
              </strong>
            </div>
            {product.stock !== undefined && product.stock !== null && (
              <div className="minibar-card-stock">Estoque: {product.stock}</div>
            )}
          </div>
        ))}
      </div>

      {/* Histórico de consumo */}
      {showHistory && (
        <div className="minibar-history-section">
          <h3 className="minibar-history-title">
            Extrato de Consumo
          </h3>

          {historyLoading ? (
            <div className="minibar-history-loading">
              Carregando histórico...
            </div>
          ) : historyError ? (
            <div className="minibar-history-error">
              {historyError}
            </div>
          ) : consumptions.length === 0 ? (
            <div className="minibar-history-empty">
              Nenhum consumo registrado
            </div>
          ) : (
            <>
              {/* Tabela de consumo */}
              <table className="minibar-history-table">
                <thead>
                  <tr className="minibar-history-table-header-row">
                    <th className="minibar-history-table-header">
                      Data/Hora
                    </th>
                    <th className="minibar-history-table-header">
                      Produto
                    </th>
                    <th className="minibar-history-table-header text-right">
                      Valor Unit.
                    </th>
                    <th className="minibar-history-table-header text-center">
                      Qtd
                    </th>
                    <th className="minibar-history-table-header text-right">
                      Total
                    </th>
                    <th className="minibar-history-table-header text-center">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumptions.map((consumption, index) => {
                    const product = products.find((p) => p.id === consumption.product_id)
                    const productName = product?.name || `Produto ${consumption.product_id}`
                    // Usar preço do produto como source of truth principal
                    const unitPrice = product ? getProductPrice(product) : consumption.unit_price || 0
                    const totalPrice = unitPrice * consumption.quantity

                    return (
                      <tr
                        key={consumption.id}
                        className={`minibar-history-table-row ${index % 2 === 0 ? '' : 'alt'}`}
                      >
                        <td className="minibar-history-table-cell">
                          {consumption.created_at
                            ? format(parseISO(consumption.created_at), 'dd/MM HH:mm', {
                                locale: ptBR,
                              })
                            : '-'}
                        </td>
                        <td className="minibar-history-table-cell">{productName}</td>
                        <td className="minibar-history-table-cell text-right">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(parseFloat(String(unitPrice)) || 0)}
                        </td>
                        <td className="minibar-history-table-cell text-center">
                          {consumption.quantity}
                        </td>
                        <td className="minibar-history-table-cell text-right font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(parseFloat(String(totalPrice)) || 0)}
                        </td>
                        <td className="minibar-history-table-cell text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteConsumption(consumption.id)}
                            className="btn btn-xs btn-danger"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Total */}
              <div className="minibar-history-total">
                <div className="minibar-history-total-label">
                  Total:{' '}
                  <span className="minibar-history-total-amount">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(
                      consumptions.reduce((sum, c) => {
                        const product = products.find((p) => p.id === c.product_id)
                        const unitPrice = product ? getProductPrice(product) : c.unit_price || 0
                        const total = unitPrice * c.quantity
                        return sum + total
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
