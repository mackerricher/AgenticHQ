import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, Recycle, Globe } from "lucide-react";
import { Link } from "wouter";

export default function EcoPledge() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-violet-100 dark:from-green-900 dark:via-blue-900 dark:to-violet-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AgenticHQ
            </Button>
          </Link>
        </div>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200 dark:border-green-400/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-heading gradient-text">Our Eco Pledge</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Committed to sustainable AI and responsible technology
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-400/30">
                <Globe className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="text-lg font-heading text-green-800 dark:text-green-300 mb-2">Carbon Neutral Hosting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All our servers run on 100% renewable energy with verified carbon offsets for any remaining emissions.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl border border-blue-200 dark:border-blue-400/30">
                <Recycle className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="text-lg font-heading text-blue-800 dark:text-blue-300 mb-2">Efficient AI Models</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We optimize our AI workflows to minimize computational waste and use the most energy-efficient models available.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 rounded-xl border border-violet-200 dark:border-violet-400/30">
                <Leaf className="mx-auto mb-4 h-12 w-12 text-violet-600" />
                <h3 className="text-lg font-heading text-violet-800 dark:text-violet-300 mb-2">Green Development</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our development practices prioritize code efficiency, reducing server load and energy consumption.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-6 border border-green-200 dark:border-green-400/30">
              <h3 className="text-xl font-heading text-green-800 dark:text-green-300 mb-4">Our Commitments</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Offset 120% of our carbon emissions through verified reforestation projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Partner with green cloud providers using renewable energy sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                  <span>Continuously optimize our algorithms to reduce computational overhead</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                  <span>Transparent reporting of our environmental impact every quarter</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Together, we can build the future of AI while protecting our planet.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Last updated: January 2025 | Next review: March 2025
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
