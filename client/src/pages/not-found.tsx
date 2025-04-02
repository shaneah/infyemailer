import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="w-full flex items-center justify-center p-8">
      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="pt-10 pb-10">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded my-4"></div>
            <p className="mb-6 text-gray-600">
              We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="default">
                <Link href="/">
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/campaigns">
                  View Campaigns
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
