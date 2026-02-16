// Currency formatter for Indonesian Rupiah

export function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatRupiahShort(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}
