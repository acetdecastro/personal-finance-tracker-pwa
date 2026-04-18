import { Landmark, Wallet, Smartphone, Circle } from 'lucide-react'
import type { Account } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { AccountRow } from './AccountRow'

const ACCOUNT_ICONS = {
  bank: Landmark,
  cash: Wallet,
  ewallet: Smartphone,
  other: Circle,
}

interface AccountListProps {
  accounts: Account[]
  onSelect?: (account: Account) => void
  balances?: Record<string, number>
}

export function AccountList({
  accounts,
  onSelect,
  balances,
}: AccountListProps) {
  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const Icon = ACCOUNT_ICONS[account.type]
        const balance = balances?.[account.id] ?? account.initialBalance
        return (
          <div
            key={account.id}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={() => onSelect?.(account)}
            onKeyDown={(e) => {
              if (!onSelect) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(account)
              }
            }}
            className="bg-card rounded-2xl p-4 shadow"
          >
            <AccountRow
              label={account.name}
              subLabel={`${account.isArchived ? 'Archived · ' : ''}${account.type.charAt(0).toUpperCase()}${account.type.slice(1)} · Buffer ${formatPhpCurrency(account.safetyBuffer)}`}
              amountLabel={formatPhpCurrency(balance)}
              Icon={Icon}
            />
          </div>
        )
      })}
    </div>
  )
}
