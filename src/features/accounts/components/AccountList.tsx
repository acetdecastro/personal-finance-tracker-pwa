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
}

export function AccountList({ accounts, onSelect }: AccountListProps) {
  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const Icon = ACCOUNT_ICONS[account.type]
        return (
          <AccountRow
            key={account.id}
            className="bg-card p-4 shadow"
            label={account.name}
            subLabel={`${account.isArchived ? 'Archived · ' : ''}${account.type.charAt(0).toUpperCase()}${account.type.slice(1)} · Buffer ${formatPhpCurrency(account.safetyBuffer)}`}
            amountLabel={formatPhpCurrency(account.initialBalance)}
            Icon={Icon}
            onPress={onSelect ? () => onSelect(account) : undefined}
          />
        )
      })}
    </div>
  )
}
