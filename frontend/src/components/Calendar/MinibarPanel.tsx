/**
 * MinibarPanel Component
 * Grid of minibar products for consumption management + consumption history
 */

import React, { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createMinibarConsumption, listConsumptions } from '@services/minibar'
import type { MinibarProduct, MinibarConsumption } from '@models/minibar'
import './MinibarPanel.css'

type Props = {
  products: MinibarProduct[]
  reservationId: string | null
  onConsumptionCreated?: (consumption: MinibarConsumption) => void
  onProductsChange?: (products: MinibarProduct[]) => void
}

export default function MinibarPanel({
  products,
  reservationId,
  onConsumptionCreated,
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

  const getProductPrice = (product: MinibarProduct): number => {
    return product.price || product.price_per_unit || 0
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={loading || quantity <= 1}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
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
                  style={{
                    width: '60px',
                    padding: '6px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
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
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginTop: '12px',
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div className="minibar-modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddConsumption}
              disabled={loading || !reservationId}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3182CE',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Adicionar Consumo</h3>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: showHistory ? '#10b981' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showHistory ? 'Ocultar Extrato' : 'Ver Extrato'}
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
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid #fcd34d',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Extrato de Consumo
          </h3>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280' }}>
              Carregando histórico...
            </div>
          ) : historyError ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {historyError}
            </div>
          ) : consumptions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                color: '#9ca3af',
                fontSize: '13px',
              }}
            >
              Nenhum consumo registrado
            </div>
          ) : (
            <>
              {/* Tabela de consumo */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '1px solid #d1d5db',
                    }}
                  >
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      Data/Hora
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      Produto
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      Valor Unit.
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      Qtd
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumptions.map((consumption, index) => {
                    const product = products.find((p) => p.id === consumption.product_id)
                    const productName = product?.name || `Produto ${consumption.product_id}`
                    const unitPrice = consumption.unit_price || product?.price || 0
                    const totalPrice = consumption.total_price || unitPrice * consumption.quantity

                    return (
                      <tr
                        key={consumption.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        }}
                      >
                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                          {consumption.created_at
                            ? format(parseISO(consumption.created_at), 'dd/MM HH:mm', {
                                locale: ptBR,
                              })
                            : '-'}
                        </td>
                        <td style={{ padding: '8px' }}>{productName}</td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                          }}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(unitPrice)}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                          }}
                        >
                          {consumption.quantity}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(totalPrice)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '12px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '4px',
                  borderTop: '2px solid #fcd34d',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  Total:{' '}
                  <span style={{ color: '#d97706' }}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(
                      consumptions.reduce(
                        (sum, c) => sum + (c.total_price || c.unit_price * c.quantity),
                        0
                      )
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
