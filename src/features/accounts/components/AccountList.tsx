import { Landmark, Wallet, Smartphone, Circle } from 'lucide-react'
import type { Account } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'

const ACCOUNT_ICONS = {
  bank: Landmark,
  cash: Wallet,
  ewallet: Smartphone,
  other: Circle,
}

interface AccountListProps {
  accounts: Account[]
  onSelect?: (account: Account) => void
}

export function AccountList({ accounts, onSelect }: AccountListProps) {
  return (
    <div className="space-y-2">
      {accounts.map((account) => {
        const Icon = ACCOUNT_ICONS[account.type]
        return (
          <button
            type="button"
            key={account.id}
            onClick={() => onSelect?.(account)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left transition hover:bg-muted/50"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {account.name}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {account.type}
              </p>
              <p className="text-xs text-muted-foreground/70">
                Buffer {formatPhpCurrency(account.safetyBuffer)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-foreground">
                {formatPhpCurrency(account.initialBalance)}
              </p>
              {onSelect && (
                <p className="text-[11px] font-medium text-primary">
                  Edit
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
