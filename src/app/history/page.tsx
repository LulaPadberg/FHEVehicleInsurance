import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TransactionList } from '@/components/insurance/TransactionList';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <History className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground">
                View all your blockchain transactions
              </p>
            </div>
          </div>

          <TransactionList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
