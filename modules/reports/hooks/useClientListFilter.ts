// ─────────────────────────────────────────
// useClientListFilter
// Search + pagination MURNI di frontend, untuk tabel laporan yang datanya
// datang utuh dari backend tanpa LIMIT/OFFSET (Booking per Resource, Biaya
// per Kendaraan, Utilisasi Kendaraan, Performa Driver) - jumlah barisnya
// dibatasi jumlah resource/driver (puluhan-ratusan), bukan skala tak
// terbatas seperti booking/audit log, jadi paginasi sisi-client cukup dan
// tidak perlu ubah endpoint backend jadi berbayar LIMIT/OFFSET.
// ─────────────────────────────────────────

import { useMemo, useState } from 'react'
import { PAGINATION } from '@/constants'
import type { PaginationMeta } from '@/types'

interface UseClientListFilterOptions<T> {
  /** Field yang dicocokkan pencarian teks (case-insensitive, substring). */
  searchFields: (keyof T)[]
  pageSize?: number
}

export const useClientListFilter = <T>(
  items: T[],
  { searchFields, pageSize = PAGINATION.DEFAULT_LIMIT }: UseClientListFilterOptions<T>,
) => {
  const [search, setSearchRaw] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(q)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  )

  const setSearch = (value: string) => {
    setSearchRaw(value)
    setPage(1)
  }

  const pagination: PaginationMeta = {
    total: filtered.length,
    page: safePage,
    limit: pageSize,
    totalPages,
  }

  return { search, setSearch, page: safePage, setPage, items: paged, pagination }
}
