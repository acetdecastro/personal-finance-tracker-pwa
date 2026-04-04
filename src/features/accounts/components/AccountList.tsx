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
}

export function AccountList({ accounts }: AccountListProps) {
  return (
    <div className="space-y-2">
      {accounts.map((account) => {
        const Icon = ACCOUNT_ICONS[account.type]
        return (
          <div
            key={account.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-zinc-900"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
              <Icon className="size-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {account.name}
              </p>
              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                {account.type}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatPhpCurrency(account.initialBalance)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
