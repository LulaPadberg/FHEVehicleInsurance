import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PolicyForm } from '@/components/insurance/PolicyForm';
import { ClaimForm } from '@/components/insurance/ClaimForm';
import { TransactionList } from '@/components/insurance/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Secure Insurance Platform
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Privacy-preserving vehicle insurance powered by Fully Homomorphic Encryption
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-sm font-medium text-purple-300">
                🔒 FHE Encrypted
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-sm font-medium text-green-300">
                ✓ Blockchain Secured
              </span>
            </div>
          </div>

          {/* Glass Card Container */}
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="policy" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1.5">
                <TabsTrigger
                  value="policy"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
                >
                  Create Policy
                </TabsTrigger>
                <TabsTrigger
                  value="claim"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
                >
                  Submit Claim
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="policy" className="mt-8">
                <PolicyForm />
              </TabsContent>

              <TabsContent value="claim" className="mt-8">
                <ClaimForm />
              </TabsContent>

              <TabsContent value="history" className="mt-8">
                <TransactionList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
