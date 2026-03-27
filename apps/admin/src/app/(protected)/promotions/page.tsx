'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEnvironment } from '@/context/EnvironmentContext'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// ─── Types ──────────────────────────────────────────────────────────────────

interface StripeCoupon {
  name: string | null
  amountOff: number | null
  percentOff: number | null
  currency: string | null
  duration: string
  durationInMonths: number | null
  timesRedeemed: number
  valid: boolean
}

interface PromoCode {
  id: string
  code: string
  name: string
  stripeCouponId: string
  isActive: boolean
  createdAt: string
  coupon: StripeCoupon | null
}

interface PromoStats {
  total: number
  active: number
  totalRedemptions: number
}

interface Referral {
  id: string
  creditApplied: boolean
  creditAmountCents: number | null
  createdAt: string
  creditedAt: string | null
  referrerName: string | null
  referrerPhone: string | null
  referrerCode: string | null
  refereeName: string | null
  refereePhone: string | null
}

interface ReferralStats {
  total: number
  credited: number
  pending: number
  totalCreditsCents: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDiscount(coupon: StripeCoupon | null): string {
  if (!coupon) return '—'
  if (coupon.percentOff) return `${coupon.percentOff}% off`
  if (coupon.amountOff) return `$${(coupon.amountOff / 100).toFixed(2)} off`
  return '—'
}

function formatDuration(coupon: StripeCoupon | null): string {
  if (!coupon) return '—'
  if (coupon.duration === 'once') return 'Once'
  if (coupon.duration === 'forever') return 'Forever'
  if (coupon.duration === 'repeating' && coupon.durationInMonths) {
    return `${coupon.durationInMonths} month${coupon.durationInMonths > 1 ? 's' : ''}`
  }
  return coupon.duration
}

function formatDate(ts: number | string): string {
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  if (phone.length === 12 && phone.startsWith('+1')) {
    return `(${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`
  }
  return phone
}

// ─── Promo Codes Tab ────────────────────────────────────────────────────────

function PromoCodesTab() {
  const { mode } = useEnvironment()
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [stats, setStats] = useState<PromoStats>({ total: 0, active: 0, totalRedemptions: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/promotions')
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to fetch')
      setCodes(result.data.codes)
      setStats(result.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promotion codes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes, mode])

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id)
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'PATCH' })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message)
      fetchCodes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate')
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Codes</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{stats.active}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Redemptions</p>
              <p className="text-2xl font-semibold">{stats.totalRedemptions}</p>
            </Card>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>Create Promo Code</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Discount</th>
                <th className="px-4 py-3 text-left font-medium">Duration</th>
                <th className="px-4 py-3 text-left font-medium">Redemptions</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No promotion codes yet
                  </td>
                </tr>
              ) : (
                codes.map((pc) => (
                  <tr key={pc.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{pc.code}</td>
                    <td className="px-4 py-3">{pc.name}</td>
                    <td className="px-4 py-3">{formatDiscount(pc.coupon)}</td>
                    <td className="px-4 py-3">{formatDuration(pc.coupon)}</td>
                    <td className="px-4 py-3">{pc.coupon?.timesRedeemed ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={pc.isActive ? 'default' : 'secondary'}>
                        {pc.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(pc.createdAt)}</td>
                    <td className="px-4 py-3">
                      {pc.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(pc.id)}
                          disabled={deactivatingId === pc.id}
                        >
                          {deactivatingId === pc.id ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Dialog */}
      <CreatePromoDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => { setShowCreate(false); fetchCodes() }}
      />
    </div>
  )
}

// ─── Create Promo Dialog ────────────────────────────────────────────────────

function CreatePromoDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    discountType: 'percent_off' as 'amount_off' | 'percent_off',
    amount: '',
    duration: 'once' as 'once' | 'repeating' | 'forever',
    durationInMonths: '',
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          discountType: form.discountType,
          amount: form.amount,
          duration: form.duration,
          ...(form.duration === 'repeating' && form.durationInMonths && {
            durationInMonths: parseInt(form.durationInMonths, 10),
          }),
        }),
      })

      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message)

      setForm({
        code: '', name: '', discountType: 'percent_off', amount: '',
        duration: 'once', durationInMonths: '',
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promotion code')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogDescription>
            Creates a coupon in Stripe and a promo code in the database.
            Share via gymtext.co/r/CODE or customers can enter it at checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="SUMMER50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Summer 50% Off"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v) => setForm({ ...form, discountType: v as 'amount_off' | 'percent_off' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent_off">Percentage</SelectItem>
                  <SelectItem value="amount_off">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                {form.discountType === 'percent_off' ? 'Percent Off' : 'Amount Off ($)'}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={form.discountType === 'percent_off' ? '50' : '19.99'}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={form.duration}
                onValueChange={(v) => setForm({ ...form, duration: v as 'once' | 'repeating' | 'forever' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="repeating">Repeating</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.duration === 'repeating' && (
              <div className="space-y-2">
                <Label htmlFor="durationInMonths">Months</Label>
                <Input
                  id="durationInMonths"
                  type="number"
                  placeholder="3"
                  value={form.durationInMonths}
                  onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.code || !form.name || !form.amount}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────

function ReferralsTab() {
  const { mode } = useEnvironment()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats>({ total: 0, credited: 0, pending: 0, totalCreditsCents: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/referrals')
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to fetch')
      setReferrals(result.data.referrals)
      setStats(result.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch referrals')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchReferrals() }, [fetchReferrals, mode])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Credits Applied</p>
              <p className="text-2xl font-semibold">{stats.credited}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-semibold">
                ${(stats.totalCreditsCents / 100).toFixed(2)}
              </p>
            </Card>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Referrer</th>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Referee</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Credit</th>
                <th className="px-4 py-3 text-left font-medium">Referred</th>
                <th className="px-4 py-3 text-left font-medium">Credited</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No referrals yet
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>{r.referrerName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{formatPhone(r.referrerPhone)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.referrerCode || '—'}</td>
                    <td className="px-4 py-3">
                      <div>{r.refereeName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{formatPhone(r.refereePhone)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.creditApplied ? 'default' : 'secondary'}>
                        {r.creditApplied ? 'Credited' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.creditAmountCents
                        ? `$${(r.creditAmountCents / 100).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">{r.creditedAt ? formatDate(r.creditedAt) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <AdminHeader
          title="Promotions"
          subtitle="Manage promo codes and view referral activity"
        />

        <Tabs defaultValue="promo-codes">
          <TabsList>
            <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="promo-codes">
            <PromoCodesTab />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
