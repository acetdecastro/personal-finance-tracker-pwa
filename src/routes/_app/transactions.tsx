import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '../../components/layout/route-placeholder'

export const Route = createFileRoute('/_app/transactions')({
  component: TransactionsRoute,
})

function TransactionsRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Transactions"
      title="Transactions page placeholder"
      description="This page is reserved for the transaction list, filters, and future add or edit flows."
    />
  )
}
